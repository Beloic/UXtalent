import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  Phone, 
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2
} from 'lucide-react';
import {
  loadAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../services/appointmentsApi';

const Calendar = ({ candidates = [], favorites = [] }) => {
  // S'assurer que candidates et favorites sont toujours des tableaux
  const candidatesList = Array.isArray(candidates) ? candidates : [];
  const favoritesList = Array.isArray(favorites) ? favorites : [];
  
  // Fonction utilitaire pour formater une date en chaîne locale (YYYY-MM-DD)
  const formatDateToLocalString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fonction utilitaire pour récupérer le nom d'un candidat
  const getCandidateName = (candidateId, currentCandidateName = '') => {
    if (currentCandidateName) {
      return currentCandidateName;
    }
    
    if (candidateId) {
      const candidate = favoritesList.find(c => c.id == candidateId); // Utiliser == au lieu de === pour la comparaison
      return candidate ? (candidate.name || candidate.title || 'Candidat sans nom') : '';
    }
    
    return '';
  };

  // Fonction utilitaire pour récupérer le nom d'un candidat depuis un rendez-vous
  const getCandidateNameFromAppointment = (appointment) => {
    // D'abord, essayer les propriétés directes
    const candidateName = appointment.candidate_name || appointment.candidateName;
    if (candidateName) {
      return candidateName;
    }
    
    // Si on a un candidate_id, essayer de le récupérer depuis les favoris
    if (appointment.candidate_id) {
      const candidate = favoritesList.find(c => c.id == appointment.candidate_id); // Utiliser == pour la comparaison
      
      if (candidate) {
        return candidate.name || candidate.title || 'Candidat sans nom';
      }
    }
    
    return 'Aucun candidat associé';
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // État du formulaire d'ajout/modification
  const [formData, setFormData] = useState({
    title: '',
    candidateId: '',
    candidateName: '',
    type: 'video', // video, phone, onsite
    date: '',
    time: '',
    duration: '60',
    location: '',
    notes: ''
  });

  // Charger les rendez-vous depuis l'API
  useEffect(() => {
    const loadAppointmentsData = async () => {
      try {
        const appointmentsData = await loadAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        
        // Vérifier si c'est une erreur de table manquante
        if (error.message.includes('Table appointments non trouvée')) {
          alert('⚠️ Configuration requise\n\nLa table des rendez-vous n\'existe pas encore dans Supabase.');
        }
        
        setAppointments([]);
      }
    };

    loadAppointmentsData();
  }, []);

  // Générer les jours du mois
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  // Obtenir les rendez-vous pour une date donnée
  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      // Créer une date locale à partir de la chaîne de date (YYYY-MM-DD)
      const aptDate = new Date(apt.appointment_date + 'T00:00:00');
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      return aptDate.getTime() === targetDate.getTime();
    });
  };

  // Ajouter un nouveau rendez-vous
  const handleAddAppointment = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const appointmentData = {
        candidateId: formData.candidateId,
        title: formData.title,
        candidateName: getCandidateName(formData.candidateId, formData.candidateName),
        type: formData.type,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        duration: parseInt(formData.duration),
        location: formData.location,
        notes: formData.notes
      };

      console.log('Données du rendez-vous à créer:', appointmentData);
      const newAppointment = await createAppointment(appointmentData);
      console.log('Rendez-vous créé:', newAppointment);
      setAppointments(prev => [...prev, newAppointment]);
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        candidateId: '',
        candidateName: '',
        type: 'video',
        date: '',
        time: '',
        duration: '60',
        location: '',
        notes: ''
      });
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      
      // Vérifier si c'est une erreur de table manquante
      if (error.message.includes('Table appointments non trouvée')) {
        alert('⚠️ Configuration requise\n\nLa table des rendez-vous n\'existe pas encore dans Supabase.');
      } else {
        alert('Erreur lors de la création du rendez-vous');
      }
    }
  };

  // Modifier un rendez-vous
  const handleEditAppointment = (appointment) => {
    console.log('Modification du rendez-vous:', appointment);
    setFormData({
      title: appointment.title || '',
      candidateId: appointment.candidate_id || '',
      candidateName: appointment.candidate_name || appointment.candidateName || '',
      type: appointment.type || 'video',
      date: appointment.appointment_date || '',
      time: appointment.appointment_time || '',
      duration: appointment.duration ? appointment.duration.toString() : '60',
      location: appointment.location || '',
      notes: appointment.notes || ''
    });
    setEditingAppointment(appointment.id);
    setShowAddModal(true);
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    try {
      const appointmentData = {
        candidateId: formData.candidateId,
        title: formData.title,
        candidateName: getCandidateName(formData.candidateId, formData.candidateName),
        type: formData.type,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
        duration: parseInt(formData.duration),
        location: formData.location,
        notes: formData.notes
      };

      console.log('Données du rendez-vous à modifier:', appointmentData);
      const updatedAppointment = await updateAppointment(editingAppointment, appointmentData);
      setAppointments(prev => prev.map(apt => 
        apt.id === editingAppointment ? updatedAppointment : apt
      ));
      
      setShowAddModal(false);
      setEditingAppointment(null);
      setFormData({
        title: '',
        candidateId: '',
        candidateName: '',
        type: 'video',
        date: '',
        time: '',
        duration: '60',
        location: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
      alert('Erreur lors de la mise à jour du rendez-vous');
    }
  };

  // Supprimer un rendez-vous
  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      try {
        await deleteAppointment(appointmentId);
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      } catch (error) {
        console.error('Erreur lors de la suppression du rendez-vous:', error);
        alert('Erreur lors de la suppression du rendez-vous');
      }
    }
  };

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Ouvrir le modal d'ajout pour une date spécifique
  const openAddModalForDate = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      date: formatDateToLocalString(date)
    }));
    setShowAddModal(true);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="space-y-4">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau rendez-vous
          </button>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Titre Mes rendez-vous en haut à gauche du calendrier */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Mes rendez-vous</h3>
        </div>
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Jours du mois */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[80px] p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''}`}
                onClick={() => openAddModalForDate(day.date)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {day.date.getDate()}
                </div>
                
                {/* Rendez-vous du jour */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map(appointment => (
                    <div
                      key={appointment.id}
                      className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppointment(appointment);
                        setShowDetailsModal(true);
                      }}
                    >
                      {appointment.appointment_time} - {appointment.title}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des rendez-vous du jour sélectionné */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rendez-vous du {selectedDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {getAppointmentsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun rendez-vous prévu ce jour
            </p>
          ) : (
            <div className="space-y-3">
              {getAppointmentsForDate(selectedDate).map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {appointment.type === 'video' ? (
                        <Video className="w-5 h-5 text-blue-600" />
                      ) : appointment.type === 'phone' ? (
                        <Phone className="w-5 h-5 text-blue-600" />
                      ) : (
                        <MapPin className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time} ({appointment.duration}min)
                        </span>
                        {getCandidateNameFromAppointment(appointment) !== 'Aucun candidat associé' && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {getCandidateNameFromAppointment(appointment)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Modal d'ajout/modification */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du rendez-vous *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Entretien UX Designer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'entretien
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="video">Vidéo (Zoom, Teams, etc.)</option>
                      <option value="phone">Téléphone</option>
                      <option value="onsite">Sur site</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée (minutes)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="90">1h30</option>
                      <option value="120">2 heures</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidat (optionnel)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Seuls vos candidats favoris peuvent être sélectionnés
                  </p>
                    <select
                      value={formData.candidateId}
                      onChange={(e) => {
                        const candidate = favoritesList.find(c => c.id === e.target.value);
                        console.log('Candidat sélectionné:', candidate);
                        setFormData(prev => ({ 
                          ...prev, 
                          candidateId: e.target.value,
                          candidateName: candidate ? (candidate.name || candidate.title || 'Candidat sans nom') : ''
                        }));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un candidat</option>
                      {favoritesList.length === 0 ? (
                        <option value="" disabled>Aucun candidat dans vos favoris</option>
                      ) : (
                        favoritesList.map(candidate => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.name} - {candidate.title}
                          </option>
                        ))
                      )}
                    </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu / Lien (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adresse ou lien de visioconférence"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Notes sur l'entretien..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={editingAppointment ? handleSaveEdit : handleAddAppointment}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAppointment ? 'Sauvegarder' : 'Créer le rendez-vous'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de détails du rendez-vous */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails du rendez-vous
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    {selectedAppointment.type === 'video' ? (
                      <Video className="w-6 h-6 text-blue-600" />
                    ) : selectedAppointment.type === 'phone' ? (
                      <Phone className="w-6 h-6 text-blue-600" />
                    ) : (
                      <MapPin className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedAppointment.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getCandidateNameFromAppointment(selectedAppointment)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(selectedAppointment.appointment_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {selectedAppointment.appointment_time} ({selectedAppointment.duration}min)
                    </span>
                  </div>
                </div>

                {selectedAppointment.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedAppointment.location}</span>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Notes :</h5>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setFormData({
                        title: selectedAppointment.title || '',
                        candidateId: selectedAppointment.candidate_id || '',
                        candidateName: selectedAppointment.candidate_name || '',
                        type: selectedAppointment.type || 'video',
                        date: selectedAppointment.appointment_date || '',
                        time: selectedAppointment.appointment_time || '',
                        duration: selectedAppointment.duration ? selectedAppointment.duration.toString() : '60',
                        location: selectedAppointment.location || '',
                        notes: selectedAppointment.notes || ''
                      });
                      setEditingAppointment(selectedAppointment.id);
                      setShowAddModal(true);
                    }}
                    className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteAppointment(selectedAppointment.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Fonction utilitaire pour vérifier s'il y a des rendez-vous pour un candidat
export const getAppointmentsForCandidate = (candidateId, appointments = []) => {
  return appointments.filter(apt => apt.candidateId === candidateId);
};

// Fonction pour obtenir le prochain rendez-vous d'un candidat
export const getNextAppointmentForCandidate = (candidateId, appointments = []) => {
  const candidateAppointments = getAppointmentsForCandidate(candidateId, appointments);
  const now = new Date();
  
  const futureAppointments = candidateAppointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
    return appointmentDateTime > now;
  });
  
  if (futureAppointments.length === 0) return null;
  
  // Trier par date et retourner le plus proche
  return futureAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  })[0];
};

export default Calendar;
