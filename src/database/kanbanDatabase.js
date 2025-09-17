import { supabaseAdmin } from './supabaseClient.js';

// ===== GESTION DES COLONNES KANBAN =====

/**
 * Récupérer toutes les colonnes Kanban actives
 */
export const getKanbanColumns = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_columns')
      .select('*')
      .eq('is_active', true)
      .order('column_position', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des colonnes Kanban:', error);
    throw error;
  }
};

/**
 * Récupérer une colonne Kanban par son nom
 */
export const getKanbanColumnByName = async (name) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_columns')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la colonne Kanban:', error);
    throw error;
  }
};

/**
 * Créer une nouvelle colonne Kanban
 */
export const createKanbanColumn = async (columnData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_columns')
      .insert([columnData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la colonne Kanban:', error);
    throw error;
  }
};

/**
 * Mettre à jour une colonne Kanban
 */
export const updateKanbanColumn = async (id, updates) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_columns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la colonne Kanban:', error);
    throw error;
  }
};

// ===== GESTION DES STATUTS CANDIDATS =====

/**
 * Récupérer le statut Kanban d'un candidat pour un recruteur
 */
export const getCandidateKanbanStatus = async (candidateId, recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_candidate_status')
      .select(`
        *,
        kanban_columns!inner(name, title, color, icon)
      `)
      .eq('candidate_id', candidateId)
      .eq('recruiter_id', recruiterId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du statut Kanban:', error);
    throw error;
  }
};

/**
 * Mettre à jour le statut Kanban d'un candidat
 */
export const updateCandidateKanbanStatus = async (candidateId, recruiterId, columnId, status, notes = null) => {
  try {
    // Récupérer le statut actuel
    const currentStatus = await getCandidateKanbanStatus(candidateId, recruiterId);
    
    const statusData = {
      candidate_id: candidateId,
      recruiter_id: recruiterId,
      kanban_column_id: columnId,
      status: status,
      previous_status: currentStatus?.status || null,
      moved_at: new Date().toISOString(),
      moved_by: recruiterId,
      notes: notes
    };

    const { data, error } = await supabaseAdmin
      .from('kanban_candidate_status')
      .upsert(statusData, { 
        onConflict: 'candidate_id,recruiter_id',
        ignoreDuplicates: false 
      })
      .select(`
        *,
        kanban_columns!inner(name, title, color, icon)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut Kanban:', error);
    throw error;
  }
};

/**
 * Récupérer tous les statuts Kanban d'un recruteur
 */
export const getRecruiterKanbanStatuses = async (recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_candidate_status')
      .select(`
        *,
        kanban_columns!inner(name, title, color, icon, column_position),
        candidates!inner(id, name, title, location, notes)
      `)
      .eq('recruiter_id', recruiterId)
      .order('moved_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des statuts Kanban:', error);
    throw error;
  }
};

// ===== GESTION DES TRANSITIONS =====

/**
 * Récupérer toutes les transitions autorisées
 */
export const getKanbanTransitions = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_transitions')
      .select(`
        *,
        from_column:kanban_columns!kanban_transitions_from_column_id_fkey(name, title),
        to_column:kanban_columns!kanban_transitions_to_column_id_fkey(name, title)
      `);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des transitions Kanban:', error);
    throw error;
  }
};

/**
 * Valider une transition entre deux colonnes
 */
export const validateKanbanTransition = async (fromColumnId, toColumnId, candidateId, recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('validate_kanban_transition', {
        p_from_column_id: fromColumnId,
        p_to_column_id: toColumnId,
        p_candidate_id: candidateId,
        p_recruiter_id: recruiterId
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la validation de la transition:', error);
    throw error;
  }
};

/**
 * Récupérer les transitions autorisées depuis une colonne
 */
export const getAuthorizedTransitions = async (fromColumnId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_transitions')
      .select(`
        *,
        to_column:kanban_columns!kanban_transitions_to_column_id_fkey(name, title, color, icon)
      `)
      .eq('from_column_id', fromColumnId)
      .eq('is_allowed', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des transitions autorisées:', error);
    throw error;
  }
};

// ===== DONNÉES COMPLÈTES DU KANBAN =====

/**
 * Récupérer toutes les données Kanban pour un recruteur
 */
export const getCompleteKanbanData = async (recruiterId) => {
  try {
    // Récupérer les colonnes actives
    const columns = await getKanbanColumns();
    
    // Récupérer les statuts des candidats
    const statuses = await getRecruiterKanbanStatuses(recruiterId);
    
    // Récupérer les rendez-vous
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select('id, candidate_id, appointment_date, appointment_time, title')
      .eq('recruiter_id', recruiterId)
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .order('appointment_date', { ascending: true });

    if (appointmentsError) throw appointmentsError;

    // Organiser les données par colonnes
    const kanbanData = {};
    const candidatesWithAppointments = new Set(appointments.map(apt => apt.candidate_id));

    // Initialiser les colonnes
    columns.forEach(column => {
      kanbanData[column.name] = [];
    });

    // Répartir les candidats dans les colonnes
    statuses.forEach(status => {
      const candidate = status.candidates;
      const columnName = status.kanban_columns.name;
      
      // Vérifier si le candidat a un rendez-vous (priorité sur le statut)
      if (candidatesWithAppointments.has(candidate.id)) {
        const entretienColumn = columns.find(col => col.name === 'Entretien prévu');
        if (entretienColumn) {
          kanbanData[entretienColumn.name].push({
            ...candidate,
            kanbanColumn: entretienColumn.name,
            hasAppointment: true,
            kanbanStatus: status
          });
        }
      } else {
        kanbanData[columnName].push({
          ...candidate,
          kanbanColumn: columnName,
          hasAppointment: false,
          kanbanStatus: status
        });
      }
    });

    return {
      columns: columns,
      kanbanData: kanbanData,
      appointments: appointments || [],
      stats: {
        total: statuses.length,
        byColumn: Object.keys(kanbanData).reduce((acc, col) => {
          acc[col] = kanbanData[col].length;
          return acc;
        }, {})
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données Kanban complètes:', error);
    throw error;
  }
};

// ===== STATISTIQUES ET ANALYTICS =====

/**
 * Récupérer les statistiques des transitions
 */
export const getTransitionStats = async (recruiterId, period = '30 days') => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_candidate_status')
      .select(`
        status,
        previous_status,
        moved_at,
        kanban_columns!inner(name, title)
      `)
      .eq('recruiter_id', recruiterId)
      .gte('moved_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('moved_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de transition:', error);
    throw error;
  }
};

/**
 * Récupérer les candidats les plus actifs dans le Kanban
 */
export const getMostActiveCandidates = async (recruiterId, limit = 10) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('kanban_candidate_status')
      .select(`
        candidate_id,
        moved_at,
        candidates!inner(name, title)
      `)
      .eq('recruiter_id', recruiterId)
      .order('moved_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des candidats actifs:', error);
    throw error;
  }
};
