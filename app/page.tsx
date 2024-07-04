"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import CoinbaseWalletSdk, {
  type ProviderInterface,
} from "@coinbase/wallet-sdk";
import { ethers } from "ethers";
import Wallet from "./Wallet";

const getCoinbaseWalletProvider = () => {
  const sdk = new CoinbaseWalletSdk({
    appName: "Unstoppable Domains",
    appChainIds: [1, 137],
  });
  const provider = sdk.makeWeb3Provider();
  return provider;
};

export default function Home() {
  const [provider, setProvider] = useState<ProviderInterface>();
  const [ethersProvider, setEthersProvider] =
    useState<ethers.providers.Web3Provider>();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  const handleAccessWallet = async () => {
    if (!provider) return;
    try {
      const newAddresses = await provider.request<string[]>({
        method: "eth_requestAccounts",
      });
      setAddresses(newAddresses);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDisconnectWallet = async () => {
    if (!provider) return;
    try {
      await provider.disconnect();
      window.location.reload();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  useEffect(() => {
    setProvider(getCoinbaseWalletProvider());
  }, []);

  useEffect(() => {
    if (!provider) return;

    const newEthersProvider = new ethers.providers.Web3Provider(
      provider as Pick<typeof provider, "request">,
      "any",
    );
    setEthersProvider(newEthersProvider);
  }, [provider]);

  useEffect(() => {
    if (!ethersProvider) return;
    const walletProvider = ethersProvider.provider as ProviderInterface;

    walletProvider.on("connect", (info) => {
      setConnected(true);
      if (info.chainId) {
        setChainId(Number(info.chainId));
      }
    });

    walletProvider.on("disconnect", (e) => {
      setConnected(false);
    });

    walletProvider.on("chainChanged", (newChainId) => {
      console.log("new chain id:", newChainId);
      setChainId(Number(newChainId));
    });

    return () => {
      walletProvider.removeAllListeners();
    };
  }, [ethersProvider]);

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Coinbase Wallet SDK + typed data v4 sig</p>
        <p>Connection status: {connected ? "connected" : "disconnected"}</p>
        {connected && chainId && <p>Chain ID: {chainId}</p>}

        {addresses.length === 0 ? (
          <button onClick={handleAccessWallet}>Access Coinbase Wallet</button>
        ) : (
          <button onClick={handleDisconnectWallet}>Disconnect</button>
        )}
      </div>

      <div className={styles.center}>
        <div className={styles.description}>
          {ethersProvider && addresses.length > 0 && chainId && (
            <Wallet
              ethersProvider={ethersProvider}
              addresses={addresses}
              chainId={chainId}
            />
          )}
        </div>
      </div>
    </main>
  );
}
