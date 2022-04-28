const ethers = require("ethers")
const waitForTransaction = require("../utils/waitForTransaction")
  
  const handleSendTx = async ({
    signer,
    txType,
    receiverAddress,
    amount,
    nonce,
    itx
  }) => {
    try {
      // For type 1 transaction
      if (txType === "1") {
        // Type 1 (legacy) transaction payload object for MATIC transfer
        const txPayload = {
          type: 1,
          to: receiverAddress,
          value: amount,
          nonce: nonce,
          gasLimit: 21000, // default gaslimit for MATIC transfer
          schedule: "fast"
        }
      // Sign a relay request using the signer's private key
      const relayTransactionHashToSign = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint", "address", "uint", "uint", "uint", "string"],
          [
            txPayload.type,
            txPayload.to,
            txPayload.value,
            txPayload.nonce,
            txPayload.gasLimit,
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
      const { relayTransactionHash } = await itx.send("relay_sendTransaction", [
        txPayload,
        signature,
      ])
      console.log(
        "Your transaction is being mined"
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
        // Type 2 (EIP-1559) transaction payload object for MATIC transfer
        const txPayload = {
          type: 2,
          to: receiverAddress,
          value: amount,
          nonce: nonce,
          gasLimit: 21000, // default gaslimit for MATIC transfer
          schedule: "fast"
        }
  
      // Sign a relay request using the signer's private key
      const relayTransactionHashToSign = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint", "address", "uint", "uint", "uint", "string"],
          [
            txPayload.type,
            txPayload.to,
            txPayload.value,
            txPayload.nonce,
            txPayload.gasLimit,
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
      const { relayTransactionHash } = await itx.send("relay_sendTransaction", [
        txPayload,
        signature,
      ])
      console.log(
        "Your transaction is being mined"
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
    } catch (error) {
      console.log(`Error in handleSendTx: ${error}`)
      process.exit(1)
    }
  }
  
  module.exports = handleSendTx