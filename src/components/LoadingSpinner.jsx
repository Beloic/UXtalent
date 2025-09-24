import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Chargement..." }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {/* Spinner principal avec gradient */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-full"></div>
        
        {/* Points lumineux rotatifs */}
        <div className="absolute inset-0 animate-gentle-rotate">
          <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 shadow-glow"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2 shadow-glow-purple"></div>
        </div>
      </div>
      
      {/* Message de chargement */}
      <motion.p 
        className="mt-6 text-gray-700 text-sm font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {message}
      </motion.p>
      
      {/* Barre de progression animée avec glass effect */}
      <div className="mt-6 w-48 h-2 bg-white/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/30 shadow-lg">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full shadow-inner"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-8 h-8 bg-blue-200 rounded-full opacity-30 animate-float"></div>
        <div className="absolute bottom-32 right-16 w-6 h-6 bg-purple-200 rounded-full opacity-40 animate-blob"></div>
        <div className="absolute top-1/2 right-20 w-4 h-4 bg-pink-200 rounded-full opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;
