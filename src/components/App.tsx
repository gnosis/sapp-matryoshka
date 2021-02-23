import { SafeAppsSdkProvider } from '@gnosis.pm/safe-apps-ethers-provider'
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk'
import { Button } from '@gnosis.pm/safe-react-components'
import axios from 'axios'
import { BigNumber, ethers } from 'ethers'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { encodeSafeTransaction, SafeTransaction } from '../logic/safeTransactions'
import { getNextTxsFromService } from '../logic/serviceRequests'
import { REFUNDER_ADDRESS, SERVICE_URL, WETH_ADDRESS } from '../utils/constants'
import { Erc20, Erc20Interface } from '../utils/contracts'
import Settings from './Settings'
import Transactions from './Transactions'

const Container = styled.div`
  border-top: 2px solid #eee;
  margin-top: 30px;
  display: flex;
  @media screen and (max-width: 930px) {
    flex-direction: column-reverse;
  }
`

export interface GasTank {
  capacity: BigNumber
  level: BigNumber
}

const App: React.FC = () => {
  const { sdk, connected, safe } = useSafeAppsSDK()

  const connectedSafe = useCallback(async () => {
    return await sdk.getSafeInfo()
  }, [sdk])

  const [connectedAddress, setConnectedAddress] = useState('')
  const [gasTankState, setGasTankState] = useState<GasTank>({
    capacity: BigNumber.from(0),
    level: BigNumber.from(0)
  })
  const [wethAmount, setWethAmount] = useState('')
  const [lastExecutedNonce, setLastExecutedNonce] = useState(-1)
  const [confirmationsRequired, setConfirmationsRequied] = useState(1000000000)
  const [gasAllowance, setGasAllowance] = useState('')
  const [txs, setTxs] = useState<SafeTransaction[]>([])

  const provider = useMemo(() => new SafeAppsSdkProvider(safe, sdk), [safe, sdk])
  const weth = useMemo(() => new ethers.Contract(WETH_ADDRESS, Erc20, provider), [provider])

  const loadTxs = useCallback(async () => {
    try {
      const safe = await connectedSafe()
      setConnectedAddress(safe.safeAddress)
      const network = safe.network.toLowerCase()
      if (network !== 'rinkeby') throw Error(`Unsupported network ${network}`)
      const { threshold, txs } = await getNextTxsFromService(network, safe.safeAddress)
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

  const wrapEth = useCallback(
    async (amount: string) => {
      try {
        const parsedAmount = ethers.utils.parseEther(amount)
        await sdk.txs.send({
          txs: [
            {
              to: WETH_ADDRESS,
              value: parsedAmount.toString(),
              data: '0x'
            }
          ]
        })
      } catch (e) {
        console.error(e)
      }
    },
    [sdk]
  )

  const updateGasAllowance = useCallback(
    async (allowance: string) => {
      try {
        const parsedAllowance = ethers.utils.parseEther(allowance)
        await sdk.txs.send({
          txs: [
            {
              to: WETH_ADDRESS,
              value: '0',
              data: Erc20Interface.encodeFunctionData('approve', [
                REFUNDER_ADDRESS,
                parsedAllowance
              ])
            }
          ]
        })
      } catch (e) {
        console.error(e)
      }
    },
    [sdk]
  )

  const relayTx = useCallback(
    async (tx: SafeTransaction) => {
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
    },
    [connectedSafe]
  )

  const availableGasFunds = gasTankState.level.lte(gasTankState.capacity)
    ? gasTankState.level
    : gasTankState.capacity

  return (
    <>
      <Button size="md" color="primary" variant="contained" onClick={loadInfo}>
        Reload
      </Button>
      <Container>
        <Settings
          availableGasFunds={availableGasFunds}
          wethAmount={wethAmount}
          setWethAmount={setWethAmount}
          gasTankState={gasTankState}
          wrapEth={wrapEth}
          gasAllowance={gasAllowance}
          setGasAllowance={setGasAllowance}
          updateGasAllowance={updateGasAllowance}
        />
        <Transactions
          connectedAddress={connectedAddress}
          txs={txs}
          confirmationsRequired={confirmationsRequired}
          lastExecutedNonce={lastExecutedNonce}
          availableGasFunds={availableGasFunds}
          relayTx={relayTx}
        />
      </Container>
    </>
  )
}

export default App
