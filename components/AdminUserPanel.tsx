import { useSBT } from "@/context/SBTcontext";
import React, { useState } from "react";

interface SupervisorRequest {
  address: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  isPending: boolean;
}

const AdminUserPanel: React.FC = () => {
  const {
    isAdmin,
    pendingSupervisorRequests,
    allSupervisorRequests,
    isLoadingRequests,
    isApprovingRequest,
    error,
    approveSupervisorRequest,
    refreshSupervisorRequests,
    clearError,
  } = useSBT();

  const [selectedTab, setSelectedTab] = useState<"pending" | "all">("pending");
  const [approvingAddress, setApprovingAddress] = useState<string | null>(null);

  // If user is not admin, don't render the component
  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          You don't have admin privileges to view supervisor requests.
        </p>
      </div>
    );
  }

  const handleApproveRequest = async (address: string) => {
    setApprovingAddress(address);
    await approveSupervisorRequest(address);
    setApprovingAddress(null);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openTransaction = (txHash: string) => {
    // You can customize this based on your network
    const explorerUrl = `https://etherscan.io/tx/${txHash}`;
    window.open(explorerUrl, "_blank");
  };

  const RequestCard: React.FC<{ request: SupervisorRequest }> = ({
    request,
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">
            Address: {formatAddress(request.address)}
          </h3>
          <p className="text-sm text-gray-600">
            Requested: {formatTimestamp(request.timestamp)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {request.isPending ? (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Pending
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Approved
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-3">
        <p>Block: {request.blockNumber}</p>
        <button
          onClick={() => openTransaction(request.transactionHash)}
          className="text-blue-600 hover:text-blue-800 underline mt-1"
        >
          View Transaction
        </button>
      </div>

      {request.isPending && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleApproveRequest(request.address)}
            disabled={
              isApprovingRequest || approvingAddress === request.address
            }
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {approvingAddress === request.address ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Approving...
              </>
            ) : (
              "Approve"
            )}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(request.address);
            }}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
          >
            Copy Address
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Supervisor Role Requests
        </h1>
        <p className="text-gray-600">
          Manage supervisor role requests from users.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTab("pending")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === "pending"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending ({pendingSupervisorRequests.length})
          </button>
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Requests ({allSupervisorRequests.length})
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedTab === "pending" ? "Pending Requests" : "All Requests"}
        </h2>
        <button
          onClick={refreshSupervisorRequests}
          disabled={isLoadingRequests}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoadingRequests ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </>
          ) : (
            "Refresh"
          )}
        </button>
      </div>

      {isLoadingRequests ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading requests...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedTab === "pending" ? (
            pendingSupervisorRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pending requests
                </h3>
                <p className="text-gray-600">
                  All supervisor role requests have been processed.
                </p>
              </div>
            ) : (
              pendingSupervisorRequests.map((request, index) => (
                <RequestCard
                  key={`${request.address}-${index}`}
                  request={request}
                />
              ))
            )
          ) : allSupervisorRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No requests found
              </h3>
              <p className="text-gray-600">
                No supervisor role requests have been made yet.
              </p>
            </div>
          ) : (
            allSupervisorRequests.map((request, index) => (
              <RequestCard
                key={`${request.address}-${index}`}
                request={request}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserPanel;
