"use client";

import { useState } from "react";

const SettingsPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const [formData, setFormData] = useState({
    geminiAPIKey: "",
    openaiAPIKey: "",
    primaryAIProvider: "Google Gemini",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submitted data: ", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProviderChange = (provider: string) => {
    setFormData((prevData) => ({
      ...prevData,
      primaryAIProvider: provider,
    }));
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="flex items-start justify-center min-h-screen bg-gray-100  ">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-full max-w-prose"
        >
          <h2 className="text-xl font-bold mb-4">Change Settings</h2>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="geminiAPIKey"
            >
              Gemini API Key
            </label>
            <input
              type="text"
              name="geminiAPIKey"
              value={formData.geminiAPIKey}
              onChange={handleChange}
              className="mt-1 block w-full p-4 border border-gray-300 rounded"
              placeholder="Enter your new Gemini API Key"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="openaiAPIKey"
            >
              OpenAI API Key
            </label>
            <input
              type="text"
              name="openaiAPIKey"
              value={formData.openaiAPIKey}
              onChange={handleChange}
              className="mt-1 block w-full p-4 border border-gray-300 rounded"
              placeholder="Enter your new OpenAI API Key"
            />
          </div>

          <div className="relative mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="dropdownDefaultButton"
            >
              Change your Primary Provider
            </label>
            {/* Dropdown Button */}
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              className="mt-1 block w-full p-4 border border-gray-300 rounded bg-black text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm text-center inline-flex items-center justify-between"
              type="button"
              onClick={toggleDropdown}
            >
              Primary Provider: {formData.primaryAIProvider}
              <svg
                className="w-2.5 h-2.5 ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="dropdown"
                className="absolute left-0 mt-2 w-full bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 z-10"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <a
                      onClick={() => handleProviderChange("OpenAI")}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      OpenAI
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => handleProviderChange("Google Gemini")}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                      Google Gemini
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-4 rounded hover:bg-blue-600 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingsPage;
