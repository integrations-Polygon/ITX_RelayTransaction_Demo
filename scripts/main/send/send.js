const walletAddress = process.env.PUBLIC_KEY
const pKey = process.env.SIGNER_PRIVATE_KEY
const projectID = process.env.PROJECT_ID
const network = process.env.NETWORK
const ps = require("prompt-sync")
const prompt = ps()
require("dotenv").config()
const ethers = require("ethers")
const handleSendTx = require("./handleSendTx")
const isNumeric = require("../utils/isNumeric")

const accountTransfer = async ({ txType, receiverAddress, amountInMATIC }) => {
  try {
    // Initial non constant variables
    let txReceipt = null

    // Using Infura provider to connect to the blockchain
    const itx = new ethers.providers.InfuraProvider(network, projectID)

    // Initialize your wallet account address as your signer
    // pKey here is your metamask account private key
    const signer = new ethers.Wallet(pKey, itx)

    // Retry sending transaction utill success, 5 retries max

      // Parsee the string representation of ETH into
      // Big number instance of the amount in WEI
      const amount = ethers.BigNumber.from(
        ethers.utils.parseEther(amountInMATIC)
      )

      // Get your nonce value for your wallet address
      const nonce = await itx.getTransactionCount(walletAddress)

      // Object consisting all the required data of the user
      // To start the transaction process
      const userTxData = { signer, txType, receiverAddress, amount, nonce, itx }

      // Passing the user transaction data to begin transaction process
      // and get the transaction hash
      txReceipt = await handleSendTx(userTxData)

    // Return the success txReceipt
    if (txReceipt != null) return txReceipt
    console.log("Transaction failed...")
    process.exit(1)
  } catch (error) {
    console.log("Error in accountTransfer", error)
    process.exit(1)
  }
}

async function send() {
  // Basic user input and input checks
  const txType = prompt(
    "Enter the transaction type (1 for legacy || 2 for EIP-1559): "
  )
  if (!txType) return console.log("Transaction type cannot be null")
  if (txType !== "1" && txType !== "2")
    return console.log(`Transaction type ${txType} is unsupported`)
  const receiverAddress = prompt("Enter the receiver address: ")
  if (!receiverAddress) return console.log("Receiver address cannot be null")
  if (receiverAddress.length !== 42)
    return console.log(`${receiverAddress} is not a valid address`)
  const amountInMATIC = prompt("Enter the amount of MATIC to transfer: ")
  if (!amountInMATIC) return console.log("Transfer amount cannot be null")
  if (isNumeric(amountInMATIC) === false)
    return console.log("Invalid transfer amount")
  const confirmation = prompt(
    `Are you sure you want to transfer ${amountInMATIC} MATIC to ${receiverAddress}? (Y/N): `
  )
  if (confirmation !== "Y" && confirmation !== "y") return
  console.log("\nFetching all the necessary data to start mining\n")

  // Stores all the user input data in an object
  const userInputData = {
    txType,
    receiverAddress,
    amountInMATIC,
  }

  // Pass the user input data object to start the transaction process
  const txReceipt = await accountTransfer(userInputData)

  return txReceipt
}

module.exports = send