import { useContext } from "react";
import { Web3Context } from "./web3Context";

export function useWeb3() {
  const value = useContext(Web3Context);

  if (!value) {
    throw new Error("useWeb3 must be used inside Web3Provider.");
  }

  return value;
}
