import React, { useState } from "react";
import bg4 from '../assets/images/img_bg_4.jpg';

const InterestedForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/user/interested', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage({ text: data.message || 'Thank you for your interest!', type: 'success' });
      setFormData({ name: '', email: '' }); // Reset form
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center from-gray-800 to-gray-900 h-96"
      style={{ backgroundImage: `url(${bg4})` }}
    >
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-5xl font-semibold font-Sacremento text-white mb-4">
          Are You Interested?
        </h1>
        <p className="text-lg text-gray-300 mb-8 font-workSans">
          Please fill-up the form to notify you that you're interested.
        </p>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded-md ${
            message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}>
            {message.text}
          </div>
        )}

        <form 
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto"
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="px-5 py-3 rounded-md w-72 md:w-80 bg-gray-600 text-white placeholder-gray-300 focus:outline-none"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="px-5 py-3 rounded-md w-72 md:w-80 bg-gray-600 text-white placeholder-gray-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full transition-all duration-300 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterestedForm;