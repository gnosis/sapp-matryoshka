import { Button, Text } from '@gnosis.pm/safe-react-components'
import { BigNumber } from 'ethers'
import React from 'react'
import styled from 'styled-components'
import { SafeTransaction } from '../logic/safeTransactions'
import { SEthHashInfo } from '../styles/common'
import { MIN_FUNDS } from '../utils/constants'

const Wrapper = styled.div`
  border-left: 2px solid #eee;
  flex: 1;
  padding: 20px 0 20px 30px;
  @media screen and (max-width: 930px) {
    border-left: none;
    border-bottom: 2px solid #eee;
    padding: 20px 0 30px 0;
  }
`

const Transaction = styled.div`
  background: #fafafa;
  padding: 20px;
  border-radius: 7px;
  margin-top: 20px;
  > div {
    display: flex;
    justify-content: space-between;
  }
`

const Line = styled.div`
  display: flex;
  align-items: center;
  min-height: 35px;
  > p {
    line-height: 2.3;
  }
`

const MessageDisabled = styled.div`
  margin: 10px 0 0;
`

interface TransactionsProps {
  connectedAddress: string
  txs: SafeTransaction[]
  confirmationsRequired: number
  lastExecutedNonce: number
  availableGasFunds: BigNumber
  relayTx: Function
}

const Transactions = ({
  connectedAddress,
  txs,
  confirmationsRequired,
  lastExecutedNonce,
  availableGasFunds,
  relayTx
}: TransactionsProps) => {
  return (
    <Wrapper>
      <Line>
        <Text size="lg">
          <b>Next transactions for</b>
        </Text>
        <SEthHashInfo
          hash={connectedAddress}
          textSize="lg"
          shortenHash={4}
          textColor="primary"
          showEtherscanBtn
        />
      </Line>
      {txs.map((tx) => (
        <Transaction key={tx.safeTxHash}>
          <div>
            <div>
              <Line>
                <Text size="lg">
                  <b>Safe Tx Hash:</b>
                </Text>
                <SEthHashInfo
                  hash={tx.safeTxHash}
                  textSize="lg"
                  shortenHash={4}
                  textColor="primary"
                  showEtherscanBtn
                  noMargin
                />
              </Line>
              <Line>
                <Text size="lg">
                  <b>To:</b>
                </Text>
                <SEthHashInfo
                  hash={tx.to}
                  textSize="lg"
                  shortenHash={4}
                  textColor="primary"
                  showEtherscanBtn
                  noMargin
                />
              </Line>
              <Line>
                <Text size="lg">
                  <b>Nonce: </b>
                  {tx.nonce}
                </Text>
              </Line>
            </div>
            <Button
              size="md"
              color="primary"
              variant="contained"
              onClick={() => relayTx(tx)}
              disabled={
                confirmationsRequired > tx.confirmations.length ||
                tx.nonce <= lastExecutedNonce ||
                availableGasFunds.lt(MIN_FUNDS)
              }
            >
              Relay
            </Button>
          </div>
          {(confirmationsRequired > tx.confirmations.length ||
            tx.nonce <= lastExecutedNonce ||
            availableGasFunds.lt(MIN_FUNDS)) && (
            <MessageDisabled>
              <Text size="lg" color="error">
                This transaction cannot be relayed until it has the required number of confirmations
              </Text>
            </MessageDisabled>
          )}
        </Transaction>
      ))}
    </Wrapper>
  )
}

export default Transactions
