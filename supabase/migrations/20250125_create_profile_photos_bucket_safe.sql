-- Migration pour créer le bucket profile-photos uniquement
-- Date: 2025-01-25
-- Description: Création du bucket pour stocker les photos de profil des candidats

-- Créer le bucket profile-photos s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-photos',
    'profile-photos',
    true, -- Bucket public pour permettre l'accès aux photos
    5242880, -- 5MB en bytes
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Créer une politique RLS pour permettre aux utilisateurs authentifiés d'uploader leurs propres photos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload their own profile photos'
    ) THEN
        CREATE POLICY "Users can upload their own profile photos" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'profile-photos' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;

-- Créer une politique RLS pour permettre aux utilisateurs de supprimer leurs propres photos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete their own profile photos'
    ) THEN
        CREATE POLICY "Users can delete their own profile photos" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'profile-photos' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;

-- Créer une politique RLS pour permettre la lecture publique des photos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Profile photos are publicly readable'
    ) THEN
        CREATE POLICY "Profile photos are publicly readable" ON storage.objects
        FOR SELECT USING (bucket_id = 'profile-photos');
    END IF;
END $$;

-- Créer une politique RLS pour permettre aux utilisateurs de mettre à jour leurs propres photos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update their own profile photos'
    ) THEN
        CREATE POLICY "Users can update their own profile photos" ON storage.objects
        FOR UPDATE USING (
            bucket_id = 'profile-photos' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;
