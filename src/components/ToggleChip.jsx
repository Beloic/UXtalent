import React from "react";

export default function ToggleChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 btn-modern",
        active 
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-transparent shadow-xl shadow-blue-200" 
          : "border-gray-200 bg-white/70 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-lg backdrop-blur-sm"
      ].join(" ")}
    >
      {children}
    </button>
  );
}