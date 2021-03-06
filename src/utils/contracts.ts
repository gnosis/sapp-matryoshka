import { ethers } from 'ethers'

export const Erc20 = [
  'function approve(address _spender, uint256 _value) public returns (bool success)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
  'function balanceOf(address _owner) public view returns (uint256 balance)',
  'event Approval(address indexed _owner, address indexed _spender, uint256 _value)'
]

export const Erc20Interface = new ethers.utils.Interface(Erc20)

export const safeInterface = new ethers.utils.Interface([
  'function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures)'
])
