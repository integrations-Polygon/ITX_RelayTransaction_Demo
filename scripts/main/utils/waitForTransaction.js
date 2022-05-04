const sleep = require("./sleep")
async function waitForTransaction(relayTransactionHash, sentAtBlock, itx) {
  try {
    let mined = false
    console.log("\nStart of relay_getTransactionStatus\n")
    while (!mined) {
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
            console.log(
              `Generated transaction hash: ${txReceipt.transactionHash}`
            )
            console.log("You can check your transaction at:")
            console.log(
              `https://polygonscan.com/tx/${txReceipt.transactionHash}\n`
            )
            console.log(`Transaction sent at block: ${sentAtBlock}`)
            console.log(`Transaction mined in block: ${txReceipt.blockNumber}`)
            console.log(
              `Total number of blocks generated while mining: ${
                txReceipt.blockNumber - sentAtBlock
              }`
            )
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
