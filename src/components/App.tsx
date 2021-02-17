import { SafeAppsSdkProvider } from '@gnosis.pm/safe-apps-ethers-provider';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { Button, TextField } from '@gnosis.pm/safe-react-components';
import axios from 'axios';
import { BigNumber, ethers } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { encodeSafeTransaction, SafeTransaction } from '../logic/safeTransactions';
import { getNextTxsFromService } from '../logic/serviceRequests';
import { MIN_FUNDS, REFUNDER_ADDRESS, SERVICE_URL, WETH_ADDRESS } from '../utils/constants';
import { Erc20, Erc20Interface } from '../utils/contracts';

interface GasTank {
  capacity: BigNumber,
  level: BigNumber
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
      const { threshold, txs} = await getNextTxsFromService(network, safe.safeAddress)
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
      const txsResp = await axios.post<String>(SERVICE_URL, executeData)
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
