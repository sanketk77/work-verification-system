import React from "react";
import { useWallet } from "../context/WalletContext";

export default function WalletConnect() {
  const {
    account,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    chainId,
  } = useWallet();

  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Check if we're on Sepolia
  const isCorrectNetwork = chainId === 11155111;

  return (
    <div className="mb-6">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center mb-3 sm:mb-0">
            <div
              className={`h-3 w-3 rounded-full mr-2 ${
                isCorrectNetwork ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="font-medium mr-2">{formatAddress(account)}</span>
            <span className="text-sm text-gray-600">
              {isCorrectNetwork ? "Sepolia" : "Wrong Network"}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded hover:bg-gray-100 transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>
      )}

      {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
    </div>
  );
}
