// Import required libraries and modules
import { assert, assertEquals } from 'https://deno.land/std@0.192.0/testing/asserts.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js'

// Will load the .env file to Deno.env
import 'https://deno.land/x/dotenv@v3.2.2/load.ts'

// Set up the configuration for the Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
}

// Test the creation and functionality of the Supabase client
// const testClientCreation = async () => {
//   var client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options)

//   // Verify if the Supabase URL and key are provided
//   if (!supabaseUrl) throw new Error('supabaseUrl is required.')
//   if (!supabaseKey) throw new Error('supabaseKey is required.')

//   // Test a simple query to the database
//   const { data: table_data, error: table_error } = await client
//     .from('my_table')
//     .select('*')
//     .limit(1)
//   if (table_error) {
//     throw new Error('Invalid Supabase client: ' + table_error.message)
//   }
//   assert(table_data, 'Data should be returned from the query.')
// }

// Test the 'hello-world' function
const testSearch = async () => {
  var client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options)

  // Invoke the 'hello-world' function with a parameter
  const response = await client.functions.invoke('search', {
    body: { name: 'bar' },
  })

  console.log(response);

  

  // Check for errors from the function invocation
  // if (func_error) {
  //   throw new Error('Invalid response: ' + func_error.message)
  // }

  // Log the response from the function
  // console.log(JSON.stringify(func_data, null, 2))

  // Assert that the function returned the expected result
  // assertEquals(func_data.message, 'Hello bar!')
}

// Register and run the tests
Deno.test('Hello-world Function Test', testSearch)