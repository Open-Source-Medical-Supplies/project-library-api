// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { WebflowClient } from "npm:webflow-api";

// --- Types -------------------------------------------------------------

interface WebhookRequest {
  triggerType: 'collection_item_changed' | string;
  payload: {
    collectionId: string;
    id: string;
  };
}

type FieldData = Record<string, unknown>;

const SLUG_TABLE_MAP = {
  projects: 'Projects',
  'research-category': 'Categories',
  filters: 'Filters',
} as const;
type Slug     = keyof typeof SLUG_TABLE_MAP;
type Table    = typeof SLUG_TABLE_MAP[Slug];

const FILTER_TOKEN_MAP = {
  '9ad9586823cee333e5dcb781df8a84b6': 'SKILL',
  'd88996c5f97ad032c9bb9c50224a8fca': 'TOOL',
  '6e90a40a8cb7ce53ea37ce0e4d37c37e': 'MATERIAL',
} as const;
type FilterToken    = keyof typeof FILTER_TOKEN_MAP;
type FilterTypeKey  = typeof FILTER_TOKEN_MAP[FilterToken];

// --- Env & Clients ----------------------------------------------------

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBFLOW_TOKEN = Deno.env.get('WEBFLOW_ACCESS_TOKEN')!;

if (!SUPABASE_URL || !SUPABASE_KEY || !WEBFLOW_TOKEN) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or WEBFLOW_ACCESS_TOKEN');
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
const webflow = new WebflowClient({ accessToken: WEBFLOW_TOKEN });

// --- Helpers ----------------------------------------------------------

/** Replace top‑level hyphens in keys with underscores */
function normalizeKeys<T extends FieldData>(obj: T): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    acc[k.replace(/-/g, '_')] = v;
    return acc;
  }, {} as Record<string, unknown>);
}

function mapSlugToTable(slug: string): Table {
  if (!(slug in SLUG_TABLE_MAP)) {
    throw new Error(`Unmapped collection slug: ${slug}`);
  }
  return SLUG_TABLE_MAP[slug as Slug];
}

// --- Core Sync Logic --------------------------------------------------

async function syncCollectionItem(collectionId: string, itemId: string) {
  // 1. Fetch from Webflow
  const { slug } = await webflow.collections.get(collectionId);
  const item     = await webflow.collections.items.getItem(collectionId, itemId);
  if (!slug) throw new Error(`Collection ${collectionId} has no slug`);

  const table = mapSlugToTable(slug);
  let data = normalizeKeys(item.fieldData);

  // 2. Special-case Filters → map the `type` field
  if (table === 'Filters') {
    const rawType = item.fieldData['type'] as FilterToken | undefined;
    data.type = FILTER_TOKEN_MAP[rawType!] ?? 'NONE';
  }

  // 3. For Projects, pull out the `filters` array so we can sync ProjectFilters separately
  let filtersToSync: string[] = [];
  if (table === 'Projects' && Array.isArray(data.filters)) {
    filtersToSync = data.filters as string[];
    delete data.filters;
  }

  // 4. Upsert the main record
  const record = { ...data, token: itemId };
  const { data: upserted, error: upsertError } = await supabase
    .from<Table>(table)
    .upsert(record, { onConflict: 'token' })
    .select()
    .single();

  if (upsertError) {
    console.error(`Failed upserting ${table}`, upsertError);
    throw upsertError;
  }

  // 5. If this was a Project, sync the join table in one shot
  if (table === 'Projects') {
    const projectToken = upserted.token;
    // delete old
    await supabase
      .from('ProjectFilters')
      .delete()
      .eq('project_token', projectToken);

    // bulk‑insert new
    const inserts = filtersToSync.map(ft => ({
      project_token: projectToken,
      filter_token: ft,
    }));
    const { error: pfError } = await supabase
      .from('ProjectFilters')
      .insert(inserts);

    if (pfError) {
      console.error('Failed syncing ProjectFilters', pfError);
      throw pfError;
    }
  }
}

// --- Edge Runtime Handler ---------------------------------------------

Deno.serve(async (req) => {
  try {
    const body = await req.json() as WebhookRequest;

    if (body.triggerType === 'collection_item_changed') {
      const { collectionId, id } = body.payload;
      EdgeRuntime.waitUntil(syncCollectionItem(collectionId, id));
      return new Response(JSON.stringify({ message: 'sync queued' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'noop' }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
