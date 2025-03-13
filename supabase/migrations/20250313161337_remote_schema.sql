create table "public"."ProjectTags" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "project_token" character varying,
    "category_token" character varying
);


alter table "public"."ProjectTags" enable row level security;

CREATE UNIQUE INDEX "ProjectTags_pkey" ON public."ProjectTags" USING btree (id);

CREATE UNIQUE INDEX "Projects_token_key" ON public."Projects" USING btree (token);

alter table "public"."ProjectTags" add constraint "ProjectTags_pkey" PRIMARY KEY using index "ProjectTags_pkey";

alter table "public"."ProjectTags" add constraint "ProjectTags_category_token_fkey" FOREIGN KEY (category_token) REFERENCES "Categories"(token) not valid;

alter table "public"."ProjectTags" validate constraint "ProjectTags_category_token_fkey";

alter table "public"."ProjectTags" add constraint "ProjectTags_project_token_fkey" FOREIGN KEY (project_token) REFERENCES "Projects"(token) not valid;

alter table "public"."ProjectTags" validate constraint "ProjectTags_project_token_fkey";

alter table "public"."Projects" add constraint "Projects_token_key" UNIQUE using index "Projects_token_key";

grant delete on table "public"."ProjectTags" to "anon";

grant insert on table "public"."ProjectTags" to "anon";

grant references on table "public"."ProjectTags" to "anon";

grant select on table "public"."ProjectTags" to "anon";

grant trigger on table "public"."ProjectTags" to "anon";

grant truncate on table "public"."ProjectTags" to "anon";

grant update on table "public"."ProjectTags" to "anon";

grant delete on table "public"."ProjectTags" to "authenticated";

grant insert on table "public"."ProjectTags" to "authenticated";

grant references on table "public"."ProjectTags" to "authenticated";

grant select on table "public"."ProjectTags" to "authenticated";

grant trigger on table "public"."ProjectTags" to "authenticated";

grant truncate on table "public"."ProjectTags" to "authenticated";

grant update on table "public"."ProjectTags" to "authenticated";

grant delete on table "public"."ProjectTags" to "service_role";

grant insert on table "public"."ProjectTags" to "service_role";

grant references on table "public"."ProjectTags" to "service_role";

grant select on table "public"."ProjectTags" to "service_role";

grant trigger on table "public"."ProjectTags" to "service_role";

grant truncate on table "public"."ProjectTags" to "service_role";

grant update on table "public"."ProjectTags" to "service_role";

create policy "Enable read access for all users"
on "public"."ProjectTags"
as permissive
for select
to anon, service_role
using (true);



