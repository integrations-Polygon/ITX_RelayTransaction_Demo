const ethers = require("ethers")
const waitForTransaction = require("../utils/waitForTransaction")

const handleCallTx = async ({
  signer,
  txType,
  contractAddress,
  functionName,
  arrayOfArgs,
  iface,
  nonce,
  itx,
}) => {
  let gasLimit
  const chainID = "137"
  try {
    /* Encoding the function data retreived from the user, the parameters
     * has to be converted to strings if you are manually inputting the data
     * for it to pass the encoding process here my parameters are already string
     * but for the sake of the demo calling toString() on the function data
     */
    const encodedFunctionData = iface.encodeFunctionData(
      functionName.toString(),
      [arrayOfArgs.toString()]
    )

    // For type 1 transaction
    if (txType === "1") {
      // Get the estimated gas limit for this transaction payload
      gasLimit = await itx.estimateGas({
        type: 1,
        to: contractAddress,
        data: encodedFunctionData,
        nonce: nonce,
        gasLimit: 14_999_999, // polygon transaction limit
      })

      // Transaction payload object with your encoded function data & estimated gas limit
      const txPayload = {
        type: 1,
        to: contractAddress,
        nonce: nonce,
        data: encodedFunctionData,
        gas: gasLimit.toString(),
        // "fast" and "slow" supported
        schedule: "fast",
      }

      // Sign a relay request using the signer's private key
      const relayTransactionHashToSign = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint", "address", "uint", "bytes", "uint", "string"],
          [
            txPayload.type,
            txPayload.to,
            txPayload.nonce,
            txPayload.data,
            txPayload.gas,
            txPayload.schedule,
          ]
        )
      )

      // Sign the relay transaction hash
      const signature = await signer.signMessage(
        ethers.utils.arrayify(relayTransactionHashToSign)
      )
      // Relay the transaction through itx
      const sentAtBlock = await itx.getBlockNumber()

      // Send the signed relay transaction hash to the network
      // with its transaction payload object and signature
      console.log("before sendTransaction")
      const { relayTransactionHash } = await itx.send("relay_sendTransaction", [
        txPayload,
        signature,
      ])
      console.log(
        `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
      )
      console.log(`ITX relay transaction hash: ${relayTransactionHash}`)
      console.log("You can check your transaction at:")
      console.log(`https://polygonscan.com/tx/${txHash}\n`)

      const txReceipt = waitForTransaction(
        relayTransactionHash,
        sentAtBlock,
        itx
      )

      // Return the transaction receipt
      return txReceipt
    }

    // For type 2 transaction
    if (txType === "2") {
      // Get the estimated gas limit for this transaction payload
      gasLimit = await itx.estimateGas({
        type: 2,
        to: contractAddress,
        data: encodedFunctionData,
        nonce: nonce,
        gasLimit: 14_999_999, // polygon transaction limit
      })

      // Transaction payload object with your encoded function data & estimated gas limit
      const txPayload = {
        // type: 2,
        to: contractAddress,
        data: encodedFunctionData,
        // nonce: nonce,
        gas: gasLimit.toString(),
        // "fast" and "slow" supported
        schedule: "fast",
      }

      // Sign a relay request using the signer's private key
      const relayTransactionHashToSign = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes", "uint", "uint", "string"],
          [
            //  txPayload.type,
            txPayload.to,
            txPayload.data,
            // txPayload.nonce,
            txPayload.gas,
            137,
            txPayload.schedule,
          ]
        )
      )
      // Sign the relay transaction hash
      const signature = await signer.signMessage(
        ethers.utils.arrayify(relayTransactionHashToSign)
      )
      const sentAtBlock = await itx.getBlockNumber()
      const { balance } = await itx.send("relay_getBalance", [signer.address])
      const matic = ethers.utils.formatEther(balance)
      console.log(`Current ITX balance: ${matic} MATIC`)
      // Relay the transaction through itx
      // Send the signed relay transaction hash to the network
      // with its transaction payload object and signature
      const { relayTransactionHash } = await itx.send("relay_sendTransaction", [
        txPayload,
        signature,
      ])
      console.log(`Your transaction is being mined...`)
      console.log(`ITX relay transaction hash: ${relayTransactionHash}`)
      console.log("You can check your transaction at:")
      console.log(`https://polygonscan.com/tx/${relayTransactionHash}\n`)

      const txReceipt = await waitForTransaction(
        relayTransactionHash,
        sentAtBlock,
        itx
      )

      // Return the transaction receipt
      return txReceipt
    }
  } catch (error) {
    console.log(`Error in handleCallTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleCallTx
