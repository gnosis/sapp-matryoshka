import { Button, Text } from '@gnosis.pm/safe-react-components'
import { BigNumber, ethers } from 'ethers'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { SEthHashInfo, STextField } from '../styles/common'
import { REFUNDER_ADDRESS, WETH_ADDRESS } from '../utils/constants'
import { Erc20Interface } from '../utils/contracts'
import { GasTank } from './App'

const Wrapper = styled.div`
  width: 470px;
  min-width: 470px;
  margin: 0 30px 0 0;
  padding: 20px 0 0 0;
  @media screen and (max-width: 930px) {
    margin: 5px auto 0;
    width: auto;
    min-width: 100%;
  }
`

const Description = styled.div`
  margin-bottom: 10px;
`

const Line = styled.div`
  display: flex;
  align-items: center;
  min-height: 35px;
  justify-content: space-between;
`

const NoFlexLine = styled.div`
  min-height: 35px;
  > p {
    display: inline-block;
    line-height: 2.3;
  }
`

interface SettingsProps {
  sdk: any
  gasTankState: GasTank
  availableGasFunds?: BigNumber
}

const Settings = ({ sdk, gasTankState, availableGasFunds }: SettingsProps) => {
  const [wethAmount, setWethAmount] = useState('')
  const [gasAllowance, setGasAllowance] = useState('')

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

  return (
    <Wrapper>
      <Description>
        <Line>
          <Text size="lg">Pay your transaction fees with WETH from your Safe.</Text>
        </Line>
        <NoFlexLine>
          <Text size="lg">Set an allowance for </Text>
          <SEthHashInfo
            hash={REFUNDER_ADDRESS}
            textSize="lg"
            shortenHash={4}
            textColor="primary"
            showEtherscanBtn
          />
          <Text size="lg">for WETH </Text>
          <SEthHashInfo
            hash={WETH_ADDRESS}
            textSize="lg"
            shortenHash={4}
            textColor="primary"
            showEtherscanBtn
          />
        </NoFlexLine>
        <Line>
          <Text size="lg">
            At least 0.001 WETH for gas fees need to be available to use this Safe App!
          </Text>
        </Line>
      </Description>
      <Line>
        <Text size="lg">
          <b>Max gas fees available:</b>{' '}
          {availableGasFunds && ethers.utils.formatEther(availableGasFunds)} WETH
        </Text>
      </Line>
      <STextField
        label="Amount to wrap"
        value={wethAmount}
        onChange={(e) => setWethAmount(e.target.value)}
      />
      <Line>
        <Text size="lg">{ethers.utils.formatEther(gasTankState.level)} WETH</Text>
        <Button size="md" color="primary" onClick={() => wrapEth(wethAmount)}>
          Wrap Eth
        </Button>
      </Line>
      <STextField
        label="Max funds to allow for paying gas"
        value={gasAllowance}
        onChange={(e) => setGasAllowance(e.target.value)}
      />
      <Line>
        <Text size="lg">{ethers.utils.formatEther(gasTankState.capacity)} WETH</Text>
        <Button size="md" color="primary" onClick={() => updateGasAllowance(gasAllowance)}>
          Set Gas Allowance
        </Button>
      </Line>
    </Wrapper>
  )
}

export default Settings
