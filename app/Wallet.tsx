import React, { useEffect, useState } from "react";
import TYPED_DATA_V4_PAYLOAD from "./typedDataV4Payload.json";
import type { ethers } from "ethers";
import { codeToHumanString, EXPECTED_CHAIN_ID } from "./utils";

type Props = {
  addresses: string[];
  ethersProvider: ethers.providers.Web3Provider;
  chainId: number;
};

const Wallet: React.FC<Props> = ({ ethersProvider, addresses, chainId }) => {
  const [walletAddress] = addresses;
  const [signature, setSignature] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);

  const requestPolygonChain = async (newChainId: number) => {
    if (chainId === EXPECTED_CHAIN_ID) return;

    setIsSwitchingChain(true);
    console.log(`switching chain id to: ${newChainId}`);
    await ethersProvider.send("wallet_switchEthereumChain", [
      { chainId: `0x${newChainId.toString(16)}` },
    ]);
    setIsSwitchingChain(false);
  };

  const handleSignTypedDataV4 = async () => {
    try {
      await requestPolygonChain(EXPECTED_CHAIN_ID);
      setIsLoading(true);
      const signer = ethersProvider.getSigner(walletAddress);
      setSignature(null);
      const newSignature = await signer._signTypedData(
        TYPED_DATA_V4_PAYLOAD.domain,
        TYPED_DATA_V4_PAYLOAD.types,
        TYPED_DATA_V4_PAYLOAD.message,
      );
      setSignature(newSignature);
    } catch (e) {
      console.error(e);
      type WalletError = Error & { code?: string };
      const walletError = e as WalletError;
      if (walletError.code) {
        alert(codeToHumanString(walletError.code));
      } else {
        alert(walletError.message);
      }
    } finally {
      setIsLoading(false);
      setIsSwitchingChain(false);
    }
  };

  useEffect(() => {
    setIsLoading(false);
    setIsSwitchingChain(false);
    setSignature(null);
  }, [addresses, ethersProvider]);

  return (
    <div>
      <div>Wallet address: {walletAddress}</div>

      <button
        onClick={handleSignTypedDataV4}
        disabled={isLoading || isSwitchingChain}
      >
        Sign Typed Data v4
      </button>

      {isSwitchingChain && (
        <div>
          Open your Coinbase Wallet to establish connection. Still waiting?{" "}
          <button onClick={handleSignTypedDataV4}>Try again</button>
        </div>
      )}

      {signature && <div>Signature: {signature}</div>}
    </div>
  );
};

export default Wallet;
