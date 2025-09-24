-- Migration pour ajouter les tables de likes du forum
-- Date: 2025-09-24

-- Table pour les likes des posts
CREATE TABLE IF NOT EXISTS public.forum_post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Table pour les likes des réponses
CREATE TABLE IF NOT EXISTS public.forum_reply_likes (
    id BIGSERIAL PRIMARY KEY,
    reply_id BIGINT NOT NULL REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reply_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_post_id ON public.forum_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_likes_user_id ON public.forum_post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply_id ON public.forum_reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_user_id ON public.forum_reply_likes(user_id);

-- RLS (Row Level Security) - permettre l'accès public en lecture et écriture
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour permettre l'accès public
CREATE POLICY "Allow public read access on forum_post_likes" ON public.forum_post_likes
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on forum_post_likes" ON public.forum_post_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access on forum_post_likes" ON public.forum_post_likes
    FOR DELETE USING (true);

CREATE POLICY "Allow public read access on forum_reply_likes" ON public.forum_reply_likes
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on forum_reply_likes" ON public.forum_reply_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access on forum_reply_likes" ON public.forum_reply_likes
    FOR DELETE USING (true);
