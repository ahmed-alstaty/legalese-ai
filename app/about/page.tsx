import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, ArrowLeft, Target, Eye, Shield, Users } from "lucide-react";
import { WaitlistButton } from "@/components/waitlist-modal";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-gray-900">Legalese AI</span>
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

      {/* Hero Section */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Making Legal Documents{" "}
              <span className="text-primary">Accessible to Everyone</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe that understanding legal documents shouldn't require a law degree. 
              Our mission is to democratize access to legal understanding through AI technology.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-6">
              Legalese AI was born out of a universal frustration. Our founders, like millions of people 
              worldwide, found themselves overwhelmed by legal documents they couldn't understand. 
              From apartment leases and insurance policies to employment contracts and terms of service - 
              all written in complex legal language that seemed designed to confuse rather than clarify.
            </p>
            <p className="mb-6">
              We realized that everyone faces this challenge. Whether you're a renter trying to understand 
              your lease agreement, a patient deciphering medical insurance coverage, an employee reviewing 
              a job offer, or a small business owner signing vendor contracts - we all need to understand 
              critical legal documents that affect our daily lives, but can't always afford legal consultation.
            </p>
            <p className="mb-6">
              That's when we decided to leverage the power of AI to democratize legal understanding. 
              By combining advanced language models with legal expertise, we created a tool that can 
              analyze any document, identify key terms and potential risks, compare different options 
              side-by-side, and explain everything in plain English - empowering you to know your rights 
              and make informed decisions.
            </p>
            <p>
              Today, Legalese AI helps people from all walks of life understand their legal documents 
              quickly and confidently. Whether you're comparing insurance plans, negotiating a lease, 
              or reviewing a contract, we're here to ensure you never sign something you don't fully 
              understand.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparency</h3>
              <p className="text-gray-600">
                We believe in making legal language clear and understandable for everyone.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600">
                Your documents are encrypted and protected with industry-leading security measures.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accuracy</h3>
              <p className="text-gray-600">
                Our AI is continuously improved to provide the most accurate analysis possible.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-600">
                Legal understanding should be available to everyone, regardless of background.
              </p>
            </Card>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Join Us in Revolutionizing Legal Understanding
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be among the first to experience the future of legal document analysis.
          </p>
          <WaitlistButton source="about_page" size="lg">
            Get Early Access
          </WaitlistButton>
        </div>
      </section>
    </div>
  );
}