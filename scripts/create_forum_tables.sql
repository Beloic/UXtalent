-- Script pour créer les tables du forum dans Supabase

-- Table des catégories du forum
CREATE TABLE IF NOT EXISTS forum_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(50) DEFAULT 'bg-blue-100 text-blue-700',
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des posts du forum
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  author_id VARCHAR(100),
  author_avatar VARCHAR(10),
  category VARCHAR(100) REFERENCES forum_categories(name),
  likes INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réponses aux posts
CREATE TABLE IF NOT EXISTS forum_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  author_id VARCHAR(100),
  author_avatar VARCHAR(10),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des likes des posts
CREATE TABLE IF NOT EXISTS forum_post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Table des likes des réponses
CREATE TABLE IF NOT EXISTS forum_reply_likes (
  id SERIAL PRIMARY KEY,
  reply_id INTEGER NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at);

-- Fonction pour mettre à jour le compteur de réponses
CREATE OR REPLACE FUNCTION update_post_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts 
    SET replies_count = replies_count + 1, updated_at = NOW()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts 
    SET replies_count = GREATEST(replies_count - 1, 0), updated_at = NOW()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le compteur de réponses
DROP TRIGGER IF EXISTS trigger_update_post_replies_count ON forum_replies;
CREATE TRIGGER trigger_update_post_replies_count
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_post_replies_count();

-- Fonction pour mettre à jour le compteur de catégories
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_categories 
    SET count = count + 1, updated_at = NOW()
    WHERE name = NEW.category;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_categories 
    SET count = GREATEST(count - 1, 0), updated_at = NOW()
    WHERE name = OLD.category;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le compteur de catégories
DROP TRIGGER IF EXISTS trigger_update_category_count ON forum_posts;
CREATE TRIGGER trigger_update_category_count
  AFTER INSERT OR DELETE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_category_count();

-- Insérer les catégories par défaut
INSERT INTO forum_categories (name, description, color) VALUES
('UX Design', 'Expérience utilisateur et design thinking', 'bg-blue-100 text-blue-700'),
('UI Design', 'Interface utilisateur et design visuel', 'bg-purple-100 text-purple-700'),
('Outils', 'Outils et logiciels de design', 'bg-green-100 text-green-700'),
('Design System', 'Systèmes de design et composants', 'bg-orange-100 text-orange-700'),
('User Research', 'Recherche utilisateur et tests', 'bg-pink-100 text-pink-700'),
('Carrière', 'Conseils carrière et opportunités', 'bg-indigo-100 text-indigo-700')
ON CONFLICT (name) DO NOTHING;

-- Insérer quelques posts de démonstration
INSERT INTO forum_posts (title, content, author, author_id, author_avatar, category, tags) VALUES
('Accessibilité web : les erreurs à éviter', 'Bonjour à tous ! Je voudrais partager avec vous les erreurs d''accessibilité les plus courantes que j''ai observées dans mes audits UX. Voici mon retour d''expérience...', 'Marie Dubois', 'marie123', 'MD', 'UX Design', ARRAY['accessibilité', 'audit', 'erreurs']),
('Figma vs Sketch : quel outil choisir en 2024 ?', 'Avec l''évolution constante des outils de design, il peut être difficile de choisir entre Figma et Sketch. Voici mon analyse comparative...', 'Pierre Martin', 'pierre456', 'PM', 'Outils', ARRAY['figma', 'sketch', 'comparaison']),
('Comment créer un design system efficace ?', 'Créer un design system n''est pas seulement une question de composants. Il faut penser à la gouvernance, la documentation, et l''adoption par les équipes...', 'Sophie Chen', 'sophie789', 'SC', 'Design System', ARRAY['design-system', 'gouvernance', 'documentation'])
ON CONFLICT DO NOTHING;

-- Insérer quelques réponses de démonstration
INSERT INTO forum_replies (post_id, content, author, author_id, author_avatar) VALUES
(1, 'Excellent sujet ! L''accessibilité est souvent négligée mais cruciale. Merci pour ce partage.', 'Nicolas P.', 'nicolas123', 'NP'),
(1, 'Je recommande aussi d''utiliser axe DevTools pour automatiser certains tests d''accessibilité.', 'Alice R.', 'alice456', 'AR'),
(2, 'Personnellement, je préfère Figma pour la collaboration en temps réel. C''est un game changer !', 'Thomas L.', 'thomas789', 'TL')
ON CONFLICT DO NOTHING;

-- Afficher un message de confirmation
SELECT 'Tables du forum créées avec succès !' as message;
