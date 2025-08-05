"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WaitlistForm } from "@/components/waitlist-form";
import { WaitlistButton } from "@/components/waitlist-modal";
import {
  FileText,
  Brain,
  Shield,
  MessageSquare,
  Upload,
  Zap,
  Eye,
} from "lucide-react";

export default function Home() {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-gray-900">
                Legalese AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isDevelopment && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
              {!isDevelopment && (
                <WaitlistButton source="nav" variant="default">
                  Get Early Access
                </WaitlistButton>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6">
              🚀 Launching Soon - Join the Waitlist!
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Understand your contracts in{" "}
              <span className="text-primary">seconds</span>, not hours
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Our AI-powered platform analyzes legal documents instantly,
              identifying risks, summarizing key terms, and answering your
              questions in plain English.
            </p>
            <div className="flex flex-col items-center gap-6">
              <WaitlistForm
                source="hero"
                buttonText="Get Early Access"
                placeholder="Enter your email for early access"
                className="max-w-md w-full"
              />
              <p className="text-sm text-gray-500">
                Be among the first 100 users to get{" "}
                <strong>lifetime 20% off</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology designed to make legal documents accessible to
              everyone
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advanced AI reviews your documents and identifies key clauses,
                  obligations, and potential issues
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get detailed risk scores and recommendations to help you make
                  informed decisions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Plain English</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Complex legal language translated into clear, understandable
                  summaries
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Chat Q&A</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Ask questions about your documents and get instant, accurate
                  answers
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get insights from your legal documents in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                1. Upload
              </h3>
              <p className="text-gray-600">
                Securely upload your legal documents (PDF, DOC, or TXT). Your
                files are encrypted and never stored permanently.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                2. Analyze
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your document in seconds, identifying key terms,
                risks, and important clauses automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                3. Understand
              </h3>
              <p className="text-gray-600">
                Review plain English summaries, risk assessments, and ask
                questions to fully understand your documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to revolutionize your document review?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of professionals who trust Legalese AI to analyze
            their legal documents.
          </p>
          <WaitlistForm
            source="cta_section"
            buttonText="Join Waitlist"
            placeholder="Enter your email for early access"
            className="max-w-md mx-auto"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6" />
                <span className="font-bold text-lg">Legalese AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Making legal documents accessible through AI-powered analysis
                and plain English summaries.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Legalese AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
