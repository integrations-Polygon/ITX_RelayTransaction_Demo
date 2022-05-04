const ethers = require("ethers")
const waitForTransaction = require("../utils/waitForTransaction")

const handleDeployTx = async ({ signer, metadata, arrayOfArgs, itx }) => {
  let gasLimit
  try {
    const factory = new ethers.ContractFactory(
      metadata.abi,
      metadata.bytecode,
      signer
    )
    const deployTransactionData = await factory.getDeployTransaction(
      ...arrayOfArgs
    ).data

    // Get the estimated gas limit for this tx payload
    gasLimit = await itx.estimateGas({
      data: deployTransactionData,
      gasLimit: 14_999_999, // polygon transaction limit
    })
    // Transaction payload object with your encoded estimated gas limit
    const txPayload = {
      to: ethers.constants.AddressZero,
      data: deployTransactionData,
      gas: gasLimit.toString(),
      // "fast" and "slow" supported
      schedule: "fast",
    }

    // Generate an encoded relay transaction hash
    const relayTransactionHashToSign = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "bytes", "uint", "uint", "string"],
        [
          txPayload.to,
          txPayload.data,
          txPayload.gas,
          137, // Polygon matic chain ID
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
    console.log("\n\nStart of relay_sendTransaction\n")
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
    console.log(`Error in handleDeployTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleDeployTx
