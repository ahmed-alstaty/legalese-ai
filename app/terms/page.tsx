import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 text-lg mb-6">
            Last updated: August 5, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-600">
              By accessing or using Legalese AI's services, you agree to be
              bound by these Terms of Service. If you disagree with any part of
              these terms, you may not access our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-600">
              Legalese AI provides AI-powered legal document analysis services.
              Our service helps users understand legal documents through:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
              <li>Automated document analysis and summarization</li>
              <li>Risk assessment and identification of key terms</li>
              <li>Plain English explanations of legal language</li>
              <li>Interactive Q&A about uploaded documents</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Important Disclaimers
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-900 font-semibold">
                LEGALESE AI DOES NOT PROVIDE LEGAL ADVICE
              </p>
            </div>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Our service provides information and analysis only</li>
              <li>
                We are not a law firm and do not provide legal representation
              </li>
              <li>
                Analysis should not replace consultation with qualified legal
                counsel
              </li>
              <li>We do not guarantee accuracy or completeness of analysis</li>
              <li>Users are responsible for their own legal decisions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. User Accounts
            </h2>
            <p className="text-gray-600 mb-4">To use our service, you must:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Acceptable Use
            </h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Upload illegal, harmful, or malicious content</li>
              <li>Attempt to reverse engineer or hack our service</li>
              <li>Use our service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Share your account with unauthorized users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Intellectual Property
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Your Content
            </h3>
            <p className="text-gray-600">
              You retain all rights to documents you upload. By using our
              service, you grant us a limited license to process your documents
              for analysis purposes only.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">
              Our Content
            </h3>
            <p className="text-gray-600">
              All other content, including our AI models, software, and
              branding, remains our exclusive property.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Payment Terms
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Subscription fees are billed in advance</li>
              <li>All payments are non-refundable unless required by law</li>
              <li>We may change pricing with 30 days notice</li>
              <li>Failure to pay may result in service suspension</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-600">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEGALESE AI SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Indemnification
            </h2>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless Legalese AI from any
              claims, damages, or expenses arising from your use of our service
              or violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Termination
            </h2>
            <p className="text-gray-600">
              We may terminate or suspend your account immediately, without
              prior notice, for any breach of these Terms. Upon termination,
              your right to use the service will cease immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Governing Law
            </h2>
            <p className="text-gray-600">
              These Terms shall be governed by the laws of [Your Jurisdiction],
              without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Changes to Terms
            </h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes via email or through the
              service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              13. Contact Information
            </h2>
            <p className="text-gray-600">
              For questions about these Terms, please contact us at:
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
