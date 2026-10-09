-- 1. Libera a leitura de campuses e universities para qualquer usuário logado
CREATE POLICY "Campus visíveis para autenticados" ON public.campuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Universidades visíveis para autenticados" ON public.universities FOR SELECT TO authenticated USING (true);

-- 2. Blinda o bucket de avatares (o usuário só pode gravar na pasta com o próprio ID dele)
CREATE POLICY "Avatar: escrita só no próprio arquivo" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);