import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Chemin vers le fichier JSON des offres
const JOBS_FILE = path.join(__dirname, '../../data/jobs.json');

// ===== JOBS (Version locale avec fichier JSON) =====

export const loadJobs = async () => {
  try {
    // Lire le fichier JSON
    const jobsData = fs.readFileSync(JOBS_FILE, 'utf8');
    const jobs = JSON.parse(jobsData);
    
    // Filtrer seulement les offres actives et ajouter les champs manquants
    const activeJobs = jobs
      .filter(job => job.status !== 'closed')
      .map(job => ({
        ...job,
        id: job.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        postedAt: job.postedAt || job.created_at || new Date().toISOString(),
        updatedAt: job.updatedAt || job.updated_at || new Date().toISOString(),
        viewsCount: job.viewsCount || job.views_count || 0,
        applicationsCount: job.applicationsCount || job.applications_count || 0,
        recruiterId: job.recruiterId || job.recruiter_id || null,
        status: job.status || 'active',
        tags: job.tags || []
      }));
    
    return activeJobs;
  } catch (error) {
    console.error('Erreur lors du chargement des offres:', error);
    return [];
  }
};

export const getJobById = async (id) => {
  try {
    const jobs = await loadJobs();
    const job = jobs.find(j => j.id === id);
    
    if (job) {
      // Incrémenter le compteur de vues
      await incrementJobViews(id);
      return job;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'offre:', error);
    return null;
  }
};

export const createJob = async (jobData, recruiterId) => {
  try {
    // Charger les offres existantes
    const existingJobs = await loadJobs();
    
    // Créer la nouvelle offre
    const newJob = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      remote: jobData.remote || 'onsite',
      type: jobData.type || 'CDI',
      seniority: jobData.seniority || 'Mid',
      salary: jobData.salary || '',
      description: jobData.description,
      requirements: jobData.requirements || '',
      benefits: jobData.benefits || '',
      tags: jobData.tags || [],
      recruiter_id: recruiterId,
      status: 'active',
      views_count: 0,
      applications_count: 0,
      postedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      viewsCount: 0,
      applicationsCount: 0,
      recruiterId: recruiterId
    };
    
    // Ajouter la nouvelle offre
    const updatedJobs = [...existingJobs, newJob];
    
    // Sauvegarder dans le fichier JSON
    fs.writeFileSync(JOBS_FILE, JSON.stringify(updatedJobs, null, 2));
    
    console.log(`✅ Offre créée: ${newJob.id}`);
    return newJob;
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error);
    throw error;
  }
};

export const updateJob = async (id, jobData, recruiterId) => {
  try {
    const jobs = await loadJobs();
    const jobIndex = jobs.findIndex(j => j.id === id);
    
    if (jobIndex === -1) {
      return null;
    }
    
    // Vérifier que le recruteur est le propriétaire
    if (jobs[jobIndex].recruiterId !== recruiterId) {
      return null;
    }
    
    // Mettre à jour l'offre
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...jobData,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Sauvegarder
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    
    return jobs[jobIndex];
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    throw error;
  }
};

export const deleteJob = async (id, recruiterId) => {
  try {
    const jobs = await loadJobs();
    const jobIndex = jobs.findIndex(j => j.id === id);
    
    if (jobIndex === -1) {
      return false;
    }
    
    // Vérifier que le recruteur est le propriétaire
    if (jobs[jobIndex].recruiterId !== recruiterId) {
      return false;
    }
    
    // Soft delete
    jobs[jobIndex].status = 'closed';
    jobs[jobIndex].updatedAt = new Date().toISOString();
    jobs[jobIndex].updated_at = new Date().toISOString();
    
    // Sauvegarder
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    throw error;
  }
};

export const getRecruiterJobs = async (recruiterId) => {
  try {
    const jobs = await loadJobs();
    return jobs.filter(job => job.recruiterId === recruiterId);
  } catch (error) {
    console.error('Erreur lors du chargement des offres du recruteur:', error);
    return [];
  }
};

export const incrementJobViews = async (jobId) => {
  try {
    const jobs = await loadJobs();
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    
    if (jobIndex !== -1) {
      jobs[jobIndex].viewsCount = (jobs[jobIndex].viewsCount || 0) + 1;
      jobs[jobIndex].views_count = jobs[jobIndex].viewsCount;
      jobs[jobIndex].updatedAt = new Date().toISOString();
      jobs[jobIndex].updated_at = jobs[jobIndex].updatedAt;
      
      // Sauvegarder
      fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des vues:', error);
    return false;
  }
};

export const incrementJobApplications = async (jobId) => {
  try {
    const jobs = await loadJobs();
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    
    if (jobIndex !== -1) {
      jobs[jobIndex].applicationsCount = (jobs[jobIndex].applicationsCount || 0) + 1;
      jobs[jobIndex].applications_count = jobs[jobIndex].applicationsCount;
      jobs[jobIndex].updatedAt = new Date().toISOString();
      jobs[jobIndex].updated_at = jobs[jobIndex].updatedAt;
      
      // Sauvegarder
      fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des candidatures:', error);
    return false;
  }
};

export const getJobStats = async () => {
  try {
    const jobs = await loadJobs();
    return {
      total: jobs.length,
      active: jobs.filter(job => job.status === 'active').length
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques des offres:', error);
    return { total: 0, active: 0 };
  }
};
