// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  const { search, categoryTokens } = await req.json();
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  let dbQuery = supabase.from('Projects').select('*');
  if (search) {
    const formattedSearch = search.split(' ').join('+');
    dbQuery = dbQuery.textSearch('combined_text', `%${formattedSearch}%`);
  }

  // If category tokens are present.
  if (categoryTokens && categoryTokens !== '') {
    const categoryTokensArray = categoryTokens.split(',');
    const projectFiltersQuery = supabase
      .from('ProjectFilters')
      .select("*")
      .in('category_token', categoryTokensArray);
    const { data: projectFilters } = await projectFiltersQuery;
    if (projectFilters?.length && projectFilters.length > 0) {
      dbQuery = dbQuery
        .in('token', projectFilters.map(tag => tag.project_token));
    }
  }

  const data = await dbQuery;

  return new Response(
    JSON.stringify(data),
    { 
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200,
    },
  )
});