import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { FaUsers, FaUser, FaCalendarAlt, FaClock } from "react-icons/fa";
import stat from '../assets/images/img_bg_3.jpg';

const StatsSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const [counts, setCounts] = useState({
    count1: 0,
    count2: 0,
    count3: 0,
    count4: 0,
  });

  const targets = {
    count1: 3056,
    count2: 5000,
    count3: 1852,
    count4: 2345,
  };

  useEffect(() => {
    if (inView) {
      Object.entries(targets).forEach(([key, end]) => {
        let start = 0;
        let duration = 2000;
        let startTime = Date.now();

        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / duration, 1);
          const current = Math.floor(start + (end - start) * progress);

          setCounts(prev => ({
            ...prev,
            [key]: current,
          }));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      });
    }
  }, [inView]);

  const stats = [
    { id: "count1", icon: <FaUsers />, label: "HAPPY COUPLES" },
    { id: "count2", icon: <FaUser />, label: "PROFILES" },
    { id: "count3", icon: <FaCalendarAlt />, label: "EVENTS DONE" },
    { id: "count4", icon: <FaClock />, label: "HOURS SPENT" },
  ];

  return (
    <div
      className="py-20 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${stat})` }}
      ref={ref}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" /> {/* Optional overlay */}
      <div className="relative max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center z-10">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="bg-white rounded-full shadow-lg p-4 mb-4">
              <div className="text-orange-500 text-3xl">{stat.icon}</div>
            </div>
            <div
              className="text-white text-4xl font-light font-workSans sm:text-5xl lg:text-6xl"
            >
              {counts[stat.id]}
            </div>
            <p className="mt-2 text-white text-sm sm:text-lg font-light tracking-wide uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
