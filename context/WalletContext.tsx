"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";

interface WalletContextProps {
  account: string;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  error: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextProps>({
  account: "",
  provider: null,
  signer: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,
  error: "",
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

interface WalletProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [account, setAccount] = useState<string>("");
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const connectWallet = async (): Promise<void> => {
    if (!window.ethereum) {
      setError(
        "MetaMask is not installed. Please install MetaMask to use this application."
      );
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setChainId(network.chainId);
      setIsConnected(true);

      // Check if we're on Sepolia (chainId 11155111)
      if (network.chainId !== 11155111) {
        setError("Please connect to the Sepolia testnet");
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // 0xaa36a7 is 11155111 in hex
          });
        } catch (switchError) {
          setError("Failed to switch to Sepolia testnet");
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = (): void => {
    setAccount("");
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
  };

  useEffect(() => {
    // Check if MetaMask is already connected
    const checkConnection = async (): Promise<void> => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            const account = await signer.getAddress();
            const network = await provider.getNetwork();

            setProvider(provider);
            setSigner(signer);
            setAccount(account);
            setChainId(network.chainId);
            setIsConnected(true);

            if (network.chainId !== 11155111) {
              setError("Please connect to the Sepolia testnet");
            }
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Set up event listeners for account and chain changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          checkConnection();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        isConnected,
        isConnecting,
        chainId,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
