alter table "public"."Categories" add column "additional_requirements" text;

CREATE UNIQUE INDEX "Categories_token_key" ON public."Categories" USING btree (token);

alter table "public"."Categories" add constraint "Categories_token_key" UNIQUE using index "Categories_token_key";


