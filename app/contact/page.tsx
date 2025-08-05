import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, ArrowLeft, Mail, Clock } from "lucide-react";
import { WaitlistForm } from "@/components/waitlist-form";

export default function ContactPage() {
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
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about Legalese AI? We're here to help. Reach out to
            us using any of the methods below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
          <Card className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Us
            </h3>
            <p className="text-gray-600 mb-4">
              For general inquiries and support
            </p>
            <a
              href="mailto:contact@getlegalese.app"
              className="text-primary hover:underline"
            >
              contact@getlegalese.app
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Response Time
            </h3>
            <p className="text-gray-600 mb-4">We typically respond within</p>
            <p className="text-2xl font-bold text-primary">24 hours</p>
          </Card>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Stay Updated
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Join our waitlist to be the first to know when we launch and get
              exclusive early access benefits.
            </p>
            <WaitlistForm
              source="contact_page"
              buttonText="Join Waitlist"
              placeholder="Enter your email address"
            />
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4 max-w-3xl mx-auto text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                When will Legalese AI launch?
              </h4>
              <p className="text-gray-600">
                We're planning to launch in Q1 2026. Join our waitlist to get
                early access and special launch pricing.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h4>
              <p className="text-gray-600">
                Yes! We use end-to-end encryption and follow industry best
                practices to ensure your documents remain private and secure.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                Do you provide legal advice?
              </h4>
              <p className="text-gray-600">
                No, Legalese AI provides document analysis and information only.
                We recommend consulting with a qualified attorney for legal
                advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
