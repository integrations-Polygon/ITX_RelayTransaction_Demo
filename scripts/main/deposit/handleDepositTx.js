const {
  fetchGasPriceLegacy,
  fetchGasPriceEIP1559,
} = require("../utils/fetchData")

const handleDepositTx = async ({ signer, nonce, amount, itx }) => {
  try {
    // Fetch the latest gas price data from the polygon v2 gas station API
    const type2GasData = await fetchGasPriceEIP1559()

    if (type2GasData === undefined) {
      console.log("Error in type2GasData")
      process.exit(1)
    }

    // Get the maxFee and maxPriorityFee for fast
    let maxFeeInGWEI = type2GasData.fast.maxFee
    let maxPriorityFeeInGWEI = type2GasData.fast.maxPriorityFee

    /* Convert the fetched GWEI gas price to WEI after converting ignore the decimal value
     * as the transaction payload only accepts whole number
     */
    const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9)
    const maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9)

    const gasLimit = await itx.estimateGas({
      type: 2,
      to: "0x015C7C7A7D65bbdb117C573007219107BD7486f9",
      nonce: nonce,
      value: amount,
      gasLimit: 14_999_999, // polygon transaction limit
      maxFeePerGas: maxFee,
      maxPriorityFeePerGas: maxPriorityFee,
    })

    // Transaction payload object with your encoded function data & estimated gas limit
    const txPayload = {
      type: 2,
      to: "0x015C7C7A7D65bbdb117C573007219107BD7486f9",
      nonce: nonce,
      value: amount,
      gasLimit: gasLimit,
      maxPriorityFeePerGas: maxPriorityFee,
      maxFeePerGas: maxFee,
    }

    // Sign the transaction and send it to the network with its payload object
    const tx = await signer.sendTransaction(txPayload)
    console.log(
      `Your transaction is being mined and the gas price being used is ${maxFeeInGWEI} GWEI`
    )

    // Return the transaction data
    return tx
  } catch (error) {
    console.log(`Error in handleDepositTx: ${error}`)
    process.exit(1)
  }
}

module.exports = handleDepositTx
