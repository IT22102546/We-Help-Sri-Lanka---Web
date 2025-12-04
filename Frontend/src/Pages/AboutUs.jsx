import React, { useEffect } from "react";
import pic1 from "../assets/Logo/logo.jpg";
import pic2 from "../assets/Logo/logo.jpg";
import pic3 from "../assets/Logo/logo.jpg";
import pic4 from "../assets/Logo/logo.jpg";

const AboutUs = () => {
  useEffect(() => {
    const animateElements = document.querySelectorAll(".animate-box");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fadeIn");
          }
        });
      },
      { threshold: 0.1 }
    );

    animateElements.forEach((el) => observer.observe(el));
    return () => {
      animateElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const timelineContent = [
    {
      img: pic1,
      text: (
        <>
          At Viwahaa Matrimony, we pride ourselves on fostering authentic relationships through our meticulous profile verification process. We understand the importance of authenticity and security in your quest for a life partner, which is why we ensure that each profile is rigorously vetted to guarantee genuineness and reliability.<br /><br />

          Our approach to matchmaking goes beyond algorithms and swipes. With our expert team's personalized touch, we delve into the intricacies of shared values and compatibility, curating connections that are not just based on surface-level attraction, but on deep resonance and understanding.
        </>
      ),
    },
    {
      img: pic2,
      text: (
        <>
          In addition to manual profile matching, we offer a unique dimension to compatibility assessment through expert horoscope matching. Our seasoned astrological experts decipher celestial energies to unlock cosmic compatibility, paving the way for harmonious and lasting unions.<br /><br />

          Viwahaa Matrimony celebrates diversity and cultural richness. We understand the importance of bridging cultural gaps and honoring traditions. Our platform serves as a bridge, creating meaningful connections that respect and honor your heritage and values.
        </>
      ),
    },
    {
      img: pic3,
      text: (
        <>
          Navigating the journey to marriage can be daunting, but you don't have to do it alone. With Viwahaa Matrimony, you'll receive tailored relationship guidance from our experienced team. Whether it's advice on communication, conflict resolution, or nurturing a strong foundation, we're here to support you every step of the way.<br /><br />

          Located in the heart of Jaffna, we bring a deep understanding of the local community's customs and preferences. Our expertise in the Jaffna community ensures that our matrimony service is attuned to your specific needs, providing a personalized experience that resonates with your cultural background.
        </>
      ),
    },
    {
      img: pic4,
      text: (
        <>
          At Viwahaa Matrimony, we believe that everyone deserves a chance at happiness and companionship. With our commitment to authenticity, personalized matchmaking, cultural resonance, and local expertise, we are dedicated to helping you find your perfect match and embark on a journey of love and companionship.<br /><br />

          Join us today and let us be your trusted partner in the pursuit of a fulfilling and meaningful relationship.
        </>
      ),
    },
  ];

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 animate-box">
          <span className="text-gray-600 text-lg">Welcome to</span>
          <h2 className="text-4xl font-bold font-Sacremento text-orange-500 mt-2 mb-4">
            Viwahaa Matrimony
          </h2>
          <p className="text-gray-600 text-lg">
            Welcome to Viwahaa Matrimony, where genuine connections flourish,
            and lifelong unions are forged with trust, care, and expertise.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-500 z-0"></div>
          <div className="md:hidden absolute left-8 h-full w-1 bg-orange-500 z-0"></div>

          <ul className="space-y-16 relative z-10">
            {timelineContent.map((item, index) => {
              const isLeft = index % 2 === 0;
              return (
                <li
                  key={index}
                  className={`flex flex-col md:flex-row items-start justify-between gap-6 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  } animate-box`}
                >
                  {/* Content */}
                  <div className={`md:w-5/12 bg-white p-6 rounded-lg shadow-md ${isLeft ? "md:ml-0" : "md:mr-0"} ml-24 md:ml-0`}>
                    <p className="text-gray-700 text-justify">{item.text}</p>
                  </div>

                  {/* Image with timeline */}
                  <div className="absolute md:relative left-0 md:left-auto md:mx-4 w-16 h-16 rounded-full border-4 border-white shadow-[0_0_0_2px_#f97316] flex-shrink-0 z-20">
                    <img
                      src={item.img}
                      alt={`Timeline ${index + 1}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  {/* Placeholder for alignment */}
                  <div className="hidden md:block md:w-5/12"></div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;