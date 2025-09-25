import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const ProfilePhotoUpload = ({ userId, currentPhoto, onPhotoChange, onError, compact = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError('Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.');
      return;
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onError('Le fichier est trop volumineux. Taille maximale : 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Upload vers Supabase Storage
      const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(`${userId}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Obtenir l'URL publique
      const { data: publicUrl } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(`${userId}/${fileName}`);

      // Notifier le composant parent
      onPhotoChange({
        existing: publicUrl.publicUrl,
        preview: publicUrl.publicUrl,
        fileName: fileName
      });

    } catch (error) {
      onError(`Erreur lors de l'upload: ${error.message}`);
      // Ne pas restaurer l'aperçu précédent, laisser l'utilisateur choisir une nouvelle photo
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhoto) return;

    try {
      // Extraire le nom du fichier de l'URL
      const urlParts = currentPhoto.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Supprimer de Supabase Storage
      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([`${userId}/${fileName}`]);

      if (error) {
        throw error;
      }

      // Notifier le composant parent avec une valeur spéciale pour indiquer la suppression
      onPhotoChange({
        existing: null,
        preview: null,
        fileName: null,
        removed: true // Indicateur que la photo a été supprimée
      });

    } catch (error) {
      onError(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`profile-photo-upload ${compact ? 'relative' : 'text-center'}`}>
      <div className={`photo-preview ${compact ? '' : 'flex justify-center'}`}>
        {currentPhoto ? (
          <img 
            src={currentPhoto} 
            alt="Aperçu de la photo de profil" 
            className={compact ? "w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-xl" : "w-32 h-32 rounded-full object-cover border-2 border-gray-300"}
          />
        ) : (
          <div className={compact ? "w-24 h-24 rounded-3xl bg-gray-200 flex items-center justify-center border-4 border-white shadow-xl" : "w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300"}>
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {compact ? (
        // Mode compact pour MyProfilePage - bouton overlay
        <>
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white"
            title={isUploading ? 'Upload en cours...' : 'Changer la photo'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* Bouton supprimer en overlay si une photo existe */}
          {currentPhoto && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white"
              title="Supprimer la photo"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </>
      ) : (
        // Mode normal pour AddProfilePage - boutons en dessous
        <>
          <div className="photo-actions mt-4 flex justify-center space-x-2">
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Upload en cours...' : 'Choisir une photo'}
            </button>

            {currentPhoto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isUploading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Supprimer
              </button>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-2 text-center">
            Formats acceptés : JPEG, PNG, GIF, WebP. Taille maximale : 5MB.
          </p>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhotoUpload;
