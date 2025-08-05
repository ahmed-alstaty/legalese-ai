"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle } from "lucide-react";

interface WaitlistFormProps {
  source?: string;
  buttonText?: string;
  placeholder?: string;
  className?: string;
  onSuccess?: () => void;
}

export function WaitlistForm({ 
  source = "landing_page",
  buttonText = "Join Waitlist",
  placeholder = "Enter your email",
  className = "",
  onSuccess
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setSuccess(true);
      setEmail("");
      if (onSuccess) onSuccess();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`flex items-center justify-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">You're on the list! We'll be in touch soon.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <Input
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !email}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          buttonText
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-2 sm:absolute sm:bottom-[-24px]">{error}</p>
      )}
    </form>
  );
}