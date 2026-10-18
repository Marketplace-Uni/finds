-- O bucket `listing-images` nunca ganhou uma policy de escrita em
-- `storage.objects` (só o `avatars` tinha, criada em
-- 20261009175313_corrige_rls_e_storage.sql). Sem ela, toda tentativa de
-- upload de foto de anúncio falha com "new row violates row-level security
-- policy" — confirmado testando direto no Storage, autenticado como usuário
-- comum, em duas tentativas seguidas, ambas com o mesmo erro.
--
-- Mesma convenção do ARQUITETURA.md ("escrita só na pasta {user_id}/"): a
-- pasta usada pelo app (src/app/actions/listings.ts, uploadImages()) também
-- foi ajustada de "listings/<arquivo>" para "{user_id}/<arquivo>" para
-- bater com essa policy.
CREATE POLICY "Anúncio: escrita só na própria pasta" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);
