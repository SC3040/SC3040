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
import { CheckCircle2Icon, AlertTriangle, Key, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

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

  // timer to remove success message after 2s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    alert("pressed submit")
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Shield className="mr-2 h-6 w-6 text-blue-600" />
              Secure API Settings
            </h2>
            <p className="text-sm text-gray-600">Manage your AI provider preferences and API keys</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dropdownDefaultButton">Select your default Provider</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    ref={buttonRef}
                    id="dropdownDefaultButton"
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
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
                <DropdownMenuContent style={{ width: dropdownWidth ? `${dropdownWidth}px` : "auto" }}>
                  <DropdownMenuItem onSelect={() => handleProviderChange("OpenAI")}>OpenAI</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleProviderChange("Google Gemini")}>Google Gemini</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geminiAPIKey">Gemini API Key</Label>
              <div className="relative">
                <Input
                  type={showGeminiKey ? "text" : "password"}
                  name="geminiAPIKey"
                  id="geminiAPIKey"
                  value={formData.geminiAPIKey}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  placeholder="Enter your new Gemini API Key"
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                >
                  {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Status: {tokenStatus?.geminiKey === "SET" ? (
                  <span className="text-green-600 font-semibold">SET</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">UNSET</span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openaiAPIKey">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  type={showOpenAIKey ? "text" : "password"}
                  name="openaiAPIKey"
                  id="openaiAPIKey"
                  value={formData.openaiAPIKey}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  placeholder="Enter your new OpenAI API Key"
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                >
                  {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Status: {tokenStatus?.openaiKey === "SET" ? (
                  <span className="text-green-600 font-semibold">SET</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">UNSET</span>
                )}
              </p>
            </div>

            {successMessage && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes Securely"}
              <Lock className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SettingsPage;
