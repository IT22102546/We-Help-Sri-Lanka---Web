import React from "react";
import groom from "../assets/images/groom.jpg";
import bride from "../assets/images/bride.jpg";

const MatchingSection = () => {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* For Desktop View */}
        <div className="hidden md:flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
          <div className="max-w-md text-center md:text-right">
            <h3 className="text-4xl font-semibold font-Sacremento text-orange-500 mb-4">
              Manual profile matching
            </h3>
            <p className="text-gray-600 font-workSans leading-relaxed">
              Elevate your matrimony experience with vivrahamatrimony.com and
              our distinctive approach to connections – "manual profile
              matching." Unlike automated systems, our expert team meticulously
              analyzes and matches profiles based on shared values and
              compatibility.
            </p>
          </div>

          <div className="relative flex items-center justify-center gap-3">
            <img
              src={groom}
              alt="Groom"
              className="w-36 h-36 rounded-full object-cover"
            />
            <div className="absolute left-26 -translate-x-1/2 bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-md  animate-heartbeat">
              <span className="text-orange-500 text-lg">🧡</span>
            </div>

            <img
              src={bride}
              alt="Bride"
              className="w-36 h-36 rounded-full object-cover"
            />
          </div>

          <div className="max-w-md text-center md:text-left">
            <h3 className="text-4xl font-semibold font-Sacremento text-orange-500 mb-4">
              Expert horoscope matching
            </h3>
            <p className="text-gray-600 font-workSans leading-relaxed">
              Embark on a journey of celestial love with vivrahamatrimony.com,
              where meaningful connections are forged through "Expert Horoscope
              Matching." Our seasoned astrological experts meticulously analyze
              horoscopes, aligning cosmic energies to pave the way for
              harmonious unions.
            </p>
          </div>
        </div>

        {/* For Mobile View */}
       
      <div className="block md:hidden space-y-10">
        {/* Manual Profile Matching - Image Right */}
        <div className="flex items-center justify-between px-4">
          <div className="w-1/2 pr-2">
            <h3 className="text-3xl font-semibold font-Sacremento text-orange-500 mb-2">
              Manual profile matching
            </h3>
            <p className="text-gray-600 font-workSans text-md leading-relaxed">
              Elevate your matrimony experience with vivahaamatrimony.com and our
              distinctive approach to connections – "manual profile matching."
              Unlike automated systems, our expert team meticulously analyzes and
              matches profiles based on shared values and compatibility.
            </p>
          </div>
          <div className="w-1/2 pl-2 flex justify-end">
            <img
              src={groom}
              alt="groom_img"
              className="w-29 h-29 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Expert Horoscope Matching - Image Left */}
        <div className="flex items-center justify-between px-4">
          <div className="w-1/2 pr-2 flex justify-start">
            <img
              src={bride}
              alt="bride_img"
              className="w-29 h-29 rounded-full object-cover"
            />
          </div>
          <div className="w-1/2 pl-2">
            <h3 className="text-3xl font-semibold font-Sacremento text-orange-500 mb-2">
              Expert horoscope matching
            </h3>
            <p className="text-gray-600 font-workSans text-md leading-relaxed">
              Embark on a journey of celestial love with vivahaamatrimony.com,
              where meaningful connections are forged through "Expert Horoscope
              Matching." Our seasoned astrological experts meticulously analyze
              horoscopes, aligning cosmic energies to pave the way for harmonious
              unions.
            </p>
          </div>
        </div>
      </div>

      </div>
    </section>
  );
};

export default MatchingSection;
