const walletAddress = process.env.PUBLIC_KEY
const pKey = process.env.SIGNER_PRIVATE_KEY
const projectID = process.env.PROJECT_ID
const network = process.env.NETWORK
const ps = require("prompt-sync")
const prompt = ps()
require("dotenv").config()
const ethers = require("ethers")
const isNumeric = require("../utils/isNumeric")
const handleDepositTx = require("./handleDepositTx")

const depositMATIC = async (amountInMATIC) => {
  try {
    // Using Infura provider to connect to the blockchain
    const itx = new ethers.providers.InfuraProvider(network, projectID)

    // Initialize your wallet account address as your signer
    // pKey here is your metamask account private key
    const signer = new ethers.Wallet(pKey, itx)

    // Get your nonce value for your wallet address
    const nonce = await itx.getTransactionCount(walletAddress)

    // Parsee the string representation of ETH into
    // Big number instance of the amount in WEI
    const amount = ethers.BigNumber.from(ethers.utils.parseEther(amountInMATIC))

    // Object consisting all the required data of the user transaction
    // To start the transaction process
    const userTxData = {
      signer,
      nonce,
      amount,
      itx,
    }

    // Passing the user transaction data to begin transaction process
    // and get the transaction hash
    tx = await handleDepositTx(userTxData)
    txHash = tx.hash
    console.log(`The generated transaction hash is ${txHash}\n`)
    console.log("You can check your transaction at:")
    console.log(`https://polygonscan.com/tx/${txHash}\n`)

    // Waiting for the transaction to be mined
    await tx.wait()

    console.log(txHash, "was mined successfully")

    // Get the txReceipt
    txReceipt = await itx.getTransactionReceipt(txHash)

    // Return the success txReceipt
    if (txReceipt != null) return txReceipt
    console.log("Transaction failed...")
    process.exit(1)
  } catch (error) {
    console.log("Error in depositMATIC", error)
    process.exit(1)
  }
}

async function deposit() {
  // Basic user input and input checks

  const amountInMATIC = prompt("Enter the amount of MATIC to transfer: ")
  if (!amountInMATIC) return console.log("Transfer amount cannot be null")
  if (isNumeric(amountInMATIC) === false)
    return console.log("Invalid transfer amount")
  const confirmation = prompt(
    `Are you sure you want to transfer ${amountInMATIC} MATIC to 0x015C7C7A7D65bbdb117C573007219107BD7486f9? (Y/N): `
  )
  if (confirmation !== "Y" && confirmation !== "y") return

  console.log("\nFetching all the necessary data to start mining\n")

  // Pass the user input data object to start the transaction process
  const txReceipt = await depositMATIC(amountInMATIC)

  return txReceipt
}

module.exports = deposit
