// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'

function tokensFromCommaSeparatedString(
  commaSeparatedString: string,
): string[] {
  if (!commaSeparatedString || commaSeparatedString === '') {
    return [];
  }
  return commaSeparatedString.split(',').map((token) => token.trim());
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  const {
    search,
    categoryTokens: categoryTokensString,
    filterTokens: filterTokensString,
  } = await req.json();

  const categoryTokens = tokensFromCommaSeparatedString(categoryTokensString);
  const filterTokens = tokensFromCommaSeparatedString(filterTokensString);
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')  ?? '';
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let dbQuery = supabase.from('Projects').select('*');

  // Apply filters based on the request parameters
  if (search) {
    const formattedSearch = search.split(' ').join('+');
    dbQuery = dbQuery.textSearch('combined_text', `%${formattedSearch}%`);
  }

  if (categoryTokens.length > 0) {
    const categoryFiltersQuery = supabase
      .from('ProjectFilters')
      .select("*")
      .in('category_token', categoryTokens);

    const { data: categoryFilters } = await categoryFiltersQuery;
    if (categoryFilters?.length && categoryFilters.length > 0) {
      dbQuery = dbQuery
        .in('token', categoryFilters.map(tag => tag.project_token));
    }
  }

  if (filterTokens.length > 0) {
    const projectFiltersQuery = supabase
      .from('ProjectFilters')
      .select("*")
      .in('filter_token', filterTokens);

    const { data: projectFilters } = await projectFiltersQuery;
    if (projectFilters?.length && projectFilters.length > 0) {
      dbQuery = dbQuery
        .in('token', projectFilters.map(tag => tag.project_token));
    }
  }

  const queryData = await dbQuery;
  return new Response(
    JSON.stringify(queryData),
    { 
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200,
    },
  )
});