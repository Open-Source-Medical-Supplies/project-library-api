create policy "Enable read access for all users"
on "public"."Projects"
as permissive
for select
to public
using (true);



