"use client";

import React, { useState } from "react";

const N8nFormTrigger: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("message", formData.message);
    if (file) {
      formDataToSend.append("file", file);
    }

    const response = await fetch("https://tok-n8n-sol.onrender.com/webhook-test/9e580d71-241c-4579-afbb-0cf5782465fc", {
      method: "POST",
      body: formDataToSend,
    });

    if (response.ok) {
      setIsSubmitted(true);
    } else {
      console.error("Failed to submit form");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="p-4 max-w-md w-full bg-white bg-opacity-80 rounded-lg shadow-lg">
        <h1 className="text-2xl mb-4 text-center font-bold" style={{ color: "darkblue" }}>
          Contact Us
        </h1>
        <p className="mb-4 text-center" style={{ color: "darkblue" }}>
          We&apos;ll get back to you soon.
        </p>
        {isSubmitted ? (
          <div className="text-center text-green-500 font-semibold">
            Thank you! Your response has been submitted.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="What is your name?"
                required
                className="px-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ color: "darkblue" }}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="px-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ color: "darkblue" }}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message here"
                required
                className="px-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ color: "darkblue" }}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Upload an Image</label>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                accept="image/*"
                className="px-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-full shadow-lg w-full sm:w-auto transform transition-transform duration-200 active:scale-95"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default N8nFormTrigger;
