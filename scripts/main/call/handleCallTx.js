const ethers = require("ethers")
const waitForTransaction = require("../utils/waitForTransaction")

const handleCallTx = async ({
  signer,
  contractAddress,
  functionName,
  arrayOfArgs,
  iface,
  nonce,
  itx,
}) => {
  let gasLimit
  try {
    /* Encoding the function data retreived from the user, the parameters
     * has to be converted to strings if you are manually inputting the data
     * for it to pass the encoding process here my parameters are already string
     * but for the sake of the demo calling toString() on the function data
     */
    const encodedFunctionData = iface.encodeFunctionData(
      functionName.toString(),
      [...arrayOfArgs]
    )
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

    const txReceipt = await waitForTransaction(
      relayTransactionHash,
      sentAtBlock,
      itx
    )

    // Return the transaction receipt
    return txReceipt
  } catch (error) {
    console.log(`Error in handleCallTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleCallTx
