import { supabaseAdmin } from '../lib/supabase.js';

// Charger tous les rendez-vous d'un recruteur
export const loadAppointments = async (recruiterId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      
      // Vérifier si c'est une erreur de table manquante
      if (error.message.includes('relation "appointments" does not exist') || 
          error.message.includes('Could not find the table')) {
        throw new Error('Table appointments non trouvée. Veuillez créer la table dans Supabase.');
      }
      
      throw error;
    }

    return data || [];
  } catch (error) {
    throw error;
  }
};

// Créer un nouveau rendez-vous
export const createAppointment = async (appointmentData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (error) {
      
      // Vérifier si c'est une erreur de table manquante
      if (error.message.includes('relation "appointments" does not exist') || 
          error.message.includes('Could not find the table')) {
        throw new Error('Table appointments non trouvée. Veuillez créer la table dans Supabase.');
      }
      
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un rendez-vous
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .update(appointmentData)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Supprimer un rendez-vous
export const deleteAppointment = async (appointmentId) => {
  try {
    const { error } = await supabaseAdmin
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Obtenir les rendez-vous d'un candidat spécifique
export const getAppointmentsForCandidate = async (recruiterId, candidateId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

// Obtenir le prochain rendez-vous d'un candidat
export const getNextAppointmentForCandidate = async (recruiterId, candidateId) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(1);

    if (error) {
      return null;
    }

    // Si le rendez-vous est aujourd'hui, vérifier l'heure
    if (data && data.length > 0) {
      const appointment = data[0];
      if (appointment.appointment_date === today && appointment.appointment_time < currentTime) {
        // Le rendez-vous d'aujourd'hui est passé, chercher le suivant
        const { data: nextData, error: nextError } = await supabaseAdmin
          .from('appointments')
          .select('*')
          .eq('recruiter_id', recruiterId)
          .eq('candidate_id', candidateId)
          .gte('appointment_date', today)
          .gt('appointment_time', currentTime)
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
          .limit(1);

        if (nextError) {
          return null;
        }

        return nextData && nextData.length > 0 ? nextData[0] : null;
      }

      return appointment;
    }

    return null;
  } catch (error) {
    return null;
  }
};
