// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'

interface Project {
  token: string;
  name: string;
}

interface ProjectFilter {
  project_token: string;
  category_token: string;
  filter_token: string;
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

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')  ?? '';
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Apply filters based on the request parameters
  let searchResultTokens = [] as string[];
  if (search) {
    const formattedSearch = search.split(' ').join('+');
    const { data: searchData, error: searchError } = await supabase
      .from('Projects')
      .select('*')
      .textSearch('combined_text', `%${formattedSearch}%`);   
    console.log('searchData', searchData, searchError);
    if (searchData?.length && searchData.length > 0) {
      searchResultTokens = searchData.map((tag: Project) => tag.token);
    }
  }

  if (categoryTokensString) {
    const categoryTokens = categoryTokensString.split(',');
    const { data: projectFilters } = await supabase
      .from('ProjectFilters')
      .select("*")
      .in('category_token', categoryTokens);

    if (projectFilters?.length && projectFilters.length > 0) {
      const projectTokens = projectFilters.map((tag: ProjectFilter) => tag.project_token);
      searchResultTokens.push(...projectTokens);
    }
  }

  if (filterTokensString) {
    const filterTokens = filterTokensString.split(',');
    const { data: projectFilters } = await supabase
      .from('ProjectFilters')
      .select("*")
      .in('filter_token', filterTokens);

    if (projectFilters?.length && projectFilters.length > 0) {
      const projectTokens = projectFilters.map((tag: ProjectFilter) => tag.project_token);
      searchResultTokens.push(...projectTokens);
    }
  }

  const uniqueTokens = [...new Set(searchResultTokens)];
  const queryData = await supabase
    .from('Projects')
    .select('*')
    .in('token', uniqueTokens);
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
