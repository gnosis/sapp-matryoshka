import axios from 'axios'
import { SafeTransaction } from './safeTransactions'

interface SafeInfo {
  nonce: number
  threshold: number
}

interface Page<T> {
  results: T[]
}

const getSafeInfoUrl = (network: string, safeAddress: string): string => {
  return `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${safeAddress}/`
}

const getSafeTxsUrl = (network: string, safeAddress: string, nonce: string): string => {
  const safeInfoUrl = getSafeInfoUrl(network, safeAddress)
  return `${safeInfoUrl}/multisig-transactions/?nonce=${nonce}`
}

export const getNextTxsFromService = async (
  network: string,
  safeAddress: string
): Promise<{ threshold: number; txs: SafeTransaction[] }> => {
  const safeInfoUrl = getSafeInfoUrl(network, safeAddress)
  const infoResp = await axios.get<SafeInfo>(safeInfoUrl)
  const safeTxsUrl = getSafeTxsUrl(network, safeAddress, infoResp.data.nonce.toString())
  const txsResp = await axios.get<Page<SafeTransaction>>(safeTxsUrl)
  return {
    threshold: infoResp.data.threshold,
    txs: txsResp.data.results
  }
}
