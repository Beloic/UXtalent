import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublishJobForm from '../components/PublishJobForm';

export default function PublishJobPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
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


