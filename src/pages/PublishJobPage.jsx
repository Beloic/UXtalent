import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublishJobForm from '../components/PublishJobForm';

export default function PublishJobPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            to="/recruiter-dashboard/myjobs" 
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Publier une offre</h1>
          <p className="text-gray-600">Renseignez les informations de votre nouvelle offre d'emploi.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <PublishJobForm onJobPublished={() => {
            navigate('/recruiter-dashboard?tab=myjobs');
          }} />
        </div>
      </div>
    </div>
  );
}


