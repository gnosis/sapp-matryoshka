import React, { useCallback, useEffect, useMemo, useState } from 'react';
import logo from './logo.svg';
import { BigNumber, ethers } from 'ethers';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { SafeAppsSdkProvider } from '@gnosis.pm/safe-apps-ethers-provider';
import './App.css';

const Erc20 = [
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
  "event Approval(address indexed _owner, address indexed _spender, uint256 _value)"
];
const Erc20Interface = new ethers.utils.Interface(Erc20)

declare global {
  interface Window { ethereum: any; }
}

interface Allowance {
  token: string,
  spender: string,
  allowance: BigNumber
}

const App: React.FC = () => {
  const { sdk, connected, safe } = useSafeAppsSDK();

  // Wallet logic
  const walletAddress = useCallback(async () => {
    return (await sdk.getSafeInfo()).safeAddress
  }, [sdk])

  const [connectedAddress, setConnectedAddress] = useState("")

  // Build provider 
  const provider = useMemo(() => new SafeAppsSdkProvider(safe, sdk), [safe, sdk])

  // Allowances loading logic
  const [allowances, setAllowances] = useState<Allowance[]>([])
  const loadAllowances = useCallback(async () => {
    try {
      const owner = await walletAddress()
      setConnectedAddress(owner)
      const eventInterface = Erc20Interface.getEvent("Approval")
      const filter = {
        topics: Erc20Interface.encodeFilterTopics(eventInterface, [owner]),
        fromBlock: "earliest"
      }
      const logs = await provider.getLogs(filter)

      const pastAllowances: Record<string, Record<string, boolean>> = {}
      logs.forEach((log) => {
        if (!pastAllowances[log.address]) pastAllowances[log.address] = {}
        const event = Erc20Interface.decodeEventLog(eventInterface, log.data, log.topics)
        pastAllowances[log.address][event._spender] = true
      })

      // Check current state of allowances
      const allowances = []
      for (const token of Object.keys(pastAllowances)) {
        const contract = new ethers.Contract( token , Erc20 , provider )
        for (const spender of Object.keys(pastAllowances[token])) {
          const allowance: BigNumber = (await contract.allowance(owner, spender))
          if (allowance.gt(0)) allowances.push({
            token, spender, allowance
          })
        }
      }
      setAllowances(allowances)
    } catch (e) {
      console.error(e)
    }
  }, [walletAddress, provider, setAllowances])

  useEffect(() => {
    loadAllowances()
  }, [loadAllowances])


  // Allowances reset logic
  const resetAllowance = useCallback(async(token: string, spender: string) => {
    try {
      await sdk.txs.send({
        txs: [{
          to: token,
          value: '0',
          data: Erc20Interface.encodeFunctionData("approve", [spender, 0])
        }

        ]
      })
    } catch (e) {
      console.error(e)
    }
  }, [sdk])

  // Allowances reset logic
  const resetAllAllowances = useCallback(async(allowances: Allowance[]) => {
    try {
      await sdk.txs.send({
        txs: allowances.map((allownace) => { return {
          to: allownace.token,
          value: '0',
          data: Erc20Interface.encodeFunctionData("approve", [allownace.spender, 0])
        }})
      })
    } catch (e) {
      console.error(e)
    }
  }, [sdk])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Current allowances for {connectedAddress}<br />
          <span onClick={() => resetAllAllowances(allowances)}>Reset all</span>
        </p>
        {allowances.map(allowance => <div>
          Token: {allowance.token}<br />
          Spender: {allowance.spender}<br />
          Allowance: {allowance.allowance.toString()}<br />
          <span onClick={() => resetAllowance(allowance.token, allowance.spender)}>Reset</span>
          <hr />
        </div>)}
      </header>
    </div>
  );
}

export default App;
