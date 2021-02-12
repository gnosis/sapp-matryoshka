# Safe App Allowances Manager Example

- `yarn create react-app sapp-allowances-manager --template typescript`
- Use react rewired
  - Run with HTTPS
  - Safe app SSL certificate needs to be "trusted" by your browser
- Add Safe app properties to `manifest.json`
  - `name` 
  - `description`
  - `url`
  - `iconPath`
- `yarn add @gnosis.pm/safe-apps-react-sdk`
  - https://github.com/gnosis/safe-apps-sdk/tree/master/packages/safe-apps-react-sdk
- `yarn add @gnosis.pm/safe-apps-ethers-provider`
  - https://github.com/gnosis/safe-apps-sdk/tree/master/packages/safe-apps-ethers-provider