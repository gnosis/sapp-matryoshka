import { Button, Text } from '@gnosis.pm/safe-react-components'
import axios from 'axios'
import { BigNumber } from 'ethers'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { encodeSafeTransaction, SafeTransaction } from '../logic/safeTransactions'
import { SEthHashInfo } from '../styles/common'
import { MIN_FUNDS, SERVICE_URL } from '../utils/constants'

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
  safe: any
  txs: SafeTransaction[]
  setTxs: Function
  confirmationsRequired?: number
  availableGasFunds?: BigNumber
}

const Transactions = ({
  safe,
  txs,
  setTxs,
  confirmationsRequired,
  availableGasFunds
}: TransactionsProps) => {
  const [lastExecutedNonce, setLastExecutedNonce] = useState(-1)

  const relayTx = useCallback(
    async (tx: SafeTransaction) => {
      try {
        if (!safe.safeAddress) return
        const executeData = encodeSafeTransaction(safe.safeAddress, tx)
        const txsResp = await axios.post<String>(SERVICE_URL, executeData)
        console.log(txsResp)
        setLastExecutedNonce(tx.nonce)
        setTxs((txs: SafeTransaction[]) => txs.filter((t) => t.safeTxHash !== tx.safeTxHash))
      } catch (e) {
        setLastExecutedNonce(tx.nonce - 1)
        console.error(e)
      }
    },
    [safe]
  )

  return (
    <Wrapper>
      <Line>
        <Text size="lg">
          <b>Next transactions for</b>
        </Text>
        <SEthHashInfo
          hash={safe.safeAddress}
          textSize="lg"
          shortenHash={4}
          textColor="primary"
          showEtherscanBtn
        />
      </Line>
      {txs.map((tx) => {
        const isNotExecutable =
          (confirmationsRequired && confirmationsRequired > tx.confirmations.length) ||
          tx.nonce <= lastExecutedNonce ||
          availableGasFunds?.lt(MIN_FUNDS)

        return (
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
                disabled={isNotExecutable}
              >
                Relay
              </Button>
            </div>
            {isNotExecutable && (
              <MessageDisabled>
                <Text size="lg" color="error">
                  This transaction cannot be relayed until it has the required number of
                  confirmations
                </Text>
              </MessageDisabled>
            )}
          </Transaction>
        )
      })}
    </Wrapper>
  )
}

export default Transactions
