drop policy "Enable read access for all users" on "public"."Categories";

create policy "Enable read access for all users"
on "public"."Categories"
as permissive
for select
to public
using (true);



