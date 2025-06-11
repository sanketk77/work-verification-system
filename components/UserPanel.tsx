import { useSBT } from "@/context/SBTcontext";
import { useWallet } from "@/context/WalletContext";
import { isAddress } from "ethers";
import React, { useState } from "react";

interface InternshipData {
  name: string;
  description: string;
  company: string;
  intern: string;
  duration: string;
  skills: string[];
  verificationUrl: string;
  issuedOn: string;
}

const UserPanel = () => {
  const { account } = useWallet();
  const {
    isAdmin,
    isSupervisor,
    requestSupervisorRole,
    isRequestingRole,
    supervisorStatus,
    mintExperience,
    isMinting,
    error,
    clearError,
  } = useSBT();

  // State for minting form
  const [showMintForm, setShowMintForm] = useState(false);
  const [internshipData, setInternshipData] = useState<InternshipData>({
    name: "Internship Certificate",
    description: "",
    company: "",
    intern: "",
    duration: "",
    skills: [],
    verificationUrl: "",
    issuedOn: new Date().toISOString(),
  });
  const [skillInput, setSkillInput] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInternshipData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSkill = () => {
    if (
      skillInput.trim() &&
      !internshipData.skills.includes(skillInput.trim())
    ) {
      setInternshipData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
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
    if (
      !internshipData.intern ||
      !internshipData.company ||
      !internshipData.description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Step 1: Validate address
      if (!isAddress(internshipData.intern)) {
        alert("Invalid intern wallet address");
        return;
      }

      // Step 2: Create metadata object
      const metadata = {
        ...internshipData,
        supervisor: account,
        issuedOn: new Date().toISOString(),
      };

      // Step 3: Upload metadata to IPFS via your API
      const uploadRes = await fetch("/api/upload-to-ipfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.ipfsURI) {
        console.error("IPFS upload failed:", uploadData);
        alert("Failed to upload metadata to IPFS.");
        return;
      }

      // Step 4: Use IPFS URI for minting
      await mintExperience(internshipData.intern, uploadData.ipfsURI);

      // Step 5: Reset state after success
      setInternshipData({
        name: "Internship Certificate",
        description: "",
        company: "",
        intern: "",
        duration: "",
        skills: [],
        verificationUrl: "",
        issuedOn: new Date().toISOString(),
      });

      setShowMintForm(false);
      alert("SBT minted successfully!");
    } catch (error) {
      console.error("Failed to mint SBT:", error);
      alert("Minting failed. Check console for details.");
    }
  };

  const canMint = supervisorStatus === "approved" && isSupervisor;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-6">
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

        {/* Supervisor Role Request - Only show if not supervisor */}
        {!canMint && (
          <div className="mb-6">
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
          </div>
        )}

        {/* Error Display */}
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

        {/* SBT Minting Section */}
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
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">
                  Internship Certificate Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={internshipData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Internship Certificate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={internshipData.company}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="XYZ Company Pvt. Ltd."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intern Wallet Address *
                    </label>
                    <input
                      type="text"
                      name="intern"
                      value={internshipData.intern}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={internshipData.duration}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="May 2024 – July 2024"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={internshipData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Certified internship completion at XYZ Company..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification URL
                    </label>
                    <input
                      type="url"
                      name="verificationUrl"
                      value={internshipData.verificationUrl}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://your-verifier.app/verify/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add Skills
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="React, Node.js, Blockchain..."
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Skills Display */}
                {internshipData.skills.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills Added:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {internshipData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-blue-600 hover:text-blue-800 ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mint Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleMintSBT}
                    disabled={
                      isMinting ||
                      !internshipData.intern ||
                      !internshipData.company ||
                      !internshipData.description
                    }
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded transition-colors"
                  >
                    {isMinting ? "Minting..." : "Mint SBT"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPanel;
