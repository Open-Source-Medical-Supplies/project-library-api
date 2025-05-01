drop policy "Enable read access for all users" on "public"."Filters";

alter table "public"."Categories" add column "show_additional_requirements" boolean;

alter table "public"."Categories" add column "show_engineering_requirements" boolean;

alter table "public"."Categories" add column "show_resources" boolean;

alter table "public"."Filters" drop column "label";

alter table "public"."Filters" add column "name" text;

alter table "public"."Projects" add column "additional_links" text;

alter table "public"."Projects" add column "category_name" text;

alter table "public"."Projects" add column "direct_project_link" text;

alter table "public"."Projects" add column "featured" boolean;

alter table "public"."Projects" add column "hide_osms_notes" boolean;

alter table "public"."Projects" add column "show_additional_links_2" boolean;

alter table "public"."Projects" add column "show_project_link" boolean;

alter table "public"."ProjectFilters" add constraint "ProjectFilters_filter_token_fkey" FOREIGN KEY (filter_token) REFERENCES "Filters"(token) not valid;

alter table "public"."ProjectFilters" validate constraint "ProjectFilters_filter_token_fkey";

create policy "Enable insert for authenticated users only"
on "public"."Filters"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."Filters"
as permissive
for select
to anon, service_role
using (true);



