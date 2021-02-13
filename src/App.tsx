import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { SafeAppsSdkProvider } from '@gnosis.pm/safe-apps-ethers-provider';
import './App.css';
import {
  Button,
  TextField
} from '@gnosis.pm/safe-react-components';
import axios from 'axios';

const REFUNDER_ADDRESS = "0x2d8cE02dd1644A9238e08430CaeA15a609503140";
const WETH_ADDRESS = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
const MIN_FUNDS = ethers.utils.parseEther("0.001")

const Erc20 = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "event Approval(address indexed _owner, address indexed _spender, uint256 _value)"
];

const Erc20Interface = new ethers.utils.Interface(Erc20)

interface Page<T> {
  results: T[]
}

interface SafeInfo {
  nonce: number,
  threshold: number
}

interface SafeConfirmation {
    owner: string,
    signature: string
}

interface SafeTransaction {
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

interface GasTank {
  capacity: BigNumber,
  level: BigNumber
}

const getNextTxsFromService = async (safe: string, network: string): Promise<{ threshold: number, txs: SafeTransaction[] } > => {
  const safeInfoUrl = `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${safe}/`
  const infoResp = await axios.get<SafeInfo>(safeInfoUrl)
  const safeTxsUrl = `https://safe-transaction.${network}.gnosis.io/api/v1/safes/${safe}/multisig-transactions/?nonce=${infoResp.data.nonce}`
  const txsResp = await axios.get<Page<SafeTransaction>>(safeTxsUrl)
  return {
    threshold: infoResp.data.threshold,
    txs: txsResp.data.results
  }
}

const buildSignaturesBytes = (confirmations: SafeConfirmation[]): string => {
    return confirmations.sort((left, right) => left.owner.toLowerCase().localeCompare(right.owner.toLowerCase()))
        .reduce((acc, val) => acc + val.signature.slice(2), "0x")
}

const encodeSafeTransaction = (safe: string, safeTx: SafeTransaction): { to: string, method: string, methodData: string } => {
    console.log({
        safeTx
    })
    const safeInterface = new ethers.utils.Interface(['function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures)'])
    const encodedCall = safeInterface.encodeFunctionData('execTransaction', [safeTx.to, safeTx.value, safeTx.data || "0x", safeTx.operation, safeTx.safeTxGas, safeTx.baseGas, safeTx.gasPrice, safeTx.gasToken, safeTx.refundReceiver, buildSignaturesBytes(safeTx.confirmations)])
    const methodData = "0x" + encodedCall.slice(10)
    return {
        to: safe,
        method: encodedCall.slice(0, 10),
        methodData
    }
}

const App: React.FC = () => {
  const { sdk, connected, safe } = useSafeAppsSDK();

  const connectedSafe = useCallback(async () => {
    return (await sdk.getSafeInfo())
  }, [sdk])

  const [connectedAddress, setConnectedAddress] = useState("")
  const [gasTankState, setGasTankState] = useState<GasTank>({ capacity: BigNumber.from(0), level: BigNumber.from(0) })
  const [wethAmount, setWethAmount] = useState("")
  const [lastExecutedNonce, setLastExecutedNonce] = useState(-1)
  const [confirmationsRequired, setConfirmationsRequied] = useState(1000000000)
  const [gasAllowance, setGasAllowance] = useState("")

  const provider = useMemo(() => new SafeAppsSdkProvider(safe, sdk), [safe, sdk])
  const weth = useMemo(() => new ethers.Contract(WETH_ADDRESS, Erc20, provider), [provider])

  const [txs, setTxs] = useState<SafeTransaction[]>([])
  const loadTxs = useCallback(async () => {
    try {
      const safe = await connectedSafe()
      setConnectedAddress(safe.safeAddress)
      const network = safe.network.toLowerCase()
      if (network !== "rinkeby") throw Error(`Unsupported network ${network}`)
      const { threshold, txs} = await getNextTxsFromService(safe.safeAddress, network)
      setTxs(txs)
      setConfirmationsRequied(threshold)
    } catch (e) {
      console.error(e)
    }
  }, [connectedSafe, provider, setTxs, setConfirmationsRequied, setConnectedAddress])

  const loadGasTankState = useCallback(async () => {
    try {
      const safe = await connectedSafe()
      const capacity = await weth.allowance(safe.safeAddress, REFUNDER_ADDRESS)
      const level = await weth.balanceOf(safe.safeAddress)
      setGasTankState({ capacity, level })
    } catch (e) {
      console.error(e)
    }
  }, [connectedSafe, provider, weth, setTxs, setConnectedAddress])

  const loadInfo = useCallback(() => {
    loadTxs()
    loadGasTankState()
  }, [loadTxs, loadGasTankState])

  useEffect(() => {
    loadInfo()
  }, [loadInfo])

  const wrapEth = useCallback(async(amount: string) => {
    try {
      const parsedAmount = ethers.utils.parseEther(amount)
      await sdk.txs.send({
        txs: [{
          to: WETH_ADDRESS,
          value: parsedAmount.toString(),
          data: '0x'
        }]
      })
    } catch (e) {
      console.error(e)
    }
  }, [sdk])

  const updateGasAllowance = useCallback(async(allowance: string) => {
    try {
      const parsedAllowance = ethers.utils.parseEther(allowance)
      await sdk.txs.send({
        txs: [{
          to: WETH_ADDRESS,
          value: '0',
          data: Erc20Interface.encodeFunctionData("approve", [REFUNDER_ADDRESS, parsedAllowance])
        }]
      })
    } catch (e) {
      console.error(e)
    }
  }, [sdk])

  const relayTx = useCallback(async(tx: SafeTransaction) => {
    try {
      setLastExecutedNonce(tx.nonce)
      const safe = await connectedSafe()
      const executeData = encodeSafeTransaction(safe.safeAddress, tx)
      const executeUrl = `https://yacate-relay-rinkeby.herokuapp.com/v1/transactions/execute/generic`
      const txsResp = await axios.post<String>(executeUrl, executeData)
      console.log(txsResp)
    } catch (e) {
      setLastExecutedNonce(tx.nonce - 1)
      console.error(e)
    }
  }, [connectedSafe])

  const availableGasFunds = gasTankState.level.lte(gasTankState.capacity) ? gasTankState.level : gasTankState.capacity
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Next txs for {connectedAddress} <Button size="md" color="primary" onClick={loadInfo}>Reload</Button><br /><br />
          You pay your transaction fees with WETH from your Safe. For that you need to set an allowance for {REFUNDER_ADDRESS} for WETH ({WETH_ADDRESS}). At least 0.001 WETH for gas fees need to be available to use this Safe App!<br /><br />
          Max gas fees available: {ethers.utils.formatEther(availableGasFunds)} WETH<br /><br />
          <TextField label="Amount to wrap" value={wethAmount} onChange={(e) => setWethAmount(e.target.value)}/><br />
          {ethers.utils.formatEther(gasTankState.level)} WETH <Button size="md" color="primary" onClick={() => wrapEth(wethAmount)}>Wrap Eth</Button><br />
          <TextField label="Max funds to allow for paying gas" value={gasAllowance} onChange={(e) => setGasAllowance(e.target.value) } /><br />
          {ethers.utils.formatEther(gasTankState.capacity)} WETH <Button size="md" color="primary" onClick={() => updateGasAllowance(gasAllowance)}>Set Gas Allowance</Button><br />
        </p>
        {txs.map(tx => <div>
          Safe Tx Hash: {tx.safeTxHash}<br />
          To: {tx.to}<br />
          Nonce: {tx.nonce}<br />
          <Button size="md" color="primary" onClick={() => relayTx(tx)} disabled={confirmationsRequired > tx.confirmations.length || tx.nonce <= lastExecutedNonce || availableGasFunds.lt(MIN_FUNDS)}>Relay</Button>
          <hr />
        </div>)}
      </header>
    </div>
  );
}

export default App;
