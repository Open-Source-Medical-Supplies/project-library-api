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
function convertHyphensToUnderscores(obj: any) {
  const newObj = {};
  
  Object.keys(obj).forEach(key => {
    // Replace hyphens with underscores in the key
    const newKey = key.replace(/-/g, '_');
    
    // Keep the original value without recursive processing
    newObj[newKey] = obj[key];
  });
  
  return newObj;
}

async function updateCollectionId(collectionId: string, itemId: string) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
  const accessToken = Deno.env.get('WEBFLOW_ACCESS_TOKEN') ?? '';
  const client = new WebflowClient({ accessToken });
  const collection = await client.collections.get(collectionId);
  const collectionItem = await client.collections.items.getItem(collectionId, itemId);
  
  const SlugTableMap = {
    'projects': 'Projects',
    'research-category': 'Categories',
    'tools': 'tools',
    'skills': 'skills',
  }

  const queryData = convertHyphensToUnderscores(
    collectionItem.fieldData
  );

  const tableName = SlugTableMap[collection?.slug as keyof typeof SlugTableMap];

  if (tableName) {
    console.error('Collection not found in SlugTableMap', collection.slug);
    return;
  }

  const { data: supabaseRow } = await supabase
    .from(tableName)
    .select('*')
    .eq('token', itemId)
    .limit(1)
    .single();

  if (supabaseRow) {
    const { data, error } = await supabase
      .from(tableName)
      .update(queryData)
      .eq('token', itemId);
    console.log('Updated collection item', data, error);
  } else {
    const { data, error } = await supabase
      .from(tableName)
      .insert({
        ...queryData,
        token: itemId,
      });
    console.log('Inserted collection item', data, error);
  }
}

Deno.serve(async (req) => {
  const { triggerType, payload } = await req.json();

  if (triggerType === 'collection_item_changed') {
    EdgeRuntime.waitUntil(updateCollectionId(payload.collectionId, payload.id));
  }

  return new Response(JSON.stringify({ "message": "done" }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
})
