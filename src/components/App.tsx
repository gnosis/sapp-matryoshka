import { SafeAppsSdkProvider } from '@gnosis.pm/safe-apps-ethers-provider'
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk'
import { Button } from '@gnosis.pm/safe-react-components'
import { BigNumber, ethers } from 'ethers'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { SafeTransaction } from '../logic/safeTransactions'
import { getNextTxsFromService } from '../logic/serviceRequests'
import { REFUNDER_ADDRESS, WETH_ADDRESS } from '../utils/constants'
import { Erc20 } from '../utils/contracts'
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
  const { sdk, safe } = useSafeAppsSDK()

  const [txs, setTxs] = useState<SafeTransaction[]>([])
  const [confirmationsRequired, setConfirmationsRequied] = useState<number | undefined>()
  const [availableGasFunds, setAvailableGasFunds] = useState<BigNumber | undefined>()
  const [gasTankState, setGasTankState] = useState<GasTank>({
    capacity: BigNumber.from(0),
    level: BigNumber.from(0)
  })

  const provider = useMemo(() => new SafeAppsSdkProvider(safe, sdk), [safe, sdk])
  const weth = useMemo(() => new ethers.Contract(WETH_ADDRESS, Erc20, provider), [provider])

  const loadTxs = useCallback(async () => {
    try {
      if (!safe.safeAddress) return
      const network = safe.network.toLowerCase()
      if (network !== 'rinkeby') throw Error(`Unsupported network ${network}`)
      const { threshold, txs } = await getNextTxsFromService(network, safe.safeAddress)
      setTxs(txs)
      setConfirmationsRequied(threshold)
    } catch (e) {
      console.error(e)
    }
  }, [safe])

  const loadGasTankState = useCallback(async () => {
    try {
      if (!safe.safeAddress) return
      const capacity: BigNumber = await weth.allowance(safe.safeAddress, REFUNDER_ADDRESS)
      const level: BigNumber = await weth.balanceOf(safe.safeAddress)
      setGasTankState({ capacity, level })
    } catch (e) {
      console.error(e)
    }
  }, [safe, weth])

  useEffect(() => {
    const gasFunds = gasTankState.level.lte(gasTankState.capacity)
      ? gasTankState.level
      : gasTankState.capacity
    setAvailableGasFunds(gasFunds)
  }, [gasTankState])

  const loadInfo = useCallback(() => {
    loadTxs()
    loadGasTankState()
  }, [loadTxs, loadGasTankState])

  useEffect(() => {
    loadInfo()
  }, [loadInfo])

  return (
    <>
      <Button size="md" color="primary" variant="contained" onClick={loadInfo}>
        Reload
      </Button>
      <Container>
        <Settings sdk={sdk} availableGasFunds={availableGasFunds} gasTankState={gasTankState} />
        <Transactions
          safe={safe}
          txs={txs}
          setTxs={setTxs}
          confirmationsRequired={confirmationsRequired}
          availableGasFunds={availableGasFunds}
        />
      </Container>
    </>
  )
}

export default App
