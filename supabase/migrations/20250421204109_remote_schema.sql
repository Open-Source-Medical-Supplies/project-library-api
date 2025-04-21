drop policy "Enable read access for all users" on "public"."ProjectTags";

drop policy "Enable read access for all users" on "public"."ProjectFilters";

revoke delete on table "public"."ProjectTags" from "anon";

revoke insert on table "public"."ProjectTags" from "anon";

revoke references on table "public"."ProjectTags" from "anon";

revoke select on table "public"."ProjectTags" from "anon";

revoke trigger on table "public"."ProjectTags" from "anon";

revoke truncate on table "public"."ProjectTags" from "anon";

revoke update on table "public"."ProjectTags" from "anon";

revoke delete on table "public"."ProjectTags" from "authenticated";

revoke insert on table "public"."ProjectTags" from "authenticated";

revoke references on table "public"."ProjectTags" from "authenticated";

revoke select on table "public"."ProjectTags" from "authenticated";

revoke trigger on table "public"."ProjectTags" from "authenticated";

revoke truncate on table "public"."ProjectTags" from "authenticated";

revoke update on table "public"."ProjectTags" from "authenticated";

revoke delete on table "public"."ProjectTags" from "service_role";

revoke insert on table "public"."ProjectTags" from "service_role";

revoke references on table "public"."ProjectTags" from "service_role";

revoke select on table "public"."ProjectTags" from "service_role";

revoke trigger on table "public"."ProjectTags" from "service_role";

revoke truncate on table "public"."ProjectTags" from "service_role";

revoke update on table "public"."ProjectTags" from "service_role";

alter table "public"."ProjectFilters" drop constraint "ProjectFilters_filter_id_fkey";

alter table "public"."ProjectFilters" drop constraint "ProjectFilters_filter_id_key";

alter table "public"."ProjectFilters" drop constraint "ProjectFilters_project_id_fkey";

alter table "public"."ProjectFilters" drop constraint "ProjectFilters_project_id_key";

alter table "public"."ProjectTags" drop constraint "ProjectTags_category_token_fkey";

alter table "public"."ProjectTags" drop constraint "ProjectTags_project_token_fkey";

alter table "public"."ProjectFilters" drop constraint "ProjectFilters_pkey";

alter table "public"."ProjectTags" drop constraint "ProjectTags_pkey";

drop index if exists "public"."ProjectFilters_filter_id_key";

drop index if exists "public"."ProjectFilters_pkey";

drop index if exists "public"."ProjectFilters_project_id_key";

drop index if exists "public"."ProjectTags_pkey";

drop table "public"."ProjectTags";

alter table "public"."Filters" alter column "token" set not null;

alter table "public"."ProjectFilters" drop column "filter_id";

alter table "public"."ProjectFilters" drop column "project_id";

alter table "public"."ProjectFilters" add column "category_token" character varying;

alter table "public"."ProjectFilters" add column "filter_token" character varying;

alter table "public"."ProjectFilters" add column "project_token" character varying;

CREATE UNIQUE INDEX "Filters_token_key" ON public."Filters" USING btree (token);

CREATE UNIQUE INDEX "ProjectTags_pkey" ON public."ProjectFilters" USING btree (id);

alter table "public"."ProjectFilters" add constraint "ProjectTags_pkey" PRIMARY KEY using index "ProjectTags_pkey";

alter table "public"."Filters" add constraint "Filters_token_key" UNIQUE using index "Filters_token_key";

alter table "public"."ProjectFilters" add constraint "ProjectTags_category_token_fkey" FOREIGN KEY (category_token) REFERENCES "Categories"(token) not valid;

alter table "public"."ProjectFilters" validate constraint "ProjectTags_category_token_fkey";

alter table "public"."ProjectFilters" add constraint "ProjectTags_project_token_fkey" FOREIGN KEY (project_token) REFERENCES "Projects"(token) not valid;

alter table "public"."ProjectFilters" validate constraint "ProjectTags_project_token_fkey";

create policy "Enable read access for all users"
on "public"."ProjectFilters"
as permissive
for select
to anon, service_role
using (true);



