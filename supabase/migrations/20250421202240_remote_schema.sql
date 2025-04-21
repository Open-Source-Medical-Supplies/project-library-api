revoke delete on table "public"."Skills" from "anon";

revoke insert on table "public"."Skills" from "anon";

revoke references on table "public"."Skills" from "anon";

revoke select on table "public"."Skills" from "anon";

revoke trigger on table "public"."Skills" from "anon";

revoke truncate on table "public"."Skills" from "anon";

revoke update on table "public"."Skills" from "anon";

revoke delete on table "public"."Skills" from "authenticated";

revoke insert on table "public"."Skills" from "authenticated";

revoke references on table "public"."Skills" from "authenticated";

revoke select on table "public"."Skills" from "authenticated";

revoke trigger on table "public"."Skills" from "authenticated";

revoke truncate on table "public"."Skills" from "authenticated";

revoke update on table "public"."Skills" from "authenticated";

revoke delete on table "public"."Skills" from "service_role";

revoke insert on table "public"."Skills" from "service_role";

revoke references on table "public"."Skills" from "service_role";

revoke select on table "public"."Skills" from "service_role";

revoke trigger on table "public"."Skills" from "service_role";

revoke truncate on table "public"."Skills" from "service_role";

revoke update on table "public"."Skills" from "service_role";

revoke delete on table "public"."Tools" from "anon";

revoke insert on table "public"."Tools" from "anon";

revoke references on table "public"."Tools" from "anon";

revoke select on table "public"."Tools" from "anon";

revoke trigger on table "public"."Tools" from "anon";

revoke truncate on table "public"."Tools" from "anon";

revoke update on table "public"."Tools" from "anon";

revoke delete on table "public"."Tools" from "authenticated";

revoke insert on table "public"."Tools" from "authenticated";

revoke references on table "public"."Tools" from "authenticated";

revoke select on table "public"."Tools" from "authenticated";

revoke trigger on table "public"."Tools" from "authenticated";

revoke truncate on table "public"."Tools" from "authenticated";

revoke update on table "public"."Tools" from "authenticated";

revoke delete on table "public"."Tools" from "service_role";

revoke insert on table "public"."Tools" from "service_role";

revoke references on table "public"."Tools" from "service_role";

revoke select on table "public"."Tools" from "service_role";

revoke trigger on table "public"."Tools" from "service_role";

revoke truncate on table "public"."Tools" from "service_role";

revoke update on table "public"."Tools" from "service_role";

alter table "public"."ProjectTags" drop constraint "ProjectTags_tools_token_fkey";

alter table "public"."Skills" drop constraint "Skills_token_key";

alter table "public"."Tools" drop constraint "Tools_token_key";

alter table "public"."Skills" drop constraint "Skills_pkey";

alter table "public"."Tools" drop constraint "Tools_pkey";

drop index if exists "public"."Skills_pkey";

drop index if exists "public"."Skills_token_key";

drop index if exists "public"."Tools_pkey";

drop index if exists "public"."Tools_token_key";

drop table "public"."Skills";

drop table "public"."Tools";

create policy "Enable read access for all users"
on "public"."Filters"
as permissive
for select
to public
using (true);



