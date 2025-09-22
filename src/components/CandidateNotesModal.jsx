import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Calendar, User, Clock, MapPin, Video, Phone } from 'lucide-react';

const CandidateNotesModal = ({ 
  isOpen, 
  onClose, 
  candidate, 
  onSaveNotes, 
  existingNotes = '',
  appointments = []
}) => {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fonction pour obtenir les rendez-vous du candidat
  const getCandidateAppointments = () => {
    if (!candidate || !appointments) return [];
    return appointments.filter(apt => apt.candidate_id == candidate.id);
  };

  // Fonction pour formater la date d'un rendez-vous
  const formatAppointmentDate = (appointment) => {
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (appointmentDate.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return `Demain à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return appointmentDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Charger les notes existantes quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setNotes(existingNotes);
    }
  }, [isOpen, existingNotes]);

  const handleSave = async () => {
    if (!candidate) return;
    
    setIsSaving(true);
    try {
      await onSaveNotes(candidate.id, notes);
      // Fermer automatiquement après la sauvegarde
      onClose();
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Notes sur {candidate.name}
              </h2>
              <p className="text-sm text-gray-500">
                {candidate.title} • {candidate.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Candidate Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{candidate.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Ajouté le {new Date(candidate.createdAt || candidate.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          {/* Rendez-vous du candidat */}
          {(() => {
            const candidateAppointments = getCandidateAppointments();
            if (candidateAppointments.length > 0) {
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Rendez-vous planifiés</h3>
                  </div>
                  <div className="space-y-2">
                    {candidateAppointments.map((appointment, index) => (
                      <div key={index} className="bg-white border border-blue-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                          <span className="text-sm text-gray-500">
                            {formatAppointmentDate(appointment)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            {appointment.type === 'video' ? (
                              <Video className="w-3 h-3" />
                            ) : appointment.type === 'phone' ? (
                              <Phone className="w-3 h-3" />
                            ) : (
                              <MapPin className="w-3 h-3" />
                            )}
                            <span className="capitalize">{appointment.type}</span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{appointment.location}</span>
                            </div>
                          )}
                        </div>
                        {appointment.notes && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {appointment.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Notes Textarea */}
        <div className="flex-1 p-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Vos notes privées
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez vos notes sur ce candidat..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-500">
            {notes.length} caractères
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateNotesModal;
