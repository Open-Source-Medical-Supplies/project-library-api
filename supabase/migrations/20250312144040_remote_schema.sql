alter table "public"."Categories" add column "combined_text" tsvector generated always as (to_tsvector('english'::regconfig, ((COALESCE(name, ''''::text) || ' '::text) || COALESCE(problem_statement, ''''::text)))) stored;

CREATE INDEX idx_categories_combined_text ON public."Categories" USING gin (combined_text);


