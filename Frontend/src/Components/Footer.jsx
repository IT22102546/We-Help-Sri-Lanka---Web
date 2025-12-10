import logo from '../assets/Logo/logowhite.png';
import React from "react";

import { motion } from "framer-motion";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
  FaHandHoldingHeart,
  FaLeaf,
  FaShieldAlt,
  FaTruck,
  FaUsers,
  FaDonate,
  FaGlobe,
  FaRegCopyright,
} from "react-icons/fa";
import { MdLocationOn, MdEmail, MdPhone } from "react-icons/md";


function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Emergency Requests", href: "#" },
    { label: "How to Help", href: "#" },
    { label: "Become a Volunteer", href: "#" },
    { label: "Transport Providers", href: "https://docs.google.com/spreadsheets/d/1Mv7sSDaGTK7pjzBT9vYvI_4xY7hCC8U4ggF_KbOSeTQ/edit?usp=drivesdk" },
    { label: "Success Stories", href: "#" },
    { label: "About Us", href: "#t" },
  ];



  const contactInfo = [
    {
      icon: <FaPhone className="h-4 w-4" />,
      label: "Hasini (Coordinator)",
      value: "077 100 0459",
      href: "tel:0771000459",
      color: "text-green-400",
    },
    {
      icon: <FaPhone className="h-4 w-4" />,
      label: "Emergency",
      value: "117",
      href: "tel:117",
      color: "text-red-400",
    },
    {
      icon: <MdEmail className="h-4 w-4" />,
      label: "Email",
      value: "wehelp@srilankasupport.org",
      href: "mailto:wehelp@srilankasupport.org",
      color: "text-blue-400",
    },
    {
      icon: <MdLocationOn className="h-4 w-4" />,
      label: "Based In",
      value: "Colombo, Sri Lanka",
      href: "#",
      color: "text-orange-400",
    },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      url: "https://www.facebook.com/share/p/17cZ6DZbAM/?mibextid=wwXIfr",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      url: "https://www.instagram.com/p/DRzgyrfEup8/?igsh=ejdmaWR5M3MwcWMx",
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
    },
    {
      name: "WhatsApp Channel",
      icon: FaWhatsapp,
      url: "https://whatsapp.com/channel/0029VbBqS9qIyPtOpKOwJL0u",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "Email Us",
      icon: FaEnvelope,
      url: "mailto:wehelp@srilankasupport.org",
      color: "bg-red-600 hover:bg-red-700",
    },
  ];

  const stats = [
    { value: "350+", label: "Active Requests", icon: FaHeart },
    { value: "8,567+", label: "People Helped", icon: FaUsers },
    { value: "24", label: "Districts", icon: FaGlobe },
    { value: "100%", label: "Verified", icon: FaShieldAlt },
  ];

  const handleSocialClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePhoneClick = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-12 pb-8">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Left Column - Brand & Contact */}
          <div className="space-y-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 shadow-2xl">
                    <img
                      src={logo}
                      alt="We Help Sri Lanka Logo"
                      className="h-10"
                    />
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      <FaLeaf className="h-3 w-3" />
                    </div>
                  </motion.div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    We Help Sri Lanka
                  </h2>
                  <p className="text-sm text-gray-300 flex items-center gap-2">
                    <FaHandHoldingHeart className="h-3 w-3" />
                    <span>Connecting Hearts, Saving Lives</span>
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A community-driven initiative connecting those in need with generous hearts.
                Together, we're building a stronger, more resilient Sri Lanka.
              </p>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaPhone className="h-4 w-4 text-emerald-400" />
                Contact Information
              </h3>
              <div className="space-y-3">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={() => 
                      item.href.includes("tel:") 
                        ? handlePhoneClick(item.value) 
                        : handleSocialClick(item.href)
                    }
                  >
                    <div className={`p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">{item.label}</div>
                      <div className="text-sm font-medium group-hover:text-emerald-300 transition-colors">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Links & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaHandHoldingHeart className="h-4 w-4 text-emerald-400" />
                Quick Links
              </h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-emerald-300 text-sm transition-colors flex items-center gap-2 group"
                    >
                      <div className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            
          </div>
        </div>

        {/* Social Media & Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center md:text-left">
                Connect With Us
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {socialLinks.map((social, index) => (
                  <motion.button
                    key={social.name}
                    className={`p-3 rounded-xl text-white transition-all ${social.color} shadow-lg hover:shadow-xl`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSocialClick(social.url)}
                    title={social.name}
                  >
                    <div className="flex items-center gap-2">
                      <social.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{social.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Live Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center md:text-right">
                Our Impact
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-center mb-2">
                      <stat.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Copyright & Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400 flex items-center justify-center md:justify-start gap-2">
                <FaRegCopyright className="h-3 w-3" />
                {currentYear} We Help Sri Lanka. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                A community initiative powered by volunteers and supported by generous donors.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <FaTruck className="h-3 w-3 text-green-400" />
                <span>Live Deliveries: 12</span>
              </div>
              <div className="h-4 w-px bg-gray-700 hidden md:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Made with</span>
                <FaHeart className="h-4 w-4 text-red-500 animate-pulse" />
                <span className="text-sm text-gray-400">in Sri Lanka</span>
              </div>
            </div>
          </div>

          
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;