import React, { useState } from "react";
import TYPED_DATA_V4_PAYLOAD from "./typedDataV4Payload.json";
import type { ethers } from "ethers";

type Props = {
  addresses: string[];
  ethersProvider: ethers.providers.Web3Provider;
  chainId: number;
};

const Wallet: React.FC<Props> = ({ ethersProvider, addresses, chainId }) => {
  const [walletAddress] = addresses;
  const [signature, setSignature] = useState<null | string>(null);

  const requestPolygonChain = async () => {
    console.log("switching chain id to: 137");
    await ethersProvider.send("wallet_switchEthereumChain", [
      { chainId: `0x${(137).toString(16)}` },
    ]);
  };

  const handleSignTypedDataV4 = async () => {
    try {
      if (chainId !== 137) {
        await requestPolygonChain();
      }

      const signer = ethersProvider.getSigner(walletAddress);
      const newSignature = await signer._signTypedData(
        TYPED_DATA_V4_PAYLOAD.domain,
        TYPED_DATA_V4_PAYLOAD.types,
        TYPED_DATA_V4_PAYLOAD.message,
      );
      setSignature(newSignature);
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    }
  };

  return (
    <div>
      <div>Wallet address: {walletAddress}</div>

      <button onClick={handleSignTypedDataV4}>Sign Typed Data v4</button>

      {signature && <div>Signature: {signature}</div>}
    </div>
  );
};

export default Wallet;
