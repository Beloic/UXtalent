import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  
  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button 
        onClick={prev} 
        disabled={page === 1}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
      >
        <ChevronLeft className="h-4 w-4" /> 
        Précédent
      </button>
      
      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={index} className="px-3 py-2 text-gray-500 animate-pulse">...</span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-110 transform ${
                page === pageNum
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-200'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg bg-white/80 backdrop-blur-sm'
              }`}
            >
              {pageNum}
            </button>
          )
        ))}
      </div>
      
      <button 
        onClick={next} 
        disabled={page === totalPages}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
      >
        Suivant 
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}