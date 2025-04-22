# Project Library API

This repository contains the source code for the Open Source Medical Supplies Project Library API.

## Overview

This project uses [Supabase](https://supabase.com/) to store the project library data in a Postgresql we that can be easily queried and modified. The project also leverages serverless functions, located in the `supabase/functions` folder. Each function is written in [Deno](https://deno.land/) and deployed through the Supabase Edge Functions framework.

## Linking Project 

```
supabase link --project-ref PROJECT_REF
```

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
  - Used to fetch categories from the database.

- **`sync/`**
  - Used to sync data between Webflow and Supabase. It contains a function that is triggered by a webhook from Webflow.

- **`projects/`**
  - The primary search function for the project library.

- **`filters/`**
  - Fetches filters that are rendered on the frontend search sidebar.

- **`shared/`**
  - `cors.ts`: A small shared utility to insert necessary CORS headers, enabling cross-origin requests.

- **`tests/`**

### 4. Dependency Management
- `package.json` / `package-lock.json`: Standard npm configurations, used for local development.

## Data Models

- `Projects`
- `Categories`
- `ProjectFilters`

## API Endpoints

- `/functions/v1/projects`
- `/functions/v1/categories`
- `/functions/v1/filters`
- `/functions/v1/sync`

## Environment Setup

You will need to setup a couple environment variables to be able to connect to the Supabase platform. You will need to be invited to the Supabase project to get the credentials to pull from the production instance and deploy changes to the functions.

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
   - Pull the latest state of the DB `supabase db pull`.
   - Run `supabase start` to launch Supabase locally.
   - Within each function folder (e.g., `supabase/functions/categories`), you can start the functions `supabase functions serve`.

3. **Testing Functions**:
   - You can test functions locally using `curl` or a tool like Postman.
   ```Shell
   curl --request POST 'http://localhost:54321/functions/v1/END_POINT' \
      --header 'Authorization: Bearer SUPABASE_ANON_KEY' \
      --header 'Content-Type: application/json' \
      --data '{ "ping":"pong" }'
   ```

4. **Connecting other repositories**
    - Starting up Supabase locally will output the connection details needed for testing and performing migrations
    - You can use the variables in the .env files in the [project-library-client](https://github.com/Open-Source-Medical-Supplies/project-library-client) and [project-library-data](https://github.com/Open-Source-Medical-Supplies/project-library-data) repositories.

5. **Deployment**:
   - Deploy functions to your Supabase project:

     ```bash
     supabase functions deploy projects
     supabase functions deploy categories
     ```
   - The functions will be accessible at `https://<your-project>.functions.supabase.co/<function-name>`.

## Contributing

Thanks for your interest in the Open Source Medical Supplies Project Library! If you are interested in contributing, please email use at [info@opensourcemedicalsupplies.org](mailto:info@opensourcemedicalsupplies.org).

1. Fork this repository
2. Create a new branch: `git checkout -b feature/my-new-feature`
3. Make your changes and commit them: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request
