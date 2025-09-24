// Animations Framer Motion réutilisables

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "backOut" }
};

export const slideInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

// Animation staggered pour les listes
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Animation de hover pour les cartes
export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { duration: 0.3, ease: "easeOut" }
};

// Animation de rotation douce
export const gentleRotate = {
  rotate: [0, 5, -5, 0],
  transition: { 
    duration: 4, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

// Animation de pulsation
export const pulse = {
  scale: [1, 1.05, 1],
  transition: { 
    duration: 2, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

// Animation de typing
export const typing = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { 
    duration: 2, 
    ease: "steps(20)" 
  }
};

// Animation de révélation de texte
export const textReveal = {
  initial: { 
    opacity: 0,
    y: 20,
    clipPath: "inset(100% 0 0 0)"
  },
  animate: { 
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0 0 0)"
  },
  transition: { 
    duration: 0.8, 
    ease: "easeOut" 
  }
};

// Animation de parallax léger
export const parallax = (offset = 50) => ({
  y: [-offset, offset],
  transition: { 
    duration: 20, 
    repeat: Infinity, 
    repeatType: "reverse",
    ease: "linear" 
  }
});

// Animation de floating
export const floating = {
  y: [-10, 10],
  transition: { 
    duration: 3, 
    repeat: Infinity, 
    repeatType: "reverse",
    ease: "easeInOut" 
  }
};

// Animation de blob morphing
export const blobMorph = {
  borderRadius: [
    "30% 70% 70% 30% / 30% 30% 70% 70%",
    "70% 30% 30% 70% / 70% 70% 30% 30%",
    "30% 70% 70% 30% / 30% 30% 70% 70%"
  ],
  transition: { 
    duration: 8, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

// Variants pour les modales
export const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 50,
    transition: { 
      duration: 0.2 
    }
  }
};

// Animation de background gradient
export const gradientShift = {
  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
  transition: { 
    duration: 5, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

// Animation de glow effect
export const glowPulse = {
  boxShadow: [
    "0 0 20px rgba(59, 130, 246, 0.3)",
    "0 0 30px rgba(59, 130, 246, 0.6)",
    "0 0 20px rgba(59, 130, 246, 0.3)"
  ],
  transition: { 
    duration: 2, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};
