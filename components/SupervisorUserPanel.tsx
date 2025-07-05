"use client";

import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useSBT } from "@/context/SBTcontext";
import { isAddress } from "ethers";
import Link from "next/link";

interface InternshipData {
  certificateTitle: string;
  internName: string;
  internEmail: string;
  internWalletAddress: string;
  companyName: string;
  department: string;
  mentorName: string;
  duration: string;
  startDate: string;
  endDate: string;
  description: string;
  skills: string[];
  verificationUrl: string;
  issuedOn: string;
}

const initialData: InternshipData = {
  certificateTitle: "Internship Certificate",
  internName: "",
  internEmail: "",
  internWalletAddress: "",
  companyName: "",
  department: "",
  mentorName: "",
  duration: "",
  startDate: "",
  endDate: "",
  description: "",
  skills: [],
  verificationUrl: "",
  issuedOn: new Date().toISOString(),
};

const SupervisorMintSBTForm = () => {
  const { account } = useWallet();
  const {
    isSupervisor,
    supervisorStatus,
    requestSupervisorRole,
    mintExperience,
    isRequestingRole,
    isMinting,
    error,
    clearError,
  } = useSBT();

  const [internshipData, setInternshipData] =
    useState<InternshipData>(initialData);
  const [skillInput, setSkillInput] = useState<string>("");
  const [showMintForm, setShowMintForm] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInternshipData((prev) => ({ ...prev, [name]: value }));
  };

  const getFieldValue = (key: keyof InternshipData): string => {
    const value = internshipData[key];
    return typeof value === "string" ? value : "";
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !internshipData.skills.includes(skill)) {
      setInternshipData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setInternshipData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleMintSBT = async () => {
    const { internWalletAddress, companyName, description, internName } =
      internshipData;
    if (!internWalletAddress || !companyName || !description || !internName) {
      alert("Please fill all required fields");
      return;
    }

    if (!isAddress(internWalletAddress)) {
      alert("Invalid wallet address");
      return;
    }

    const metadata = {
      ...internshipData,
      supervisor: account,
      issuedOn: new Date().toISOString(),
    };

    const uploadRes = await fetch("/api/upload-to-ipfs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.ipfsURI) {
      alert("Failed to upload metadata to IPFS");
      return;
    }

    await mintExperience(internWalletAddress, uploadData.ipfsURI);
    setInternshipData(initialData);
    setShowMintForm(false);
    alert("SBT minted successfully!");
  };

  const canMint = isSupervisor && supervisorStatus === "approved";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold text-gray-700">Account</h3>
          <p className="text-sm text-gray-600 break-all">{account}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold text-gray-700">Status</h3>
          <p className="text-sm text-gray-600 capitalize">
            {supervisorStatus} for SUPERVISOR ROLE
          </p>
        </div>
      </div>

      {!canMint && (
        <div className="mb-6 flex gap-x-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
            onClick={requestSupervisorRole}
            disabled={isRequestingRole || supervisorStatus === "pending"}
          >
            {isRequestingRole
              ? "Requesting..."
              : supervisorStatus === "pending"
              ? "Request Pending"
              : "Request Supervisor Role"}
          </button>

          {supervisorStatus === "pending" && (
            <p className="text-amber-600 text-sm mt-2">
              ⏳ Your supervisor role request is pending approval from an
              administrator.
            </p>
          )}

          <Link
            href="/view"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm"
          >
            View Internship SBTs
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex justify-between items-center">
            <span className="text-red-800">{error}</span>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {canMint && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mint Internship SBT</h2>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
              onClick={() => setShowMintForm(!showMintForm)}
            >
              {showMintForm ? "Cancel" : "Mint New SBT"}
            </button>
          </div>

          {showMintForm && (
            <div className="space-y-4">
              {[
                ["internName", "Full Name *"],
                ["internEmail", "Email"],
                ["internWalletAddress", "Wallet Address *"],
                ["companyName", "Company Name *"],
                ["department", "Department"],
                ["mentorName", "Mentor"],
                ["certificateTitle", "Certificate Title"],
                ["duration", "Duration"],
                ["startDate", "Start Date"],
                ["endDate", "End Date"],
                ["verificationUrl", "Verification URL"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <input
                    type={(field as string).includes("Date") ? "date" : "text"}
                    name={field}
                    value={getFieldValue(field as keyof InternshipData)}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={internshipData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Add Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    className="flex-1 p-2 border rounded"
                    placeholder="e.g., React, Solidity"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>

              {internshipData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {internshipData.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                    >
                      {skill}
                      <button
                        className="ml-2 text-blue-600"
                        onClick={() => removeSkill(skill)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="text-right">
                <button
                  onClick={handleMintSBT}
                  disabled={isMinting}
                  className="bg-green-600 text-white px-6 py-2 rounded"
                >
                  {isMinting ? "Minting..." : "Mint SBT"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupervisorMintSBTForm;
