import { Mail, MapPin, Phone } from "lucide-react";
import React from "react";

const ContactSection = () => {
  return (
    <div className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold font-workSans text-orange-500">
            Contact Information
          </h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-center space-x-4">
              <MapPin className="h-6 w-6 text-orange-500" />{" "}
              {/* Location Icon */}
              <p className="font-workSans">
                No.222, 2nd Cross Street, Jaffna, Sri Lanka
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-orange-500" /> {/* Phone Icon */}
              <p className="font-workSans">+94 74 174 4952</p>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-orange-500" />{" "}
              {/* Second Phone Icon */}
              <p className="font-workSans">+94 21 728 4036</p>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-orange-500" /> {/* Email Icon */}
              <p className="font-workSans">viwahaamatrimony@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold font-workSans text-orange-500">
            Get In Touch
          </h2>
          <form action="#" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="block text-gray-700">
                  First Name
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Your firstname"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-gray-700">
                  Last Name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Your lastname"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Your email address"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-gray-700">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Your subject of this message"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Write us something"
              ></textarea>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 font-workSans"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
