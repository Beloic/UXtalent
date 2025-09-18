-- Script pour corriger les tables du forum existantes

-- Ajouter la colonne replies si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'forum_posts' AND column_name = 'replies') THEN
        ALTER TABLE forum_posts ADD COLUMN replies INTEGER DEFAULT 0;
    END IF;
END $$;

-- Mettre à jour les compteurs de réponses existants
UPDATE forum_posts 
SET replies = (
    SELECT COUNT(*) 
    FROM forum_replies 
    WHERE forum_replies.post_id = forum_posts.id
);

-- Recréer la fonction avec la bonne colonne
CREATE OR REPLACE FUNCTION update_post_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts 
    SET replies = replies + 1, updated_at = NOW()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts 
    SET replies = GREATEST(replies - 1, 0), updated_at = NOW()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
DROP TRIGGER IF EXISTS trigger_update_post_replies_count ON forum_replies;
CREATE TRIGGER trigger_update_post_replies_count
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_post_replies_count();

-- Vérifier que tout fonctionne
SELECT 'Tables du forum corrigées avec succès !' as message;
