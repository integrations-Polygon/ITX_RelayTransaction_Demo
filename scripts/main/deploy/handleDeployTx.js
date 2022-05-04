const ethers = require("ethers")
const waitForTransaction = require("../utils/waitForTransaction")

const handleDeployTx = async ({
  signer,
  nonce,
  metadata,
  arrayOfArgs,
  itx,
}) => {
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
      type: 2,
      data: deployTransactionData,
      nonce: nonce,
      gasLimit: 14_999_999, // polygon transaction limit
    })
    // Transaction payload object with your encoded estimated gas limit
    const txPayload = {
      // type: 2,
      to: ethers.constants.AddressZero,
      data: deployTransactionData,
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

    // Relay the transaction through itx
    const sentAtBlock = await itx.getBlockNumber()

    // Deploy the contract with the arguments passed by the user
    //const contract = await factory.deploy(...arrayOfArgs, txPayload)

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
    console.log(`Error in handleDeployTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleDeployTx
