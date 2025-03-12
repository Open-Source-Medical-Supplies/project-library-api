create policy "Enable read access for all users"
on "public"."Categories"
as permissive
for select
to service_role
using (true);



