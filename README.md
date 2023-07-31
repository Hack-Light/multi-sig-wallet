# 🏗 scaffold-eth | 🏰 BuidlGuidl

## 🚩 Challenge 5 - Multisig 👛

## 🚩 My Solution

[Link to the verified contract address](https://sepolia.etherscan.io/address/0x03Da74C2522e6f36A1879A2E45108a9758763016)

[Link to live wallet](https://weak-rain.surge.sh)

## 👇🏼 Quick Break-Down 👛

This is a smart contract that acts as an off-chain signature-based shared wallet amongst different signers that showcases use of meta-transaction knowledge and ECDSA `recover()`. **If you are looking for the challenge, go to the challenges repo within scaffold-eth!**

> If you are unfamiliar with these concepts, check out all the [ETH.BUILD videos](https://www.youtube.com/watch?v=CbbcISQvy1E&ab_channel=AustinGriffith) by Austin Griffith, especially the Meta Transactions one!

At a high-level, the contract core functions are carried out as follows:

**Off-chain: ⛓🙅🏻‍♂️** - Generation of a packed hash (bytes32) for a function call with specific parameters through a public view function . - It is signed by one of the signers associated to the multisig, and added to an array of signatures (`bytes[] memory signatures`)

**On-Chain: ⛓🙆🏻‍♂️**

- `bytes[] memory signatures` is then passed into `executeTransaction` as well as the necessary info to use `recover()` to obtain the public address that ought to line up with one of the signers of the wallet.
  - This method, plus some conditional logic to avoid any duplicate entries from a single signer, is how votes for a specific transaction (hashed tx) are assessed.
- If it's a success, the tx is passed to the `call(){}` function of the deployed MetaMultiSigWallet contract (this contract), thereby passing the `onlySelf` modifier for any possible calls to internal txs such as (`addSigner()`,`removeSigner()`,`transferFunds()`,`updateSignaturesRequried()`).

**Cool Stuff that is Showcased: 😎**

- NOTE: Showcases how the `call(){}` function is an external call that ought to increase the nonce of an external contract, as [they increment differently](https://ethereum.stackexchange.com/questions/764/do-contracts-also-have-a-nonce) from user accounts.
- Normal internal functions, such as changing the signers, and adding or removing signers, are treated as external function calls when `call()` is used with the respective transaction hash.
- Showcases use of an array (see constructor) populating a mapping to store pertinent information within the deployed smart contract storage location within the EVM in a more efficient manner.

---

# 🏃‍♀️ Quick Start

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-challenges challenge-5-multisig

cd challenge-5-multisig

git checkout challenge-5-multisig
```

```bash

yarn install

```

```bash

yarn chain

```

> in a second terminal window:

```bash
cd challenge-5-multisig
yarn start

```

🔏 Edit your smart contract `MultiSigWallet.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment script `deploy.js` in `packages/hardhat/scripts`

📱 Open http://localhost:3000 to see the app

> in a third terminal window:

```bash
yarn backend

```

🔧 Configure your deployment in `packages/hardhat/scripts/deploy.js`

> Edit the chainid, your owner addresses, and the number of signatures required:

![image](https://user-images.githubusercontent.com/2653167/99156751-bfc59b00-2680-11eb-8d9d-e33777173209.png)

> in a fourth terminal deploy with your frontend address as one of the owners:

```bash

yarn deploy

```
