import React from "react";
import { IconBase } from "react-icons/lib";
import ServicesSection from "../Components/ServiceSection";
import PricingTable from "../Components/Pricing";
import InterestedForm from "../Components/InterestedForm";
import TestimonialCarousel from "../Components/TestimonialCarousel";
import MatchingSection from "../Components/MatchingSection";
import StatsSection from "../Components/StatsSection";
import { useSelector } from "react-redux";

export default function Home() {
  const currentUser = useSelector((state) => state.currentUser);
  console.log(currentUser);
  return (
    <>
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-semibold font-Sacremento text-center mb-4 text-orange-500">
            How we Do!
          </h2>

          <div className="rounded-lg p-4">
            <h3 className="text-2xl font-normal mb-4 text-gray-700 text-center font-workSans">
              Manually verified Profiles
            </h3>
            <p className="text-gray-500 leading-relaxed text-center font-workSans text-[18px]">
              Our commitment to your journey of finding a life partner is
              exemplified through our exclusive focus on "verified profiles." We
              take pride in ensuring that every profile on our platform
              undergoes a rigorous verification process, providing you with a
              secure and reliable environment to connect with potential matches.
              With viwahaanatrimony.com, embark on your quest for love with
              confidence, knowing that each profile is authenticated, offering
              you the assurance of genuine connections and lasting
              relationships. Trust in the power of verified profiles as you take
              the first step towards a blissful union.
            </p>
          </div>
        </div>
      </section>

      {/* matching section */}
      <MatchingSection />

      {/* stats section */}
      <StatsSection />

      {/* service section */}
      <ServicesSection />

      {/* pricing section */}
      <PricingTable />

      {/* testimonial carousel */}
      <TestimonialCarousel />

      {/* interested form */}
      <InterestedForm />
    </>
  );
}
