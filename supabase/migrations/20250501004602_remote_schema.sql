alter table "public"."Filters" add column "notes" text;

alter table "public"."Projects" add column "category_2" text;

CREATE UNIQUE INDEX project_filter_uniqueness ON public."ProjectFilters" USING btree (project_token, filter_token);

alter table "public"."ProjectFilters" add constraint "project_filter_uniqueness" UNIQUE using index "project_filter_uniqueness";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.search_projects(p_query text, p_cats text[] DEFAULT '{}'::text[], p_filters text[] DEFAULT '{}'::text[])
 RETURNS SETOF "Projects"
 LANGUAGE sql
 STABLE
AS $function$
  SELECT DISTINCT p.*
  FROM public."Projects" p
  LEFT JOIN public."ProjectFilters" pf
    ON pf.project_token = p.token
  WHERE (
      p_query = ''
      OR p.combined_text @@ plainto_tsquery('english', p_query)
    )
    OR (pf.category_token = ANY(p_cats))
    OR (pf.filter_token  = ANY(p_filters));
$function$
;


