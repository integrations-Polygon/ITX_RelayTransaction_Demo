async function waitForTransaction(relayTransactionHash, sentAtBlock, itx) {
  let mined = false
  while (!mined) {
    const { broadcasts } = await itx.send("relay_getTransactionStatus", [
      relayTransactionHash,
    ])
    //check each of these hashes to see if their receipt exists and has confirmed
    if (broadcasts) {
      for (const broadcast of broadcasts) {
        const { txHash } = broadcast
        const txReceipt = await itx.getTransactionReceipt(txHash)
        if (
          txReceipt &&
          txReceipt.confirmations &&
          txReceipt.confirmations > 1
        ) {
          // The transaction is now on chain
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
}

module.exports = waitForTransaction
