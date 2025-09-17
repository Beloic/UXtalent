import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Kanban } from 'react-kanban-kit';
import { supabase } from '../lib/supabase';
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  MapPin,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CandidateNotesModal from './CandidateNotesModal';
import AppointmentIndicator from './AppointmentIndicator';
import FavoritesManager from './FavoritesManager';
import { buildApiUrl } from '../config/api';
import { 
  getKanbanData, 
  moveCandidateInKanban, 
  updateCandidateNotes as updateNotesApi,
  addToFavorites as addToFavoritesApi,
  removeFromFavorites as removeFromFavoritesApi
} from '../services/kanbanApi';

// Fonction helper pour construire les données du board à partir des données Kanban centralisées
const buildBoardDataFromKanbanData = (kanbanData) => {
  const columns = [
    {
      id: 'À contacter',
      title: 'À contacter',
      parentId: null,
      children: [],
      content: { icon: <MessageSquare className="w-5 h-5" />, color: 'bg-gray-100' },
      totalChildrenCount: 0
    },
    {
      id: 'Entretien prévu',
      title: 'Entretien prévu',
      parentId: null,
      children: [],
      content: { icon: <Clock className="w-5 h-5" />, color: 'bg-blue-100' },
      totalChildrenCount: 0
    },
    {
      id: 'En cours',
      title: 'En cours',
      parentId: null,
      children: [],
      content: { icon: <UserCheck className="w-5 h-5" />, color: 'bg-yellow-100' },
      totalChildrenCount: 0
    },
    {
      id: 'Accepté',
      title: 'Accepté',
      parentId: null,
      children: [],
      content: { icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-100' },
      totalChildrenCount: 0
    },
    {
      id: 'Refusé',
      title: 'Refusé',
      parentId: null,
      children: [],
      content: { icon: <XCircle className="w-5 h-5" />, color: 'bg-red-100' },
      totalChildrenCount: 0
    }
  ];

  const allCards = [];

  // Traiter chaque colonne
  Object.keys(kanbanData).forEach(columnName => {
    const candidates = kanbanData[columnName] || [];
    const columnIndex = columns.findIndex(col => col.id === columnName);
    
    if (columnIndex !== -1) {
      candidates.forEach(candidate => {
        const cardId = `card-${candidate.id}`;
        
        allCards.push({
          id: cardId,
          title: candidate.name,
          parentId: columnName,
          children: [],
          content: { candidate },
          type: 'candidate',
          totalChildrenCount: 0
        });
        
        columns[columnIndex].children.push(cardId);
        columns[columnIndex].totalChildrenCount++;
      });
    }
  });

  return {
    root: {
      id: 'root',
      title: 'Board',
      parentId: null,
      children: columns.map(col => col.id),
      totalChildrenCount: columns.length
    },
    ...columns.reduce((acc, col) => ({ ...acc, [col.id]: col }), {}),
    ...allCards.reduce((acc, card) => ({ ...acc, [card.id]: card }), {})
  };
};

// Composant de carte personnalisé
const CandidateCard = ({ candidate, currentStatus, onOpenNotes, appointments = [], onToggleFavorite = null }) => {
  // Fonction pour obtenir le prochain rendez-vous du candidat
  const getNextAppointment = (candidateId) => {
    const candidateAppointments = appointments.filter(apt => apt.candidate_id == candidateId);
    if (candidateAppointments.length === 0) return null;
    
    // Trier par date et heure, et retourner le plus proche dans le futur
    const now = new Date();
    const futureAppointments = candidateAppointments.filter(apt => {
      const appointmentDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
      return appointmentDate > now;
    });
    
    if (futureAppointments.length === 0) return null;
    
    return futureAppointments.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return dateA - dateB;
    })[0];
  };

  const nextAppointment = getNextAppointment(candidate.id);
  
  // Fonction pour obtenir les couleurs selon le statut
  const getCardColors = (status) => {
    switch (status) {
      case 'À contacter':
        return {
          bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
          border: 'border-slate-200',
          name: 'text-slate-800',
          title: 'text-slate-600',
          location: 'text-slate-500',
          icon: 'text-slate-400'
        };
      case 'Entretien prévu':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          border: 'border-blue-200',
          name: 'text-blue-800',
          title: 'text-blue-600',
          location: 'text-blue-500',
          icon: 'text-blue-400'
        };
      case 'En cours':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
          border: 'border-amber-200',
          name: 'text-amber-800',
          title: 'text-amber-600',
          location: 'text-amber-500',
          icon: 'text-amber-400'
        };
      case 'Accepté':
        return {
          bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
          border: 'border-emerald-200',
          name: 'text-emerald-800',
          title: 'text-emerald-600',
          location: 'text-emerald-500',
          icon: 'text-emerald-400'
        };
      case 'Refusé':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          border: 'border-red-200',
          name: 'text-red-800',
          title: 'text-red-600',
          location: 'text-red-500',
          icon: 'text-red-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
          border: 'border-slate-200',
          name: 'text-slate-800',
          title: 'text-slate-600',
          location: 'text-slate-500',
          icon: 'text-slate-400'
        };
    }
  };

  const colors = getCardColors(currentStatus);
  
  return (
    <div 
      className={`${colors.bg} ${colors.border} border rounded-xl p-3 mb-2 w-full max-w-full overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer relative group`}
      onClick={() => onOpenNotes(candidate)}
    >
      <div className="text-left">
        <div className="mb-1">
          <h4 className={`font-semibold ${colors.name} text-sm`}>
            {candidate.name}
          </h4>
        </div>
        
        <p className={`${colors.title} text-xs mb-1`}>
          {candidate.title}
        </p>
        <div className="flex items-center gap-1 text-xs">
          <MapPin className={`w-3 h-3 flex-shrink-0 ${colors.icon}`} />
          <span className={colors.location}>{candidate.location}</span>
        </div>
        
        {/* Indicateur de notes si des notes existent */}
        {candidate.notes && candidate.notes.trim() && (
          <div className="mt-2 flex items-center gap-1">
            <FileText className={`w-3 h-3 ${colors.icon}`} />
            <span className={`text-xs ${colors.location}`}>
              Notes disponibles
            </span>
          </div>
        )}
        
        {/* Indicateur de rendez-vous */}
        <div className="mt-2">
          <AppointmentIndicator 
            candidateId={candidate.id} 
            appointments={appointments} 
          />
        </div>
        
        {/* Gestionnaire de favoris */}
        <div className="mt-2 flex justify-end">
          <FavoritesManager 
            candidate={candidate}
            onToggle={onToggleFavorite}
            size="small"
          />
        </div>
        
        {/* Affichage de la date de l'entretien si disponible */}
        {nextAppointment && (
          <div className="mt-2 flex items-center gap-1">
            <Clock className={`w-3 h-3 ${colors.icon}`} />
            <span className={`text-xs ${colors.location}`}>
              {(() => {
                const appointmentDate = new Date(`${nextAppointment.appointment_date}T${nextAppointment.appointment_time}`);
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                
                // Formater la date selon si c'est aujourd'hui, demain ou autre
                if (appointmentDate.toDateString() === today.toDateString()) {
                  return `Aujourd'hui à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
                  return `Demain à ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                } else {
                  return appointmentDate.toLocaleDateString('fr-FR', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                }
              })()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const CandidateKanban = ({ 
  candidates, 
  onUpdateStatus, 
  onToggleFavorite, 
  favorites, 
  onRefreshCandidates, 
  appointments = [],
  // Nouvelles props pour la gestion centralisée
  kanbanData = null,
  onKanbanDataChange = null,
  // Props pour les nouvelles fonctions
  onMoveCandidate = null,
  onUpdateNotes = null,
  onToggleFavoriteNew = null,
  onRefresh = null,
  // État de chargement
  isLoading: externalLoading = false,
  error: externalError = null
}) => {
  const navigate = useNavigate();
  const [localBoardData, setLocalBoardData] = useState(null);
  const [notesModal, setNotesModal] = useState({ isOpen: false, candidate: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Utiliser les données Kanban centralisées si disponibles, sinon fallback sur l'ancien système
  const candidatesArray = useMemo(() => {
    if (kanbanData && kanbanData.candidates) {
      return kanbanData.candidates;
    }
    
    return Array.isArray(candidates) 
      ? candidates 
      : (candidates && Array.isArray(candidates.candidates)) 
        ? candidates.candidates 
        : [];
  }, [candidates, kanbanData]);

  const favoritesArray = useMemo(() => {
    if (kanbanData && kanbanData.favorites) {
      return kanbanData.favorites;
    }
    return favorites || [];
  }, [favorites, kanbanData]);

  const appointmentsArray = useMemo(() => {
    if (kanbanData && kanbanData.appointments) {
      return kanbanData.appointments;
    }
    return appointments || [];
  }, [appointments, kanbanData]);

  // Fonction pour voir le profil
  const handleViewProfile = useCallback((candidateId) => {
    navigate(`/candidates/${candidateId}`);
  }, [navigate]);

  // Fonction pour ouvrir le modal de notes
  const handleOpenNotes = useCallback((candidate) => {
    setNotesModal({ isOpen: true, candidate });
  }, []);

  // Fonction pour fermer le modal de notes
  const handleCloseNotes = useCallback(() => {
    setNotesModal({ isOpen: false, candidate: null });
  }, []);

  // Fonction pour sauvegarder les notes
  const handleSaveNotes = useCallback(async (candidateId, notes) => {
    try {
      setIsLoading(true);
      setError(null);

      // Utiliser la nouvelle fonction si disponible, sinon fallback sur l'ancien système
      if (onUpdateNotes) {
        const result = await onUpdateNotes(candidateId, notes);
        console.log('Notes sauvegardées avec succès (nouveau système):', result);
        return result;
      } else {
        // Utiliser l'ancien service API
        const result = await updateNotesApi(candidateId, notes);
        console.log('Notes sauvegardées avec succès (ancien système):', result);
        
        // Mise à jour optimiste des données locales
        if (kanbanData && onKanbanDataChange) {
          const updatedKanbanData = {
            ...kanbanData,
            candidates: kanbanData.candidates.map(candidate => 
              candidate.id === candidateId 
                ? { ...candidate, notes: notes }
                : candidate
            )
          };
          onKanbanDataChange(updatedKanbanData);
        } else if (onRefreshCandidates) {
          // Fallback sur l'ancien système
          onRefreshCandidates();
        }
        
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
      setError('Erreur lors de la sauvegarde des notes');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onUpdateNotes, kanbanData, onKanbanDataChange, onRefreshCandidates]);

  // Préparer les données selon la structure BoardData de react-kanban-kit
  const boardData = useMemo(() => {
    // Si on a des données Kanban centralisées, les utiliser directement
    if (kanbanData && kanbanData.kanbanData) {
      return buildBoardDataFromKanbanData(kanbanData.kanbanData);
    }
    
    // Sinon, utiliser l'ancienne logique avec les données locales
    const favoritesSet = new Set(favoritesArray?.map(fav => fav.id) || []);
    
    // Créer un Set des candidats avec rendez-vous (gérer les types string et number)
    const candidatesWithAppointments = new Set();
    appointmentsArray?.forEach(appointment => {
      if (appointment.candidate_id) {
        // Ajouter les deux versions (string et number) pour gérer les différences de type
        candidatesWithAppointments.add(appointment.candidate_id);
        candidatesWithAppointments.add(Number(appointment.candidate_id));
        candidatesWithAppointments.add(String(appointment.candidate_id));
      }
    });
    
    // Créer les colonnes
    const columns = [
      {
        id: 'À contacter',
        title: 'À contacter',
        parentId: null,
        children: [],
        content: { icon: <MessageSquare className="w-5 h-5" />, color: 'bg-gray-100' },
        totalChildrenCount: 0
      },
      {
        id: 'Entretien prévu',
        title: 'Entretien prévu',
        parentId: null,
        children: [],
        content: { icon: <Clock className="w-5 h-5" />, color: 'bg-blue-100' },
        totalChildrenCount: 0
      },
      {
        id: 'En cours',
        title: 'En cours',
        parentId: null,
        children: [],
        content: { icon: <UserCheck className="w-5 h-5" />, color: 'bg-yellow-100' },
        totalChildrenCount: 0
      },
      {
        id: 'Accepté',
        title: 'Accepté',
        parentId: null,
        children: [],
        content: { icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-100' },
        totalChildrenCount: 0
      },
      {
        id: 'Refusé',
        title: 'Refusé',
        parentId: null,
        children: [],
        content: { icon: <XCircle className="w-5 h-5" />, color: 'bg-red-100' },
        totalChildrenCount: 0
      }
    ];

    // Créer les cartes pour chaque colonne
    const allCards = [];
    
    // Traiter tous les candidats (favoris et autres)
    const allCandidates = [...(favorites || []), ...candidatesArray.filter(c => !favoritesSet.has(c.id))];
    
    allCandidates.forEach(candidate => {
      const cardId = `card-${candidate.id}`;
      
      // Déterminer la colonne selon la logique :
      // 1. Si le candidat a un rendez-vous → "Entretien prévu"
      // 2. Sinon, utiliser le statut du candidat ou "À contacter"
      let targetColumn = 'À contacter';
      
      if (candidatesWithAppointments.has(candidate.id)) {
        targetColumn = 'Entretien prévu';
      } else if (candidate.status && candidate.status !== 'À contacter') {
        targetColumn = candidate.status;
      }
      
      const columnIndex = columns.findIndex(col => col.id === targetColumn);
      
      if (columnIndex !== -1) {
        allCards.push({
          id: cardId,
          title: candidate.name,
          parentId: targetColumn,
          children: [],
          content: { candidate },
          type: 'candidate',
          totalChildrenCount: 0
        });
        columns[columnIndex].children.push(cardId);
        columns[columnIndex].totalChildrenCount++;
      }
    });

    return {
      root: {
        id: 'root',
        title: 'Board',
        parentId: null,
        children: columns.map(col => col.id),
        totalChildrenCount: columns.length
      },
      ...columns.reduce((acc, col) => ({ ...acc, [col.id]: col }), {}),
      ...allCards.reduce((acc, card) => ({ ...acc, [card.id]: card }), {})
    };
  }, [candidatesArray, favoritesArray, appointmentsArray, kanbanData]);

  // Initialiser l'état local avec les données calculées
  useEffect(() => {
    setLocalBoardData(boardData);
  }, [boardData]);

  // Configuration des types de cartes selon ConfigMap
  const configMap = {
    candidate: {
      render: ({ data, column, index }) => {
        const candidate = data.content.candidate;
        return (
          <CandidateCard
            candidate={candidate}
            onOpenNotes={handleOpenNotes}
            currentStatus={column.title}
            appointments={appointmentsArray}
            onToggleFavorite={onToggleFavoriteNew}
          />
        );
      },
      isDraggable: true
    }
  };

  // Gérer le déplacement des cartes selon CardMove
  const handleCardMove = useCallback(async (move) => {
    const candidateId = move.cardId.replace('card-', '');
    const newStatus = move.toColumnId;
    
    // Mise à jour optimiste de l'état local immédiatement
    setLocalBoardData(prevData => {
      if (!prevData) return prevData;
      
      const newData = { ...prevData };
      
      // Si c'est un déplacement dans la même colonne (réorganisation verticale)
      if (move.fromColumnId === move.toColumnId) {
        const column = newData[move.fromColumnId];
        if (column && column.children) {
          // Retirer la carte de sa position actuelle
          const currentIndex = column.children.indexOf(move.cardId);
          if (currentIndex !== -1) {
            column.children.splice(currentIndex, 1);
          }
          
          // Insérer la carte à la nouvelle position
          if (move.toIndex !== undefined && move.toIndex >= 0) {
            column.children.splice(move.toIndex, 0, move.cardId);
          } else {
            // Si pas d'index spécifique, ajouter à la fin
            column.children.push(move.cardId);
          }
          
          column.totalChildrenCount = column.children.length;
        }
      } else {
        // Déplacement entre colonnes différentes
        // Retirer la carte de l'ancienne colonne
        const fromColumn = newData[move.fromColumnId];
        if (fromColumn) {
          fromColumn.children = fromColumn.children.filter(id => id !== move.cardId);
          fromColumn.totalChildrenCount = fromColumn.children.length;
        }
        
        // Ajouter la carte à la nouvelle colonne
        const toColumn = newData[move.toColumnId];
        if (toColumn) {
          if (move.toIndex !== undefined && move.toIndex >= 0) {
            toColumn.children.splice(move.toIndex, 0, move.cardId);
          } else {
            toColumn.children.push(move.cardId);
          }
          toColumn.totalChildrenCount = toColumn.children.length;
        }
        
        // Mettre à jour le parent de la carte
        const card = newData[move.cardId];
        if (card) {
          card.parentId = move.toColumnId;
        }
      }
      
      return newData;
    });
    
    // Appeler l'API seulement si c'est un changement de colonne
    if (move.fromColumnId !== move.toColumnId) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Utiliser la nouvelle fonction si disponible, sinon fallback sur l'ancien système
        if (onMoveCandidate) {
          const result = await onMoveCandidate(candidateId, move.fromColumnId, newStatus, move.toIndex);
          console.log(`Carte ${candidateId} déplacée vers ${newStatus} (nouveau système):`, result);
        } else {
          // Utiliser l'ancien service API centralisé
          const result = await moveCandidateInKanban(candidateId, move.fromColumnId, newStatus, move.toIndex);
          console.log(`Carte ${candidateId} déplacée vers ${newStatus} (ancien système):`, result);
          
          // Mettre à jour les données Kanban si disponibles
          if (kanbanData && onKanbanDataChange) {
            // Recharger les données depuis l'API pour avoir la version la plus récente
            const updatedKanbanData = await getKanbanData();
            onKanbanDataChange(updatedKanbanData);
          } else if (onUpdateStatus) {
            // Fallback sur l'ancien système
            onUpdateStatus(candidateId, newStatus);
          }
        }
        
      } catch (error) {
        console.error('Erreur lors du déplacement du candidat:', error);
        setError('Erreur lors du déplacement du candidat');
        
        // En cas d'erreur, recharger les données pour restaurer l'état correct
        if (onRefresh) {
          onRefresh();
        } else if (onRefreshCandidates) {
          onRefreshCandidates();
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log(`Carte ${candidateId} réorganisée dans la colonne ${newStatus}`);
    }
  }, [onMoveCandidate, kanbanData, onKanbanDataChange, onUpdateStatus, onRefreshCandidates, onRefresh]);

  // Utiliser l'état local s'il existe, sinon utiliser les données calculées
  const currentBoardData = localBoardData || boardData;

  return (
    <div className="p-6 w-full min-h-screen">
      {/* Indicateur de chargement */}
      {(isLoading || externalLoading) && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Mise à jour...</span>
        </div>
      )}
      
      {/* Indicateur d'erreur */}
      {(error || externalError) && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span>{error || externalError}</span>
            <button 
              onClick={() => {
                setError(null);
                if (externalError && onRefresh) {
                  onRefresh();
                }
              }}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .rkk-board {
            display: flex !important;
            width: 100% !important;
            gap: 1.5rem;
            overflow-x: hidden;
            justify-content: space-between;
          }
          .rkk-column-outer {
            flex: 1 !important;
            min-width: 220px !important;
            max-width: none !important;
            width: auto !important;
            transition: all 0.3s ease !important;
          }
          .rkk-column {
            width: 100% !important;
            min-width: 220px !important;
            transition: all 0.3s ease !important;
          }
          .rkk-column-content {
            min-height: 300px !important;
            gap: 0.5rem !important;
            display: flex !important;
            flex-direction: column !important;
            transition: all 0.3s ease !important;
            position: relative !important;
            padding: 8px 0 !important;
          }
          .rkk-card-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 0 0.75rem 0 !important;
            border: none !important;
            background: transparent !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative !important;
          }
          
          /* Zones de drop précises */
          .rkk-card-wrapper::before {
            content: '' !important;
            position: absolute !important;
            top: -8px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: transparent !important;
            border-radius: 2px !important;
            transition: all 0.2s ease !important;
            z-index: 10 !important;
          }
          .rkk-card-wrapper::after {
            content: '' !important;
            position: absolute !important;
            bottom: -8px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: transparent !important;
            border-radius: 2px !important;
            transition: all 0.2s ease !important;
            z-index: 10 !important;
          }
          .rkk-card-wrapper:hover {
            transform: translateY(-2px) !important;
          }
          .rkk-card-wrapper.dragging {
            transform: rotate(5deg) scale(1.05) !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            z-index: 1000 !important;
          }
          .rkk-card-wrapper > div {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            transition: all 0.3s ease !important;
          }
          .rkk-card-inner {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            transition: all 0.3s ease !important;
          }
          .rkk-card-inner * {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            transition: all 0.3s ease !important;
          }
          .rkk-column.drag-over {
            background: rgba(59, 130, 246, 0.05) !important;
            border: 2px dashed rgba(59, 130, 246, 0.3) !important;
            border-radius: 12px !important;
            transition: all 0.3s ease !important;
          }
          /* Indicateurs de drop actifs */
          .rkk-card-wrapper.drag-over-above::before {
            background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.6) !important;
            height: 6px !important;
            top: -10px !important;
            animation: pulse-drop 1s infinite !important;
          }
          .rkk-card-wrapper.drag-over-below::after {
            background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.6) !important;
            height: 6px !important;
            bottom: -10px !important;
            animation: pulse-drop 1s infinite !important;
          }
          .rkk-card-wrapper.drag-over-inside {
            background: rgba(59, 130, 246, 0.1) !important;
            border: 2px dashed rgba(59, 130, 246, 0.4) !important;
            transform: scale(1.02) !important;
          }
          
          /* Zone de drop au début de la colonne */
          .rkk-column-content::before {
            content: '' !important;
            position: absolute !important;
            top: -8px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: transparent !important;
            border-radius: 2px !important;
            transition: all 0.2s ease !important;
            z-index: 10 !important;
          }
          .rkk-column-content.drag-over-top::before {
            background: linear-gradient(90deg, #10b981, #059669) !important;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.6) !important;
            height: 6px !important;
            top: -10px !important;
            animation: pulse-drop-green 1s infinite !important;
          }
          
          /* Zone de drop à la fin de la colonne */
          .rkk-column-content::after {
            content: '' !important;
            position: absolute !important;
            bottom: -8px !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: transparent !important;
            border-radius: 2px !important;
            transition: all 0.2s ease !important;
            z-index: 10 !important;
          }
          .rkk-column-content.drag-over-bottom::after {
            background: linear-gradient(90deg, #10b981, #059669) !important;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.6) !important;
            height: 6px !important;
            bottom: -10px !important;
            animation: pulse-drop-green 1s infinite !important;
          }
          
          /* Animations de pulsation */
          @keyframes pulse-drop {
            0%, 100% { 
              opacity: 0.8; 
              transform: scaleY(1); 
            }
            50% { 
              opacity: 1; 
              transform: scaleY(1.2); 
            }
          }
          @keyframes pulse-drop-green {
            0%, 100% { 
              opacity: 0.8; 
              transform: scaleY(1); 
            }
            50% { 
              opacity: 1; 
              transform: scaleY(1.2); 
            }
          }
          @media (max-width: 1400px) {
            .rkk-column-outer {
              min-width: 200px !important;
              max-width: none !important;
              width: auto !important;
            }
            .rkk-column {
              min-width: 200px !important;
            }
          }
          @media (max-width: 1200px) {
            .rkk-column-outer {
              min-width: 180px !important;
              max-width: none !important;
              width: auto !important;
            }
            .rkk-column {
              min-width: 180px !important;
            }
          }
          @media (max-width: 1000px) {
            .rkk-column-outer {
              min-width: 160px !important;
              max-width: none !important;
              width: auto !important;
            }
            .rkk-column {
              min-width: 160px !important;
            }
          }
        `
      }} />
      <div className="w-full">
        <Kanban
          dataSource={currentBoardData}
          configMap={configMap}
          onCardMove={handleCardMove}
          rootClassName="rkk-board"
          columnWrapperClassName={() => "rkk-column-outer"}
          columnClassName={() => "rkk-column"}
          columnHeaderClassName={() => "rkk-column-header"}
          columnListContentClassName={() => "rkk-column-content"}
          cardWrapperClassName="rkk-card-wrapper"
          renderColumnHeader={(column) => {
            const getHeaderColors = (title) => {
              switch (title) {
                case 'À contacter':
                  return {
                    bg: 'bg-gradient-to-r from-slate-100 to-slate-200',
                    text: 'text-slate-700',
                    icon: 'text-slate-600',
                    badge: 'bg-slate-300 text-slate-800'
                  };
                case 'Entretien prévu':
                  return {
                    bg: 'bg-gradient-to-r from-blue-100 to-blue-200',
                    text: 'text-blue-700',
                    icon: 'text-blue-600',
                    badge: 'bg-blue-300 text-blue-800'
                  };
                case 'En cours':
                  return {
                    bg: 'bg-gradient-to-r from-amber-100 to-amber-200',
                    text: 'text-amber-700',
                    icon: 'text-amber-600',
                    badge: 'bg-amber-300 text-amber-800'
                  };
                case 'Accepté':
                  return {
                    bg: 'bg-gradient-to-r from-emerald-100 to-emerald-200',
                    text: 'text-emerald-700',
                    icon: 'text-emerald-600',
                    badge: 'bg-emerald-300 text-emerald-800'
                  };
                case 'Refusé':
                  return {
                    bg: 'bg-gradient-to-r from-red-100 to-red-200',
                    text: 'text-red-700',
                    icon: 'text-red-600',
                    badge: 'bg-red-300 text-red-800'
                  };
                default:
                  return {
                    bg: 'bg-gradient-to-r from-slate-100 to-slate-200',
                    text: 'text-slate-700',
                    icon: 'text-slate-600',
                    badge: 'bg-slate-300 text-slate-800'
                  };
              }
            };
            
            const colors = getHeaderColors(column.title);
            
            return (
              <div className={`${colors.bg} rounded-xl p-3 mb-3 shadow-sm border border-white/50`}>
                <div className="flex items-center gap-2">
                  <div className={`flex-shrink-0 ${colors.icon}`}>
                    {column.content.icon}
                  </div>
                  <h3 className={`font-bold ${colors.text} text-sm truncate flex-1`}>
                    {column.title}
                  </h3>
                  <span className={`${colors.badge} px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 shadow-sm`}>
                    {column.totalChildrenCount}
                  </span>
                </div>
              </div>
            );
          }}
        />
      </div>
      
      {/* Modal de notes */}
      <CandidateNotesModal
        isOpen={notesModal.isOpen}
        onClose={handleCloseNotes}
        candidate={notesModal.candidate}
        onSaveNotes={handleSaveNotes}
        existingNotes={notesModal.candidate?.notes || ''}
        appointments={appointmentsArray}
      />
    </div>
  );
};

export default CandidateKanban;