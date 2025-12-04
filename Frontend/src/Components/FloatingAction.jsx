import React from "react";

function FloatingAction() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-700 text-white text-xl font-bold p-4 rounded-xl shadow-lg transition-all duration-300 z-50"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}

export default FloatingAction;
