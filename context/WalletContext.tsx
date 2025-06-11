"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BrowserProvider, Signer, Network } from "ethers";

interface WalletContextProps {
  account: string;
  provider: BrowserProvider | null;
  signer: Signer | null;
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
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const connectWallet = async (): Promise<void> => {
    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }

    setIsConnecting(true);

    try {
      const _provider = new BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();
      const _network: Network = await _provider.getNetwork();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setChainId(Number(_network.chainId));

      setIsConnected(true);

      if (Number(_network.chainId) !== 11155111) {
        setError("Please connect to the Sepolia testnet");
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
        } catch {
          setError("Failed to switch to Sepolia testnet");
        }
      }
    } catch (err) {
      console.error("Connect error:", err);
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
    const checkConnection = async (): Promise<void> => {
      if (!window.ethereum) return;

      try {
        const _provider = new BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          const _signer = await _provider.getSigner();
          const _account = await _signer.getAddress();
          const _network = await _provider.getNetwork();

          setProvider(_provider);
          setSigner(_signer);
          setAccount(_account);
          setChainId(Number(_network.chainId));
          setIsConnected(true);

          if (Number(_network.chainId) !== 11155111) {
            setError("Please connect to the Sepolia testnet");
          }
        }
      } catch (err) {
        console.error("Check connection error:", err);
      }
    };

    checkConnection();

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
