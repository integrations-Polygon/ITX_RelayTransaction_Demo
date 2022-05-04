const sleep = require("./sleep")
async function waitForTransaction(relayTransactionHash, sentAtBlock, itx) {
  try {
    let mined = false
    while (!mined) {
      console.log("Start relay_getTransactionStatusn\n")
      const statusResponse = await itx.send("relay_getTransactionStatus", [
        relayTransactionHash,
      ])
      //check each of these hashes to see if their receipt exists and has confirmed
      if (statusResponse.broadcasts) {
        for (let i = 0; i < statusResponse.broadcasts.length; i++) {
          const bc = statusResponse.broadcasts[i]
          const txReceipt = await itx.getTransactionReceipt(bc.ethTxHash)
          if (
            txReceipt &&
            txReceipt.confirmations &&
            txReceipt.confirmations > 1
          ) {
            mined = true
            console.log(`Transaction hash: ${txReceipt.transactionHash}`)
            console.log(`Sent at block ${sentAtBlock}`)
            console.log(`Mined in block ${txReceipt.blockNumber}`)
            console.log(`Total blocks ${txReceipt.blockNumber - sentAtBlock}`)
            return txReceipt
          }
        }
      }
      await sleep(2000)
    }
  } catch (error) {
    console.log("Error in waitForTransaction ", error)
    process.exit(1)
  }
}

module.exports = waitForTransaction
