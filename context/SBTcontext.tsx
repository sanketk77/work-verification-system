"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useWallet } from "./WalletContext"; // Adjust import path as needed
import { CONTRACT_ABI_V2 } from "../Contract/v2/ABI";
import { isAddress } from "ethers";
import type { EventLog } from "ethers";
import { CONTRACT_ADDRESS } from "@/utils/constants";

// Contract ABI - Complete ABI from your contract
const CONTRACT_ABI = CONTRACT_ABI_V2;
// Replace with your deployed contract address

export enum SupervisorStatus {
  NONE = "none",
  PENDING = "pending",
  APPROVED = "approved",
  REVOKED = "revoked",
}

interface ExperienceToken {
  tokenId: number;
  uri: string;
  metadata?: any;
}

interface SupervisorRequest {
  address: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  isPending: boolean;
}

interface SBTContextProps {
  // Contract instance
  contract: ethers.Contract | null;

  // User role status
  isAdmin: boolean;
  isSupervisor: boolean;
  supervisorStatus: SupervisorStatus;

  // Loading states
  isLoading: boolean;
  isMinting: boolean;
  isRequestingRole: boolean;
  isApprovingRequest: boolean;
  isLoadingRequests: boolean;

  // User's tokens
  userTokens: ExperienceToken[];

  // Admin functionality
  pendingSupervisorRequests: SupervisorRequest[];
  allSupervisorRequests: SupervisorRequest[];

  // Error handling
  error: string;

  // Functions
  requestSupervisorRole: () => Promise<void>;
  mintExperience: (internAddress: string, uri: string) => Promise<void>;
  getUserTokens: (address?: string) => Promise<ExperienceToken[]>;
  refreshUserStatus: () => Promise<void>;
  approveSupervisorRequest: (address: string) => Promise<void>;
  loadSupervisorRequests: () => Promise<void>;
  refreshSupervisorRequests: () => Promise<void>;
  clearError: () => void;
}

const SBTContext = createContext<SBTContextProps>({
  contract: null,
  isAdmin: false,
  isSupervisor: false,
  supervisorStatus: SupervisorStatus.NONE,
  isLoading: false,
  isMinting: false,
  isRequestingRole: false,
  isApprovingRequest: false,
  isLoadingRequests: false,
  userTokens: [],
  pendingSupervisorRequests: [],
  allSupervisorRequests: [],
  error: "",
  requestSupervisorRole: async () => {},
  mintExperience: async () => {},
  getUserTokens: async () => [],
  refreshUserStatus: async () => {},
  approveSupervisorRequest: async () => {},
  loadSupervisorRequests: async () => {},
  refreshSupervisorRequests: async () => {},
  clearError: () => {},
});

interface SBTProviderProps {
  children: ReactNode;
}

export function SBTProvider({ children }: SBTProviderProps) {
  const { provider, signer, account, isConnected } = useWallet();

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSupervisor, setIsSupervisor] = useState<boolean>(false);
  const [supervisorStatus, setSupervisorStatus] = useState<SupervisorStatus>(
    SupervisorStatus.NONE
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isRequestingRole, setIsRequestingRole] = useState<boolean>(false);
  const [isApprovingRequest, setIsApprovingRequest] = useState<boolean>(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);
  const [userTokens, setUserTokens] = useState<ExperienceToken[]>([]);
  const [pendingSupervisorRequests, setPendingSupervisorRequests] = useState<
    SupervisorRequest[]
  >([]);
  const [allSupervisorRequests, setAllSupervisorRequests] = useState<
    SupervisorRequest[]
  >([]);
  const [error, setError] = useState<string>("");

  // Initialize contract when wallet is connected
  useEffect(() => {
    if (provider && signer && isConnected) {
      try {
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
        setContract(contractInstance);
      } catch (err) {
        console.error("Error initializing contract:", err);
        setError("Failed to initialize contract");
      }
    } else {
      setContract(null);
      resetState();
    }
  }, [provider, signer, isConnected]);

  // Check user roles and status when contract or account changes
  useEffect(() => {
    if (contract && account) {
      refreshUserStatus();
      getUserTokens();
      setupEventListeners();
    }
  }, [contract, account]);

  // Load supervisor requests when user becomes admin
  useEffect(() => {
    if (contract && isAdmin) {
      loadSupervisorRequests();
    }
  }, [contract, isAdmin]);

  const resetState = () => {
    setIsAdmin(false);
    setIsSupervisor(false);
    setSupervisorStatus(SupervisorStatus.NONE);
    setUserTokens([]);
    setPendingSupervisorRequests([]);
    setAllSupervisorRequests([]);
    setError("");
  };

  const refreshUserStatus = async (): Promise<void> => {
    if (!contract || !account) return;

    setIsLoading(true);
    try {
      // Get role constants
      const supervisorRole = await contract.SUPERVISOR_ROLE();
      const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();

      // Check if user has admin role
      const hasAdminRole = await contract.hasRole(defaultAdminRole, account);
      setIsAdmin(hasAdminRole);

      // Check if user has supervisor role
      const hasSupervisorRole = await contract.hasRole(supervisorRole, account);
      setIsSupervisor(hasSupervisorRole);

      // Determine supervisor status
      if (hasSupervisorRole) {
        setSupervisorStatus(SupervisorStatus.APPROVED);
      } else {
        // Check if user has pending request
        const hasPendingRequest = await contract.supervisorRequests(account);
        if (hasPendingRequest) {
          setSupervisorStatus(SupervisorStatus.PENDING);
        } else {
          setSupervisorStatus(SupervisorStatus.NONE);
        }
      }
    } catch (err) {
      console.error("Error refreshing user status:", err);
      setError("Failed to refresh user status");
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    if (!contract || !account) return;

    // Listen for supervisor role granted events
    const supervisorGrantedFilter = contract.filters.SupervisorGranted(account);
    contract.on(supervisorGrantedFilter, () => {
      setIsSupervisor(true);
      setSupervisorStatus(SupervisorStatus.APPROVED);
    });

    // Listen for supervisor role revoked events
    const supervisorRevokedFilter = contract.filters.SupervisorRevoked(account);
    contract.on(supervisorRevokedFilter, () => {
      setIsSupervisor(false);
      setSupervisorStatus(SupervisorStatus.REVOKED);
    });

    // Listen for experience minted events for the user
    const experienceMintedFilter = contract.filters.ExperienceMinted(account);
    contract.on(experienceMintedFilter, () => {
      // Refresh user tokens when new token is minted to them
      getUserTokens();
    });

    // Listen for new supervisor role requests (for admins)
    if (isAdmin) {
      const supervisorRequestFilter =
        contract.filters.SupervisorRoleRequested();
      contract.on(supervisorRequestFilter, (requester, event) => {
        // Add new request to the list
        const newRequest: SupervisorRequest = {
          address: requester,
          timestamp: Date.now(),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          isPending: true,
        };

        setAllSupervisorRequests((prev) => [...prev, newRequest]);
        setPendingSupervisorRequests((prev) => [...prev, newRequest]);
      });

      // Listen for supervisor granted events to update request status
      const allSupervisorGrantedFilter = contract.filters.SupervisorGranted();
      contract.on(allSupervisorGrantedFilter, (grantedAddress) => {
        // Remove from pending requests
        setPendingSupervisorRequests((prev) =>
          prev.filter(
            (req) => req.address.toLowerCase() !== grantedAddress.toLowerCase()
          )
        );

        // Update status in all requests
        setAllSupervisorRequests((prev) =>
          prev.map((req) =>
            req.address.toLowerCase() === grantedAddress.toLowerCase()
              ? { ...req, isPending: false }
              : req
          )
        );
      });
    }

    // Cleanup listeners on unmount
    return () => {
      contract.removeAllListeners();
    };
  };

  const loadSupervisorRequests = async (): Promise<void> => {
    if (!contract || !isAdmin) return;

    setIsLoadingRequests(true);
    try {
      // Get SupervisorRoleRequested events
      const requestFilter = contract.filters.SupervisorRoleRequested();
      const requestEvents = await contract.queryFilter(requestFilter);

      // Get SupervisorGranted events
      const grantedFilter = contract.filters.SupervisorGranted();
      const grantedEvents = await contract.queryFilter(grantedFilter);

      // Track addresses that have been granted supervisor role
      const grantedAddresses = new Set(
        grantedEvents
          .filter((event): event is EventLog => "args" in event && !!event.args)
          .map((event) => event.args[0].toLowerCase())
      );

      const requests: SupervisorRequest[] = [];
      const pendingRequests: SupervisorRequest[] = [];

      for (const event of requestEvents) {
        if (!("args" in event) || !event.args) continue;

        const requesterAddress = event.args[0];
        const block = await event.getBlock();

        // Check contract mapping for pending status
        const isPending = await contract.supervisorRequests(requesterAddress);

        const request: SupervisorRequest = {
          address: requesterAddress,
          timestamp: block.timestamp * 1000, // convert to ms
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          isPending,
        };

        requests.push(request);
        if (isPending) pendingRequests.push(request);
      }

      // Sort descending by timestamp
      requests.sort((a, b) => b.timestamp - a.timestamp);
      pendingRequests.sort((a, b) => b.timestamp - a.timestamp);

      setAllSupervisorRequests(requests);
      setPendingSupervisorRequests(pendingRequests);
    } catch (err) {
      console.error("Error loading supervisor requests:", err);
      setError("Failed to load supervisor requests");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const refreshSupervisorRequests = async (): Promise<void> => {
    await loadSupervisorRequests();
  };

  const requestSupervisorRole = async (): Promise<void> => {
    if (!contract || !account) {
      setError("Wallet not connected or contract not initialized");
      return;
    }

    if (supervisorStatus === SupervisorStatus.PENDING) {
      setError("You already have a pending supervisor role request");
      return;
    }

    if (isSupervisor) {
      setError("You already have supervisor role");
      return;
    }

    setIsRequestingRole(true);
    setError("");

    try {
      const tx = await contract.requestSupervisorRole();
      await tx.wait();

      setSupervisorStatus(SupervisorStatus.PENDING);
    } catch (err: any) {
      console.error("Error requesting supervisor role:", err);
      if (err.message.includes("Already requested")) {
        setError("You have already requested supervisor role");
        setSupervisorStatus(SupervisorStatus.PENDING);
      } else {
        setError("Failed to request supervisor role");
      }
    } finally {
      setIsRequestingRole(false);
    }
  };

  const mintExperience = async (
    internAddress: string,
    uri: string
  ): Promise<void> => {
    if (!contract || !account) {
      setError("Wallet not connected or contract not initialized");
      return;
    }

    if (!isSupervisor) {
      setError("You don't have supervisor role to mint experiences");
      return;
    }

    if (!isAddress(internAddress)) {
      setError("Invalid intern address");
      return;
    }

    if (!uri.trim()) {
      setError("URI cannot be empty");
      return;
    }

    setIsMinting(true);
    setError("");

    try {
      const tx = await contract.mintExperience(internAddress, uri);
      await tx.wait();

      // Refresh tokens if minting to current user
      if (internAddress.toLowerCase() === account.toLowerCase()) {
        await getUserTokens();
      }
    } catch (err: any) {
      console.error("Error minting experience:", err);
      setError("Failed to mint experience token");
    } finally {
      setIsMinting(false);
    }
  };

  const getUserTokens = async (
    address?: string
  ): Promise<ExperienceToken[]> => {
    if (!contract) return [];

    const targetAddress = address || account;
    if (!targetAddress) return [];

    try {
      const tokenIds = await contract.tokensOfOwner(targetAddress);
      const tokens: ExperienceToken[] = [];

      for (const tokenId of tokenIds) {
        try {
          const uri = await contract.tokenURI(tokenId.toNumber());
          const token: ExperienceToken = {
            tokenId: tokenId.toNumber(),
            uri: uri,
          };

          // Try to fetch metadata if URI is a valid URL
          if (uri.startsWith("http") || uri.startsWith("ipfs://")) {
            try {
              let fetchUrl = uri;
              if (uri.startsWith("ipfs://")) {
                fetchUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
              }

              const response = await fetch(fetchUrl);
              if (response.ok) {
                token.metadata = await response.json();
              }
            } catch (metadataError) {
              console.warn(
                `Failed to fetch metadata for token ${tokenId}:`,
                metadataError
              );
            }
          }

          tokens.push(token);
        } catch (tokenError) {
          console.error(`Error fetching token ${tokenId}:`, tokenError);
        }
      }

      if (!address || address.toLowerCase() === account?.toLowerCase()) {
        setUserTokens(tokens);
      }

      return tokens;
    } catch (err) {
      console.error("Error fetching user tokens:", err);
      setError("Failed to fetch user tokens");
      return [];
    }
  };

  const approveSupervisorRequest = async (
    requestAddress: string
  ): Promise<void> => {
    if (!contract || !account) {
      setError("Wallet not connected or contract not initialized");
      return;
    }

    if (!isAdmin) {
      setError(
        "You don't have admin privileges to approve supervisor requests"
      );
      return;
    }

    if (!isAddress(requestAddress)) {
      setError("Invalid address");
      return;
    }

    setIsApprovingRequest(true);
    setError("");

    try {
      const tx = await contract.approveSupervisorRequest(requestAddress);
      await tx.wait();

      // Remove from pending requests
      setPendingSupervisorRequests((prev) =>
        prev.filter(
          (req) => req.address.toLowerCase() !== requestAddress.toLowerCase()
        )
      );

      // Update status in all requests
      setAllSupervisorRequests((prev) =>
        prev.map((req) =>
          req.address.toLowerCase() === requestAddress.toLowerCase()
            ? { ...req, isPending: false }
            : req
        )
      );
    } catch (err: any) {
      console.error("Error approving supervisor request:", err);
      if (err.message.includes("No request found")) {
        setError("No supervisor request found for this address");
      } else {
        setError("Failed to approve supervisor request");
      }
    } finally {
      setIsApprovingRequest(false);
    }
  };

  const clearError = () => setError("");

  const contextValue: SBTContextProps = {
    contract,
    isAdmin,
    isSupervisor,
    supervisorStatus,
    isLoading,
    isMinting,
    isRequestingRole,
    isApprovingRequest,
    isLoadingRequests,
    userTokens,
    pendingSupervisorRequests,
    allSupervisorRequests,
    error,
    requestSupervisorRole,
    mintExperience,
    getUserTokens,
    refreshUserStatus,
    approveSupervisorRequest,
    loadSupervisorRequests,
    refreshSupervisorRequests,
    clearError,
  };

  return (
    <SBTContext.Provider value={contextValue}>{children}</SBTContext.Provider>
  );
}

export function useSBT() {
  const context = useContext(SBTContext);
  if (!context) {
    throw new Error("useSBT must be used within an SBTProvider");
  }
  return context;
}
