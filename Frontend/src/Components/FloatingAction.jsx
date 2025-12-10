import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

function FloatingAction() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-6 bottom-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 shadow-lg cursor-pointer"
      style={{
        // Inline style prevents any class name interpretation
        backgroundColor: '#1f2937'
      }}
    >
      <FaArrowUp className="text-white text-lg" />
    </div>
  );
}

export default FloatingAction;