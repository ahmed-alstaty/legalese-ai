import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 text-lg mb-6">
            Last updated: August 5, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600">
              Legalese AI ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our
              AI-powered legal document analysis service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Personal Information
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Email address (for waitlist and account creation)</li>
              <li>Name (optional, for account personalization)</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">
              Document Information
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Legal documents you upload for analysis</li>
              <li>AI-generated analysis and summaries</li>
              <li>Questions you ask about your documents</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">
              Usage Information
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Log data (IP address, browser type, access times)</li>
              <li>Device information</li>
              <li>Usage patterns and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and improve our document analysis services</li>
              <li>Process your documents and generate AI insights</li>
              <li>Communicate with you about your account and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-600">
              We implement industry-standard security measures to protect your
              information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>End-to-end encryption for document uploads</li>
              <li>Secure data storage with encryption at rest</li>
              <li>Regular security audits and updates</li>
              <li>Strict access controls for our team</li>
              <li>
                Automatic deletion of documents after processing (unless you
                choose to save them)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Retention
            </h2>
            <p className="text-gray-600">
              We retain your information only as long as necessary:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>
                Uploaded documents: Deleted immediately after analysis (unless
                saved)
              </li>
              <li>Analysis results: Retained while your account is active</li>
              <li>Account information: Retained until account deletion</li>
              <li>Legal records: As required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Third-Party Services
            </h2>
            <p className="text-gray-600">
              We use trusted third-party services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>
                OpenAI for AI analysis (documents are not stored by OpenAI)
              </li>
              <li>Stripe for payment processing</li>
              <li>Supabase for secure data storage</li>
              <li>Vercel for hosting and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Your Rights
            </h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request restrictions on processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-gray-600">
              Our service is not intended for children under 18. We do not
              knowingly collect information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Changes to This Policy
            </h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes via email or through our
              service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us
              at:
            </p>
            <ul className="list-none text-gray-600 mt-4">
              <li>Email: contact@legalese-ai.com</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
