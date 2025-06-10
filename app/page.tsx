"use client";
import React from "react";
import Head from "next/head";
import WalletConnect from "../components/WalletConnect";
import { useWallet } from "../context/WalletContext";
import Link from "next/link";
import UserPanel from "@/components/UserPanel";
import AdminUserPanel from "@/components/AdminUserPanel";
import { useSBT } from "@/context/SBTcontext";

export default function Home() {
  const { isConnected } = useWallet();
  const { isAdmin } = useSBT();

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Work Verification System</title>
        <meta
          name="description"
          content="A decentralized todo application built with Ethereum"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Work Verification System</h1>
          <p className="text-gray-600">
            Verify the work with Ethereum blockchain
          </p>
        </header>

        <WalletConnect />

        {isConnected ? (
          isAdmin ? (
            <AdminUserPanel />
          ) : (
            <UserPanel />
          )
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-lg text-gray-700 mb-4">
              Connect your wallet to access your decentralized todo list
            </p>
            <p className="text-sm text-gray-500">
              Make sure you are connected to the Sepolia testnet and have some
              sepoliaEth in your wallet.
            </p>
            <p className="text-sm text-gray-500">
              To air drop some sepoliaEth{" "}
              <Link
                href={`https://cloud.google.com/application/web3/faucet/ethereum/sepolia`}
                className="text-blue-500 hover:underline"
              >
                click here
              </Link>
            </p>
          </div>
        )}
      </div>

      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>Blockchain-Powered Work Verification; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
