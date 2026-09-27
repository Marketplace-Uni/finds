-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE listing_type AS ENUM ('product', 'service', 'roommate', 'republic');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'paused', 'closed');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE user_trait_kind AS ENUM ('self', 'wanted');

-- ==========================================
-- 2. TABELAS BASE (Sem dependências)
-- ==========================================
CREATE TABLE public.universities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email_domain TEXT NOT NULL
);

CREATE TABLE public.traits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    trait_group TEXT NOT NULL
);

-- ==========================================
-- 3. TABELAS COM DEPENDÊNCIAS
-- ==========================================
CREATE TABLE public.campuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Uberlândia'
);

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    university_id UUID REFERENCES public.universities(id),
    campus_id UUID REFERENCES public.campuses(id),
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    campus_id UUID REFERENCES public.campuses(id),
    title TEXT NOT NULL,
    description TEXT,
    type listing_type NOT NULL,
    status listing_status DEFAULT 'draft' NOT NULL,
    price NUMERIC(10,2),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.listing_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
    path TEXT NOT NULL,
    position INTEGER DEFAULT 0
);

CREATE TABLE public.favorites (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, buyer_id)
);

CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id),
    buyer_id UUID REFERENCES public.profiles(id),
    status transaction_status DEFAULT 'pending',
    created_by UUID REFERENCES public.profiles(id),
    seller_completed_at TIMESTAMPTZ,
    buyer_completed_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES public.profiles(id),
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewed_id UUID REFERENCES public.profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(transaction_id, reviewer_id)
);

CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_traits (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trait_id UUID REFERENCES public.traits(id) ON DELETE CASCADE,
    kind user_trait_kind NOT NULL,
    PRIMARY KEY (user_id, trait_id, kind)
);

-- ==========================================
-- 4. ÍNDICES, TRIGGERS E STORAGE
-- ==========================================
CREATE INDEX idx_listings_type ON public.listings(type);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_campus ON public.listings(campus_id);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listings_modtime
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. RLS (ROW LEVEL SECURITY)
-- ==========================================
-- Profiles
CREATE POLICY "Profiles são visíveis para usuários autenticados" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários podem editar próprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Listings
CREATE POLICY "Anúncios ativos visíveis para autenticados" ON public.listings FOR SELECT TO authenticated USING (status = 'active' OR owner_id = auth.uid());
CREATE POLICY "Dono gerencia seus anúncios" ON public.listings FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Imagens
CREATE POLICY "Imagens visíveis se anúncio for visível" ON public.listing_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Dono do anúncio gerencia imagens" ON public.listing_images FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND owner_id = auth.uid()));

-- Favorites
CREATE POLICY "Usuário gerencia próprios favoritos" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Conversations & Messages
CREATE POLICY "Participantes veem a conversa" ON public.conversations FOR SELECT TO authenticated USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Participantes criam conversa" ON public.conversations FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Participantes leem/mandam mensagens na conversa" ON public.messages FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));

-- Transactions
CREATE POLICY "Partes gerenciam transações" ON public.transactions FOR ALL TO authenticated USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Reviews
CREATE POLICY "Avaliações visíveis para autenticados" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pode criar review se participou da transação completed" ON public.reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid() AND EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.status = 'completed' AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())));

-- Reports
CREATE POLICY "Autenticados podem criar denúncias" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());

-- Traits
CREATE POLICY "Traits visíveis para todos" ON public.traits FOR SELECT TO authenticated USING (true);

-- User Traits
CREATE POLICY "User traits visíveis" ON public.user_traits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuário edita seus traits" ON public.user_traits FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());