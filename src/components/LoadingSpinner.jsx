import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Chargement..." }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {/* Spinner principal */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
        
        {/* Spinner secondaire pour l'effet de profondeur */}
        <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400" 
             style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
        </div>
      </div>
      
      {/* Message de chargement */}
      <motion.p 
        className="mt-4 text-gray-600 text-sm font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {message}
      </motion.p>
      
      {/* Barre de progression animée */}
      <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;
