# Project Library API

This repository contains the source code for the Open Source Medical Supplies Project Library API.

## Overview

This project uses [Supabase](https://supabase.com/) to store the project library data in a Postgresql we that can be easily queried and modified. The project also leverages serverless functions, located in the `supabase/functions` folder. Each function is written in [Deno](https://deno.land/) and deployed through the Supabase Edge Functions framework.

## Project Structure

Below is a description of the structure and purpose of the included files and directories:

### 1. `supabase/config.toml`
Contains configuration for the Supabase environment, including database connection details and other project-specific settings.

### 2. `supabase/migrations/*`
SQL files (or other migration scripts) that help manage and version-control changes to the database schema. For instance:
- `20250227024942_remote_schema.sql` – A database migration script.

### 3. `supabase/functions`
This directory contains Deno-based serverless functions. Each function is a small module that can be called via an HTTP request. Important sub-folders include:

- **`categories/`**
  - `index.ts`: A Supabase edge function that queries the `categories` table in the database. It accepts JSON with optional fields:
    - `search`: A string to filter category names via case-insensitive matching.
    - `categoryTokens`: A comma-separated list of token values. The function will return all categories whose tokens match the provided list.

  - `deno.json`: Provides metadata and dependencies for the Deno environment.

- **`search/`**
  - `index.ts`: A simple example function that logs a message and returns a JSON response with a `"message"` field. It shows how to handle a POST request and send a JSON response.

  - `deno.json`: Similar to above, houses metadata for the search function.

- **`sync/`** *(not fully displayed here)*
  - Might be used to synchronize data with another system.

- **`projects/`** *(not fully displayed here)*
  - Another function that can connect to or manage a `projects` table.

- **`shared/`**
  - `cors.ts`: A small shared utility to insert necessary CORS headers, enabling cross-origin requests.

- **`tests/`**
  - `search-test.ts`: Potentially a test suite for the `search` function. This may include an example of how to test edge functions locally.

### 4. Additional files
- `package.json` / `package-lock.json`: Standard npm configurations, possibly used for local development or other scripts.

## Data Models

- `Projects`
- `Categories`
- `ProjectTags`

## API Endpoints

- `/functions/v1/projects`
- `/functions/v1/categories`

## Environment Setup

You will need to setup a couple environment variables to be able to connect to the Supabase platform.

## Syncronized Local DB with Production

The migrations stored in version control in Github are not automatically updated when the DB in production changes right now. To ensure that codebase has a copy of the latest DB schema, you can run the following command:

```bash
supabase db pull
```

## Local DB

To run the Supabase DB locally use the following command:

```bash
supabase start
```

Starting up Supabase locally will output the connection details needed for testing and performing migrations in the [project-library-client](https://github.com/Open-Source-Medical-Supplies/project-library-client) and [project-library-data](https://github.com/Open-Source-Medical-Supplies/project-library-data) repositories.

## Local API

To run the serverless function API locally, you can use the following command:

```bash 
supabase functions serve
```

You can test functions locally using curl by including the Authorization header with the Supabase Anon Key and the Content-Type header with the JSON data. For example:

```Shell
curl --request POST 'http://localhost:54321/functions/v1/END_POINT' \
  --header 'Authorization: Bearer SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{ "ping":"pong" }'
```

## Supabase Configuration

1. **Supabase Configuration**: The `config.toml` file and the migrations in `supabase/migrations` define how the database tables and environment are set up. You can apply these migrations using the Supabase CLI.

2. **Functions**: 
   - Each function is an isolated endpoint that can be deployed by running `supabase functions deploy <function-name>`.
   - Deno automatically reads the `index.ts` file in each function subdirectory as its entry point.
   - Any environment variables (like `SUPABASE_URL` and `SUPABASE_ANON_KEY`) are provided at runtime.

3. **Database Interaction**:
   - The code uses `createClient` from `@supabase/supabase-js`. This allows secure, direct querying of your Supabase PostgreSQL database.
   - For example, the "categories" function filters data by name (matching a user-provided `search` string) or by tokens in the `categoryTokens` field. Results are then returned as JSON.

4. **CORS Support**:
   - `corsHeaders` imported from `cors.ts` helps ensure that cross-domain requests are permitted. If your front-end or other external services call these functions, including these headers is essential.

### Getting Started

1. **Prerequisites**:
   - [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
   - [Deno](https://deno.land/) (optional if you want local dev and testing outside of Supabase CLI tools).

2. **Local Development**:
   - Clone the repository.
   - Run `supabase start` to launch Supabase locally.
   - Apply migrations by doing `supabase db push` (or `supabase migration apply` if you have pending migration files).
   - Within each function folder (e.g., `supabase/functions/categories`), you can run or test your function locally with:

     ```bash
     supabase functions serve categories --env-file=../.env.local
     ```
   - Then send an HTTP request to test (for example):

     ```bash
     curl -i --location --request POST 'http://localhost:54321/functions/v1/categories' \
       --header 'Content-Type: application/json' \
       --data '{"search":"medical","categoryTokens":"food,water"}'
     ```

3. **Deployment**:
   - Deploy functions to your Supabase project:

     ```bash
     supabase functions deploy projects
     supabase functions deploy categories
     ```
   - The functions will be accessible at `https://<your-project>.functions.supabase.co/<function-name>`.

## Example Usage

- **categories/index.ts**: Filters and retrieves category records from the database.
  ```bash
  curl -i --location --request POST 'https://<project>.functions.supabase.co/categories' \
    --header 'Content-Type: application/json' \
    --data '{"search":"tools"}'
  ```

- **search/index.ts**: Returns a personalized message.
  ```bash
  curl -i --location --request POST 'https://<project>.functions.supabase.co/search' \
    --header 'Content-Type: application/json' \
    --data '{"name":"World"}'
  ```

The response might look like:

```json
{
  "message": "Hello World!"
}
```

## Contributing

1. Fork this repository
2. Create a new branch: `git checkout -b feature/my-new-feature`
3. Make your changes and commit them: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

[MIT](LICENSE)

---

*Thank you for using the Open Source Medical Supplies (OSMS) Project Library API!*
