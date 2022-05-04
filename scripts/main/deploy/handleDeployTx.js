const ethers = require("ethers")
const waitForTransaction = require("../utils/waitForTransaction")

const handleDeployTx = async ({
  signer,
  txType,
  nonce,
  metadata,
  arrayOfArgs,
  itx,
}) => {
  let gasLimit
  const chainID = "137"
  try {
    const factory = new ethers.ContractFactory(
      metadata.abi,
      metadata.bytecode,
      signer
    )
    const deployTransactionData = await factory.getDeployTransaction(
      ...arrayOfArgs
    ).data

    // For type 1 transaction
    if (txType === "1") {
      // Get the estimated gas limit for this tx payload
      const gasLimit = await itx.estimateGas({
        to: ethers.constants.AddressZero,
        data: deployTransactionData,
        type: 1,
        nonce: nonce,
        gasLimit: 14_999_999, // polygon transaction limit
      })
      // Transaction payload object with your encoded estimated gas limit
      const txPayload = {
        to: ethers.constants.AddressZero,
        data: deployTransactionData,
        // type: 1,
        // nonce: nonce,
        gas: gasLimit,
        schedule: "fast",
      }
      // Sign a relay request using the signer's private key
      const relayTransactionHashToSign = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes", "uint", "uint", "uint", "string"],
          [
            txPayload.to,
            txPayload.data,
            txPayload.type,
            txPayload.nonce,
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

      // Deploy the contract with the arguments passed by the user
      //const contract = await factory.deploy(...arrayOfArgs, txPayload)

      // Send the signed relay transaction hash to the network
      // with its transaction payload object and signature
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
      // Return the transaction Receipt
      return txReceipt
    }

    // For type 2 transaction
    if (txType === "2") {
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
    console.log(`Error in handleDeployTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleDeployTx
