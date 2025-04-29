// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { WebflowClient } from "npm:webflow-api";

/**
 * Converts top-level object keys that contain hyphens to use underscores
 * @param {Object} obj - The object to process
 * @returns {Object} - A new object with converted keys
 */
function buildUpdateForUpdate(obj: any) {
  const newObj = {};
  
  Object.keys(obj).forEach(key => {
    // Replace hyphens with underscores in the key
    const newKey = key.replace(/-/g, '_');
    
    // Keep the original value without recursive processing
    newObj[newKey] = obj[key];
  });
  
  return newObj;
}

const SlugTableMap = {
  'projects': 'Projects',
  'research-category': 'Categories',
  'filters': 'Filters',
};

const FilterTypeTokenToKey = {
  '9ad9586823cee333e5dcb781df8a84b6': 'SKILL',
  'd88996c5f97ad032c9bb9c50224a8fca': 'TOOL',
  '6e90a40a8cb7ce53ea37ce0e4d37c37e': 'MATERIAL',
}

Deno.serve(async (req) => {
  const { triggerType, payload } = await req.json();

  // Short circuit if the request is not a collection item change.
  if (triggerType !== 'collection_item_changed') {
    return new Response(JSON.stringify({ "message": "noop" }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const accessToken = Deno.env.get('WEBFLOW_ACCESS_TOKEN') ?? '';
  const client = new WebflowClient({ accessToken });
  const collection = await client.collections.get(payload.collectionId);
  const slug = collection?.slug ?? '';
  const slugMapKey = slug as keyof typeof SlugTableMap;
  const tableName = SlugTableMap[slugMapKey];

  if (!tableName) {
    console.error('Collection not found in SlubToTableNameMap');
    return;
  }

  const collectionItem = await client
    .collections
    .items
    .getItem(collection.id, payload.id);

  let { data: supabaseRow } = await supabase
    .from(tableName)
    .select('*')
    .eq('token', collectionItem.id)
    .limit(1)
    .single();

  const queryData = buildUpdateForUpdate(
    collectionItem.fieldData
  )

  if (tableName === 'Filters') {
    const filterTypeLabel = collectionItem.fieldData['type'] ?? '';
    const filterTypeKey = filterTypeLabel as keyof FilterTypeTokenToKey;
    queryData['type'] = FilterTypeTokenToKey[filterTypeKey] ?? 'NONE';
  }

  let associatedFilters = [];
  let associatedCategory = null;
  if (tableName === 'Projects') {
    associatedFilters = queryData['filters'];
    console.log('Project filters', associatedFilters);
    delete queryData['filters'];

    associatedCategory = queryData['category_2'];
    console.log('Project category', associatedCategory);
    delete queryData['category_2'];
  }

  if (supabaseRow) {
    const { data, error } = await supabase
      .from(tableName)
      .update(queryData)
      .eq('token', collectionItem.id);
    console.log('Updated collection item', data, error);
  } else {
    const { data, error } = await supabase
      .from(tableName)
      .insert({
        ...queryData,
        token: collectionItem.id,
      });
    console.log('Inserted collection item', data, error);
  }

  if (tableName === 'Projects') {
    supabaseRow = await supabase
      .from(tableName)
      .select('*')
      .eq('token', collectionItem.id)
      .limit(1)
      .single();

    // TODO: Handle more gracefully instead of
    // deleting and re-inserting all filters
    const deleteResponse = await supabase
      .from('ProjectFilters')
      .delete()
      .eq('project_token', supabaseRow.data.token);

    associatedFilters.forEach(async (filterToken) => {
      const { data, error } = await supabase
        .from('ProjectFilters')
        .insert({
          project_token: supabaseRow.data.token,
          filter_token: filterToken,
        });
      console.log('Inserted project filter', data, error);
    });

    if (associatedCategory) {
      const { data, error } = await supabase
        .from('ProjectFilters')
        .insert({
          project_token: supabaseRow.data.token,
          category_token: associatedCategory,
        });
    }
  }

  // TODO: Consider moving code into a separate function
  // EdgeRuntime.waitUntil(updateCollectionId(payload.collectionId, payload.id));

  return new Response(JSON.stringify({ "message": "update complete" }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
})
