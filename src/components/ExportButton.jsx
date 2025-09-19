import React, { useState } from "react";
import { Download, FileText, Database, Loader2 } from "lucide-react";
import { buildApiUrl } from "../config/api";

export default function ExportButton({ className = "" }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  const handleExport = async (type) => {
    try {
      setIsExporting(true);
      setExportType(type);
      
      const endpoint = type === 'csv' ? '/api/export/candidates/csv' : '/api/export/candidates/json';
      const url = await buildApiUrl(endpoint);
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem('supabase.auth.token');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': type === 'csv' ? 'text/csv' : 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                     `candidats_ux_${new Date().toISOString().split('T')[0]}.${type}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert(`Erreur lors de l'export ${type.toUpperCase()}: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <button
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            isExporting && exportType === 'csv'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isExporting && exportType === 'csv' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {isExporting && exportType === 'csv' ? 'Export...' : 'CSV'}
        </button>
        
        <button
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            isExporting && exportType === 'json'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isExporting && exportType === 'json' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {isExporting && exportType === 'json' ? 'Export...' : 'JSON'}
        </button>
      </div>
      
      {isExporting && (
        <div className="absolute top-full left-0 mt-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10">
          Export en cours...
        </div>
      )}
    </div>
  );
}
