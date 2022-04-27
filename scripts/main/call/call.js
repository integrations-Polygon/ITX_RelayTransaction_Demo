const walletAddress = process.env.PUBLIC_KEY
const pKey = process.env.SIGNER_PRIVATE_KEY
const projectID = process.env.PROJECT_ID
const network = process.env.NETWORK
const ps = require("prompt-sync")
const prompt = ps()
require("dotenv").config()
const ethers = require("ethers")
const handleCallTx = require("./handleCallTx")
const isNumeric = require("../utils/isNumeric")
const { fetchAbiData } = require("../utils/fetchData")

const contractFunctionCall = async ({
  txType,
  contractAddress,
  functionName,
  arrayOfArgs,
}) => {
  try {
    // Using Infura provider to connect to the blockchain
    const itx = new ethers.providers.InfuraProvider(network, projectID)

    // Initialize your wallet account address as your signer
    // pKey here is your metamask account private key
    const signer = new ethers.Wallet(pKey, itx)

    // Fetch your smart contract ABI data from the blockchain
    // Your smart contract must be deployed and verified
    const abiData = await fetchAbiData(contractAddress)
    const abi = abiData.result

    // Initialize your interface
    // The Interface abstracts the encoding and decoding
    // required to interact with your contracts on the blockchain.
    const iface = new ethers.utils.Interface(abi)

    // Get your nonce value for your wallet address
    const nonce = await itx.getTransactionCount(walletAddress)

    // Object consisting all the required data of the user transaction
    // To start the transaction process
    const userTxData = {
      signer,
      txType,
      contractAddress,
      functionName,
      arrayOfArgs,
      iface,
      nonce,
      itx,
    }

    // Passing the user transaction data to begin transaction process
    // and get the transaction hash
    txReceipt = await handleCallTx(userTxData)

    // Return the success txReceipt
    if (txReceipt != null) return txReceipt
    console.log("Transaction failed...")
    process.exit(1)
  } catch (error) {
    console.log("Error in contractFunctionCall", error)
    process.exit(1)
  }
}

async function call() {
  // Empty array to store user input arguments
  let arrayOfArgs = []

  // Basic user input and input checks
  const txType = prompt(
    "Enter the transaction type (1 for legacy || 2 for EIP-1559): "
  )
  if (!txType) return console.log("Transaction type cannot be null")
  if (txType !== "1" && txType !== "2")
    return console.log(`Transaction type ${txType} is unsupported`)
  const contractAddress = prompt(
    "Enter the deployed & verified smart contract address: "
  )
  if (!contractAddress) return console.log("Contract address cannot be null")
  if (contractAddress.length !== 42)
    return console.log(`${contractAddress} is not a valid address`)
  const functionName = prompt("Enter the name of the function to call: ")
  if (!functionName) return console.log("Function name cannot be null")
  const totalArgs = prompt("Enter the total number of argument: ")
  if (!totalArgs) return console.log("Total number of argument cannot be null")
  if (isNumeric(totalArgs) === false) return console.log("Invalid input")
  if (totalArgs !== 0) {
    for (i = 0; i < totalArgs; i++)
      arrayOfArgs[i] = prompt(`Enter your argument [${i + 1}]: `)
  }
  console.log("\nFetching all the necessary data to start mining\n")

  // Stores all the user input data in an object
  const userInputData = {
    txType,
    contractAddress,
    functionName,
    arrayOfArgs,
  }

  // Pass the user input data object to start the transaction process
  const txReceipt = await contractFunctionCall(userInputData)

  return txReceipt
}

module.exports = call
