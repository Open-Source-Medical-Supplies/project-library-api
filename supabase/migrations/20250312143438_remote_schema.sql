alter table "public"."Projects" add column "combined_text" tsvector generated always as (to_tsvector('english'::regconfig, ((COALESCE(name, ''''::text) || ' '::text) || COALESCE(description, ''''::text)))) stored;

CREATE INDEX idx_combined_text ON public."Projects" USING gin (combined_text);


