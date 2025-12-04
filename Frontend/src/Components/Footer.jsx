import React from "react";
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaInstagram, FaArrowUp } from "react-icons/fa";
import logo from '../assets/Logo/logo.jpg';

function Footer() {
  return (
    <footer className="bg-white text-gray-800 pt-12 px-4 border-t border-gray-200 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        {/* Logo and Description */}
        <div className="space-y-4">
          <img src={logo} alt="logo" className="h-20 w-20" />
          <h1 className="text-2xl font-semibold">Viwahaa Matrimony</h1>
          <p className="text-gray-500">Find your Tamil soul mate here!</p>
        </div>

        {/* Useful Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Useful Links</h3>
          <ul className="space-y-2 text-sm">
            {["Home", "About Us", "Services", "Pricing", "Terms of Service", "Privacy Policy"].map((link, idx) => (
              <li key={idx}>
                <a href="#" className="text-orange-600 hover:underline">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Our Services */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Our Services</h3>
          <ul className="space-y-2 text-sm">
            {[
              "Verified Profiles",
              "Manual Profile Matching",
              "Expert Horoscope Matching",
              "Cultural Resonance",
              "Tailored Relationship Guidance",
              "Local Expertise in Jaffna",
            ].map((service, idx) => (
              <li key={idx}>
                <a href="#" className="hover:text-gray-600">{service}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact</h3>
          <address className="not-italic space-y-2 text-sm leading-relaxed">
            <p>No.222, 2nd Cross Street,<br />Jaffna, Sri Lanka</p>
            <p><strong>Mobile:</strong> +94 74 174 4952</p>
            <p><strong>Landline:</strong> +94 21 728 4036</p>
            <p>
              <a href="mailto:viwahaamatrimony@gmail.com" className="text-orange-600">
                viwahaamatrimony@gmail.com
              </a>
            </p>
          </address>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 border-t border-gray-300 text-center py-4 text-sm text-gray-600 relative">
        <p>© Copyright viwahaamatrimony.com. All Rights Reserved</p>

        {/* Social Icons */}
        <div className="mt-4 flex justify-center space-x-6 text-orange-600 text-xl">
          <FaTwitter className="cursor-pointer" />
          <FaFacebookF className="cursor-pointer" />
          <FaLinkedinIn className="cursor-pointer" />
          <FaInstagram className="cursor-pointer" />
        </div>
      </div>

      {/* Scroll Up Button */}
      <div className="absolute bottom-4 right-4">
        <button className="bg-gray-200 p-2 rounded-md hover:bg-gray-300 transition">
          <FaArrowUp className="text-gray-700" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
