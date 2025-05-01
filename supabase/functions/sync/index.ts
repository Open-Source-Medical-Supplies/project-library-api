// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { WebflowClient } from "npm:webflow-api";

const SLUG_TABLE_MAP = {
  'projects': 'Projects',
  'research-category': 'Categories',
  'filters': 'Filters',
};

const FILTER_TYPE_BY_TOKEN = {
  '9ad9586823cee333e5dcb781df8a84b6': 'SKILL',
  'd88996c5f97ad032c9bb9c50224a8fca': 'TOOL',
  '6e90a40a8cb7ce53ea37ce0e4d37c37e': 'MATERIAL',
}
interface WebflowFile {
  url: string;
  fileId: string;
  name: string;
  mimeType: string;
}

interface QueryData {
  [key: string]: string | number | boolean | object | null | undefined | WebflowFile | string[];
}

/**
 * Converts top-level object keys that contain hyphens to use underscores
 * @param {Object} obj - The object to process
 * @returns {Object} - A new object with converted keys
 */
function buildUpdateForUpdate(tableName: string, obj: QueryData): QueryData {
  const newObj = {} as QueryData;
  Object.keys(obj).forEach(key => {
    const newKey = key.replace(/-/g, '_') as keyof QueryData;
    newObj[newKey] = obj[key];
    if (newKey === 'primary_image') {
      // OVERRIDE THE PRIMARY IMAGE FORMAT
      const file = obj[key] as WebflowFile;
      newObj[newKey] = file.url;
    }
    if (newKey === 'projects') {
      delete newObj[newKey];
    }
  });

  if (tableName === 'Filters') {
    const filterTypeLabel = newObj['type'] ?? '';
    const filterTypeKey = filterTypeLabel as keyof typeof FILTER_TYPE_BY_TOKEN;
    newObj['type'] = FILTER_TYPE_BY_TOKEN[filterTypeKey] ?? 'NONE';
  }
  
  return newObj;
}

function tableForSlug(slug: string) {
  const slugMapKey = slug as keyof typeof SLUG_TABLE_MAP;
  const tableName = SLUG_TABLE_MAP[slugMapKey];
  return tableName;
}

Deno.serve(async (req) => {
  const { triggerType, payload } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
  const accessToken = Deno.env.get('WEBFLOW_ACCESS_TOKEN') ?? '';
  const webflow = new WebflowClient({ accessToken });
  const collectionId = payload.collectionId;
  const itemId = payload.id;
  const defaultResponse = new Response(
    JSON.stringify({ "message": "valid" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  console.log('Received request', triggerType, payload);
  switch (triggerType) {
    case 'collection_item_created': {
      console.log('Collection item created');
      const collection = await webflow.collections.get(collectionId);
      const item = await webflow.collections.items.getItem(collectionId, itemId);
      const tableName = tableForSlug(collection?.slug ?? '');
      const queryData = buildUpdateForUpdate(
        tableName,
        item.fieldData
      );
      const { data, error } = await supabase
        .from(tableName)
        .insert({ ...queryData, token: item.id });
      console.log('Inserted collection item', data, error);
      return defaultResponse;
    }
    case 'collection_item_changed': {
      console.log('Collection item changed');
      const collection = await webflow.collections.get(collectionId);
      const item = await webflow.collections.items.getItem(collectionId, itemId);
      const tableName = tableForSlug(collection?.slug ?? '');
      const queryData = buildUpdateForUpdate(
        tableName,
        item.fieldData,
      );
      
      // Project specific logic
      let associatedFilters = [] as string[];
      let associatedCategory = null;
      if (tableName === 'Projects') {
        associatedFilters = queryData['filters'] as string[];
        console.log('Project filters', associatedFilters);
        delete queryData['filters'];
        associatedCategory = queryData['category_2'];
        delete queryData['category_2'];
      }
      
      const { data, error } = await supabase
        .from(tableName)
        .upsert({ ...queryData, token: item.id }, { onConflict: 'token' })
        .select()
      console.log(`Inserted record into ${tableName}`, data, error);

      if (tableName === 'Projects') {
        const existingProjectFilters = await supabase
          .from('ProjectFilters')
          .select('*')
          .eq('project_token', item.id);
        
        const projectFiltersToDelete = existingProjectFilters.data?.filter((filter) => {
          return !associatedFilters.includes(filter.filter_token);
        });
        console.log('Project filters to delete', projectFiltersToDelete);
        if (projectFiltersToDelete?.length) {
          const deleteResponse = await supabase
            .from('ProjectFilters')
            .delete()
            .eq('project_token', item.id)
            .in('filter_token', projectFiltersToDelete.map((filter) => filter.filter_token));
          console.log('Deleted project filters', deleteResponse);
        }

        associatedFilters?.forEach(async (filterToken) => {
          const { data, error } = await supabase
            .from('ProjectFilters')
            .upsert({ project_token: item.id, filter_token: filterToken }, { onConflict: 'project_token, filter_token' })
            .select();
          console.log('Inserted project filter', data, error);
        });

        if (associatedCategory) {
          const { data, error } = await supabase
            .from('ProjectFilters')
            .upsert({ project_token: item.id, category_token: associatedCategory }, { onConflict: 'project_token, category_token' })
            .select();
          console.log('Inserted record in ProjectsFilter', data, error);
        }
      }
      return defaultResponse;
    }
    case 'collection_item_deleted': {
      console.log('Collection item deleted');
      return defaultResponse;
    }
    default: {
      console.error('Invalid trigger type');
      return new Response(
        JSON.stringify({ "message": "invalid" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
});
