'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import { useApiTokens } from "@/hooks/useApiTokens";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const SettingsPage = () => {
  const { loading, error, tokenStatus, updateTokens, fetchTokenStatus } =
    useApiTokens();
  const [formData, setFormData] = useState({
    geminiAPIKey: "",
    openaiAPIKey: "",
    primaryAIProvider: "Google Gemini",
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(
    undefined
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (buttonRef.current) {
      setDropdownWidth(buttonRef.current.offsetWidth);
    }

    if (tokenStatus) {
      setFormData((prevData) => ({
        ...prevData,
        primaryAIProvider: tokenStatus.defaultModel,
      }));
    }
  }, [tokenStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: {
      defaultModel: string;
      geminiKey?: string;
      openaiKey?: string;
    } = {
      defaultModel: formData.primaryAIProvider,
    };

    // Only include keys if they are provided by the user (non-empty)
    if (formData.geminiAPIKey) payload.geminiKey = formData.geminiAPIKey;
    if (formData.openaiAPIKey) payload.openaiKey = formData.openaiAPIKey;

    try {
      await updateTokens(payload);
      setSuccessMessage("Settings updated successfully!");
      await fetchTokenStatus();
    } catch {
      setSuccessMessage(null);
    }
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
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-prose"
      >
        <h2 className="text-xl font-bold mb-4">Change Settings</h2>

        <div className="relative mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="dropdownDefaultButton"
          >
            Change your Primary Provider
          </label>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                ref={buttonRef}
                id="dropdownDefaultButton"
                className="mt-1 block w-full p-4 border border-gray-300 rounded bg-black text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm text-center inline-flex items-center justify-between"
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
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              style={{ width: dropdownWidth ? `${dropdownWidth}px` : "auto" }}
            >
              <DropdownMenuItem onSelect={() => handleProviderChange("OpenAI")}>
                OpenAI
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleProviderChange("Google Gemini")}
              >
                Google Gemini
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
          <p className="text-sm text-gray-500 mt-1">
            Status: {tokenStatus?.geminiKey === "SET" ? "SET" : "UNSET"}
          </p>
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
          <p className="text-sm text-gray-500 mt-1">
            Status: {tokenStatus?.openaiKey === "SET" ? "SET" : "UNSET"}
          </p>
        </div>

        {successMessage && (
          <div className="p-4 mb-4 rounded-lg border border-green-500 bg-green-50 text-green-700 flex items-center space-x-2">
            <CheckCircle2Icon className="h-5 w-5 text-green-600" />
            <AlertDescription>{successMessage}</AlertDescription>
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 rounded-lg border border-red-500 bg-red-50 text-red-700 flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <AlertDescription>{error}</AlertDescription>
          </div>
        )}

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-4 rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
