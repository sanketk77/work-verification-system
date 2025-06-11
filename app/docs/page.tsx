"use client";
import React from "react";
import { Award } from "lucide-react";
import Link from "next/link";

const DocsPage = () => {
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
              <span className="text-xl font-bold">CertiSBT Docs</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#overview"
                className="text-gray-400 hover:text-white text-sm"
              >
                Overview
              </a>
              <a
                href="#tech-stack"
                className="text-gray-400 hover:text-white text-sm"
              >
                Tech Stack
              </a>
              <a
                href="#getting-started"
                className="text-gray-400 hover:text-white text-sm"
              >
                Getting Started
              </a>
              <a
                href="#usage"
                className="text-gray-400 hover:text-white text-sm"
              >
                Usage
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {/* Overview */}
        <section id="overview">
          <h1 className="text-4xl font-bold mb-4">CertiSBT Documentation</h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            CertiSBT is a decentralized certificate issuance and verification
            platform that leverages Ethereum-based Soulbound Tokens (SBTs) to
            create non-transferable, tamper-proof records of professional
            experience. Supervisors with approved privileges can mint internship
            certificates on the Sepolia testnet, and anyone can verify them
            instantly.
          </p>
        </section>

        {/* Tech Stack */}
        <section id="tech-stack">
          <h2 className="text-3xl font-semibold mb-4">Tech Stack</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>
              <strong>Frontend:</strong> Next.js, React, TypeScript, Tailwind
              CSS, lucide-react icons
            </li>
            <li>
              <strong>Blockchain:</strong> Solidity (OpenZeppelin ERC-721 +
              AccessControl), deployed on Sepolia
            </li>
            <li>
              <strong>Wallet Integration:</strong> MetaMask via ethers.js
            </li>
            <li>
              <strong>Backend (optional):</strong> Node.js/Express or REST API
              for metadata storage (IPFS integration)
            </li>
            <li>
              <strong>Storage:</strong> IPFS (e.g., via Pinata) for storing
              certificate metadata JSON
            </li>
          </ul>
        </section>

        {/* Getting Started */}
        <section id="getting-started">
          <h2 className="text-3xl font-semibold mb-4">Getting Started</h2>

          <h3 className="text-xl font-semibold mt-6 mb-2">Prerequisites</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Node.js & npm (or Yarn)</li>
            <li>MetaMask browser extension</li>
            <li>
              Sepolia testnet Ether (get some at{" "}
              <a
                href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline"
              >
                Sepolia Faucet
              </a>
              )
            </li>
          </ul>
        </section>

        {/* Usage */}
        <section id="usage">
          <h2 className="text-3xl font-semibold mb-4">Usage</h2>

          <h3 className="text-xl font-semibold mt-6 mb-2">Key Features</h3>
          <ul className="list-disc list-inside space-y-2 text-[#AAAAAA]">
            <li>
              <strong>Request Role:</strong> Apply for supervisor privileges
              in-app.
            </li>
            <li>
              <strong>Mint Certificate:</strong> Supervisors can mint SBTs with
              metadata URI.
            </li>
            <li>
              <strong>View Certificates:</strong> Browse all tokens for
              connected address.
            </li>
            <li>
              <strong>Verify:</strong> Any wallet can verify token ownership and
              metadata on-chain.
            </li>
          </ul>
        </section>

        {/* Footer CTA */}
        <section className="bg-gradient-to-r from-green-400/10 to-blue-500/10 border-t border-gray-800 py-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Try CertiSBT?</h3>
          <div className="flex justify-center gap-4">
            <Link
              href="/mint"
              className="bg-gradient-to-r from-green-400 to-blue-500 text-black px-6 py-3 rounded-lg font-medium hover:opacity-90"
            >
              Launch App
            </Link>
            <Link
              href="/view"
              className="border border-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900"
            >
              View Certificates
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DocsPage;
