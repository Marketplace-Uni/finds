-- A política "Dono gerencia seus anúncios" (FOR ALL, owner_id = auth.uid())
-- bloqueia silenciosamente o encerramento automático do anúncio quando a
-- NEGOCIAÇÃO é concluída: quem dispara o UPDATE é o participante que marcou
-- "concluído" por último — e metade das vezes esse participante é o
-- COMPRADOR, não o dono do anúncio. O Supabase/PostgREST não retorna erro
-- nesse caso (a linha só fica invisível pra esse UPDATE via RLS), então o
-- anúncio simplesmente nunca encerrava, sem nenhum aviso — achado testando
-- o fluxo ponta a ponta com duas contas reais (comprador ≠ vendedor).
--
-- Esta policy libera só o caso específico: qualquer participante (comprador
-- OU vendedor) de uma negociação já `completed` pode encerrar o anúncio
-- daquela negociação — e o `WITH CHECK` garante que só dá pra isso (virar
-- `closed`), não pra mudar mais nada do anúncio por essa policy.
CREATE POLICY "Participante encerra anúncio de negociação concluída"
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.listing_id = listings.id
        AND transactions.status = 'completed'
        AND (transactions.buyer_id = auth.uid() OR transactions.seller_id = auth.uid())
    )
  )
  WITH CHECK (status = 'closed');
