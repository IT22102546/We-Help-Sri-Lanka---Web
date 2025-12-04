import { CheckCircle, FileText, Wifi, Heart, Sun, Globe } from "lucide-react";

export default function ServicesSection() {
  return (
    <section className="bg-[#f7f7f7] py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-[48px] md:text-[48px] font-Sacremento font-semibold text-[#f97316] mb-4">
          We Offer Services
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto mb-12 font-workSans">
          Dignissimos asperiores vitae velit veniam totam fuga molestias
          accusamus alias autem provident. Odit ab aliquam dolor eius.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-10 px-20">
          <ServiceCard
            icon={<CheckCircle className="text-[#f97316] w-6 h-6" />}
            title="VERIFIED PROFILES"
            description="Trust in genuine connections with our rigorous profile verification process, ensuring authenticity and security in your search for a life partner."
          />
          <ServiceCard
            icon={<Wifi className="text-[#f97316] w-6 h-6" />}
            title="CULTURAL RESONANCE"
            description="Celebrate the richness of traditions as we bridge cultural gaps, creating meaningful connections that honor your heritage and values."
          />
          <ServiceCard
            icon={<FileText className="text-[#f97316] w-6 h-6" />}
            title="MANUAL PROFILE MATCHING"
            description="Experience personalized matchmaking with our expert team's hands-on approach, carefully curating connections based on shared values and compatibility."
          />
          <ServiceCard
            icon={<Heart className="text-[#f97316] w-6 h-6" />}
            title="TAILORED RELATIONSHIP GUIDANCE"
            description="Benefit from personalized advice and support as you navigate the journey to marriage, with our experienced team providing insights for a strong foundation."
          />
          <ServiceCard
            icon={<Sun className="text-[#f97316] w-6 h-6" />}
            title="EXPERT HOROSCOPE MATCHING"
            description="Unlock cosmic compatibility with our seasoned astrological experts, aligning celestial energies for harmonious and lasting unions."
          />
          <ServiceCard
            icon={<Globe className="text-[#f97316] w-6 h-6" />}
            title="LOCAL EXPERTISE IN JAFFNA"
            description="Leverage our in-depth understanding of the Jaffna community, ensuring a matrimony service that is attuned to local customs and preferences."
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4 text-left">
      <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center px-3">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-normal text-gray-500 mb-1 uppercase font-workSans">
          {title}
        </h3>
        <p className="text-sm text-gray-500 font-workSans">{description}</p>
      </div>
    </div>
  );
}
