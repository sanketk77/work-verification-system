"use client";

import { useState } from "react";
import { isAddress, JsonRpcProvider, Contract } from "ethers";
import axios from "axios";
import { CONTRACT_ADDRESS } from "@/utils/constants";
import { CONTRACT_ABI_V2 } from "@/Contract/v2/ABI";

interface Certificate {
  tokenId: string;
  name: string;
  company: string;
  duration?: string;
  description?: string;
  skills?: string[];
  issuedOn?: string;
  verificationUrl?: string;
  supervisor?: string;
  intern?: string;
  internName?: string;
  internEmail?: string;
  department?: string;
  mentorName?: string;
  startDate?: string;
  endDate?: string;
}

const VerifyPage = () => {
  const [address, setAddress] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => setError("");

  const handleVerify = async () => {
    setLoading(true);
    setCertificates([]);
    setError("");

    if (!isAddress(address)) {
      setError(
        "Invalid wallet address format. Please enter a valid Ethereum address."
      );
      setLoading(false);
      return;
    }

    try {
      const provider = new JsonRpcProvider(
        process.env.NEXT_PUBLIC_SEPOLIA_RPC!
      );
      const contract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI_V2,
        provider
      );

      const tokenIds: bigint[] = await contract.tokensOfOwner(address);

      if (tokenIds.length === 0) {
        setError("No SBT certificates found for this wallet address.");
        setLoading(false);
        return;
      }

      const certs = await Promise.all(
        tokenIds.map(async (id) => {
          const uri = await contract.tokenURI(id);
          const resolved = uri.replace(
            "ipfs://",
            `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/`
          );
          const metadata = (await axios.get(resolved)).data;
          return { tokenId: id.toString(), ...metadata };
        })
      );

      setCertificates(certs);
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        "Verification failed. Please check the wallet address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (error) clearError();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleVerify();
    }
  };

  const getEtherscanTokenUrl = (tokenId: string) => {
    return `https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">SBT Scan</h1>
        <p className="text-gray-600 mb-6">
          Enter a wallet address to view all internship certificates (SBTs)
          associated with it.
        </p>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address *
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter wallet address (0x...)"
              value={address}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="flex-1 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !address.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded transition-colors"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-red-800">{error}</span>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 text-xl leading-none"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Certificate Results ({certificates.length})
              </h2>
              <div className="text-sm text-gray-600">
                Found {certificates.length} certificate
                {certificates.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="space-y-6">
              {certificates.map((cert, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cert.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Token ID: #{cert.tokenId}
                      </p>
                    </div>
                    {cert.issuedOn && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          Issued On
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(cert.issuedOn).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {cert.company && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Company
                        </h4>
                        <p className="text-gray-600">{cert.company}</p>
                      </div>
                    )}
                    {cert.duration && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Duration
                        </h4>
                        <p className="text-gray-600">{cert.duration}</p>
                      </div>
                    )}
                    {cert.internName && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Intern Name
                        </h4>
                        <p className="text-gray-600">{cert.internName}</p>
                      </div>
                    )}
                    {cert.internEmail && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Intern Email
                        </h4>
                        <p className="text-gray-600">{cert.internEmail}</p>
                      </div>
                    )}
                    {cert.department && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Department
                        </h4>
                        <p className="text-gray-600">{cert.department}</p>
                      </div>
                    )}
                    {cert.mentorName && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">
                          Mentor
                        </h4>
                        <p className="text-gray-600">{cert.mentorName}</p>
                      </div>
                    )}
                    {cert.supervisor && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-700 mb-1">
                          Supervisor
                        </h4>
                        <p className="text-gray-600 text-sm break-all">
                          {cert.supervisor}
                        </p>
                      </div>
                    )}
                  </div>

                  {cert.description && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Description
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {cert.description}
                      </p>
                    </div>
                  )}

                  {cert.skills && cert.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Skills Acquired
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cert.skills.map((skill, skillIdx) => (
                          <span
                            key={skillIdx}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-3">
                      {cert.verificationUrl && (
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                        >
                          <span>🔗</span>
                          View Verification Details
                        </a>
                      )}
                      <a
                        href={getEtherscanTokenUrl(cert.tokenId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                      >
                        <span>🔍</span>
                        View on Etherscan
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && certificates.length === 0 && address && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-4xl mb-4">📜</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Certificates Found
            </h3>
            <p className="text-gray-600">
              No SBT certificates were found for the provided wallet address.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;
