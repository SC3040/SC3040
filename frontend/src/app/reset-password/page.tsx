"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // To track the step of the reset process
  const [alertMessage, setAlertMessage] = useState(""); // For error/success messages
  const [alertType, setAlertType] = useState<"error" | "success">("success");

  // Step 1: Fetch the security question using the token
  useEffect(() => {
    if (token) {
      const fetchSecurityQuestion = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `http://localhost:8080/api/users/get-security-question?token=${token}`
          );
          const data = await response.json();
          if (response.ok) {
            setSecurityQuestion(data.question); // Assuming backend returns question in `data.question`
            setStep(2); // Move to step 2: answering security question
          } else {
            setAlertMessage(
              data.message || "Failed to load security question."
            );
            setAlertType("error");
          }
        } catch (error) {
          setAlertMessage("An unexpected error occurred.");
          setAlertType("error");
        }
        setLoading(false);
      };

      fetchSecurityQuestion();
    }
  }, [token]);

  // Step 2: Verify security question answer
  const handleVerifyAnswer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/verify-security-question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, answer: securityAnswer }),
        }
      );

      const data = await response.json();
      if (response.ok && data.verified) {
        setStep(3); // Move to step 3: reset password
      } else {
        setAlertMessage(
          data.message || "Incorrect answer to the security question."
        );
        setAlertType("error");
      }
    } catch (error) {
      setAlertMessage("An unexpected error occurred.");
      setAlertType("error");
    }
    setLoading(false);
  };

  // Step 3: Handle resetting the password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setAlertMessage(data.message || "Password successfully reset.");
        setAlertType("success");
        setStep(4); // Password reset is complete
      } else {
        setAlertMessage(data.message || "Password reset failed.");
        setAlertType("error");
      }
    } catch (error) {
      setAlertMessage("An unexpected error occurred.");
      setAlertType("error");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertMessage && (
            <Alert variant={alertType === "error" ? "destructive" : "default"}>
              <AlertTitle>
                {alertType === "error" ? "Error" : "Success"}
              </AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAnswer}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{securityQuestion}</Label>
                  <Input
                    id="answer"
                    name="answer"
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Verifying..." : "Submit Answer"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
