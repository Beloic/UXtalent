import React from "react";

export default function ToggleChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:scale-105",
        active 
          ? "bg-blue-600 text-white border-transparent shadow-lg" 
          : "border-gray-200 bg-white/70 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
      ].join(" ")}
    >
      {children}
    </button>
  );
}