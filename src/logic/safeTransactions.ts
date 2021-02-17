import { ethers } from "ethers";

interface SafeConfirmation {
  owner: string,
  signature: string
}

export interface SafeTransaction {
  safeTxHash: string,
  to: string,
  value: string,
  data: string,
  operation: number,
  gasToken: string,
  safeTxGas: number,
  baseGas: number,
  gasPrice: string,
  refundReceiver: string,
  nonce: number,
  confirmationsRequired: number,
  confirmations: SafeConfirmation[]
}

const buildSignaturesBytes = (confirmations: SafeConfirmation[]): string => {
  return confirmations.sort((left, right) => left.owner.toLowerCase().localeCompare(right.owner.toLowerCase()))
      .reduce((acc, val) => acc + val.signature.slice(2), "0x")
}

export const encodeSafeTransaction = (safe: string, safeTx: SafeTransaction): { to: string, method: string, methodData: string } => {
  console.log({ safeTx })
  const safeInterface = new ethers.utils.Interface(['function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures)'])
  const encodedCall = safeInterface.encodeFunctionData('execTransaction', [safeTx.to, safeTx.value, safeTx.data || "0x", safeTx.operation, safeTx.safeTxGas, safeTx.baseGas, safeTx.gasPrice, safeTx.gasToken, safeTx.refundReceiver, buildSignaturesBytes(safeTx.confirmations)])
  const methodData = "0x" + encodedCall.slice(10)
  return {
      to: safe,
      method: encodedCall.slice(0, 10),
      methodData
  }
}
