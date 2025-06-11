"use client";
import React, { useState } from "react";
import {
  Shield,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

const LandingComponent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Blockchain Verified",
      description:
        "Immutable records stored on-chain with cryptographic proof of authenticity.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Soulbound Tokens",
      description:
        "Non-transferable certificates that create permanent professional credentials.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Decentralized Governance",
      description:
        "Admin and supervisor roles with transparent approval mechanisms.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Instant Verification",
      description:
        "Real-time credential verification through blockchain transparency.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Universal Access",
      description:
        "View and verify any SBT certificate from anywhere in the world instantly.",
    },
  ];

  const stats = [
    { value: "100%", label: "Tamper Proof" },
    { value: "0", label: "Gas Fees*" },
    { value: "∞", label: "Permanent Storage" },
    { value: "24/7", label: "Verification" },
  ];

  return (
    <div className="min-h-screen bg-black text-white scroll-smooth">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold">CertiSBT</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                How It Works
              </a>
              <a
                href="#stats"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Stats
              </a>
              <button
                onClick={() => router.push("/view")}
                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View SBTs
              </button>
              <button
                onClick={() => router.push("/mint")}
                className="bg-gradient-to-r from-green-400 to-blue-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Launch App
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-400"
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black">
            <div className="px-6 py-4 space-y-3">
              <a
                href="#features"
                className="block text-gray-400 hover:text-white transition-colors text-base"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-gray-400 hover:text-white transition-colors text-base"
              >
                How It Works
              </a>
              <a
                href="#stats"
                className="block text-gray-400 hover:text-white transition-colors text-base"
              >
                Stats
              </a>
              <button
                onClick={() => router.push("/view")}
                className="w-full text-left text-gray-400 hover:text-white transition-colors text-base flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View SBTs
              </button>
              <button
                onClick={() => router.push("/mint")}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-black px-4 py-2 rounded-lg text-base font-medium"
              >
                Launch App
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-400 mb-8">
            <TrendingUp className="w-3 h-3 mr-2 text-green-400" />
            Powered by Blockchain Technology
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Professional Certificates
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              On-Chain Forever
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Issue tamper-proof internship certificates as Soulbound Tokens.
            Create permanent, verifiable professional records on the blockchain.
            View and verify any certificate instantly from anywhere in the
            world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/mint")}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-black px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>

            <button
              onClick={() => router.push("/view")}
              className="border border-gray-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center"
            >
              <Eye className="mr-2 w-4 h-4" />
              View Certificates
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          id="stats"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-gray-800"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for the Decentralized Future
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Leveraging blockchain technology to create an unbreakable chain of
              trust for professional credentials with universal accessibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-black border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center mb-4">
                  <div className="text-green-400 mr-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Process, Powerful Results
            </h2>
            <p className="text-lg text-gray-400">
              Five steps to issue and verify blockchain-verified internship
              certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              {
                step: "01",
                title: "Request Role",
                description:
                  "Apply for supervisor privileges through the platform.",
              },
              {
                step: "02",
                title: "Get Approved",
                description:
                  "Admin reviews and approves your supervisor application.",
              },
              {
                step: "03",
                title: "Mint Certificate",
                description:
                  "Issue SBT certificates with detailed internship metadata.",
              },
              {
                step: "04",
                title: "View & Browse",
                description:
                  "Browse all issued certificates through our viewing portal.",
              },
              {
                step: "05",
                title: "Verify Instantly",
                description:
                  "Certificates are permanently stored and instantly verifiable.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-black font-bold text-sm mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-400/10 to-blue-500/10 border-y border-gray-800 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Issue Your First Certificate?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join the blockchain revolution and start creating tamper-proof
            professional credentials. View existing certificates or mint your
            own.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/mint")}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-black px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Launch App
            </button>
            <button
              onClick={() => router.push("/view")}
              className="border border-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center"
            >
              <Eye className="mr-2 w-4 h-4" />
              View Certificates
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold">CertiSBT</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Docs
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>
              &copy; 2025 CertiSBT. Securing professional credentials on-chain.
            </p>
            <p className="mt-1 text-xs">*Subject to network conditions</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingComponent;
