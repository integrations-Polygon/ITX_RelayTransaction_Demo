const ps = require("prompt-sync")
const prompt = ps()
const send = require("./main/send/send")
const deploy = require("./main/deploy/deploy")
const call = require("./main/call/call")
const deposit = require("./main/deposit/deposit")
// const redisDB = require("./main/utils/redisDB")
const saveReceipt = require("./main/utils/saveReceipt")
const dataMapping = require("./main/utils/dataMapping")

async function startTransaction() {
  let txReceipt

  console.log("\nStarting the transaction process\n")
  console.log("INFURA ITX DEMO-------------------------------------\n")
  console.log("Select a transaction process to proceed:-")
  console.log("1. Deposit MATIC tokens to itx gas tank.")
  console.log("2. Deploy your smart contract.")
  console.log("3. Call a function of deployed smart contract.")
  console.log("4. Send MATIC tokens to a receiving account address.\n")
  const choice = prompt("Enter your choice: ")
  console.log("\n")
  if (!choice) return console.log("Choice cannot be null")
  if (choice !== "1" && choice !== "2" && choice !== "3" && choice !== "4")
    return console.log(`Transaction ${choice} is unsupported`)

  try {
    if (choice === "1") txReceipt = await deposit()
    if (choice === "2") txReceipt = await deploy()
    if (choice === "3") txReceipt = await call()
    if (choice === "4") txReceipt = await send()
    if (txReceipt !== null && txReceipt !== undefined) {
      // success transaction receipt gets mapped here
      console.log("txReceipt: ", txReceipt)
      const mappedReceipt = await dataMapping(txReceipt)

      // saves the mapped transaction receipt in local JSON log file
      await saveReceipt(mappedReceipt)

      // saves the transaction receipt in redisDB
      // await redisDB(mappedReceipt)
    }
    return
  } catch (error) {
    console.log(`Error at startTransaction: ${error}`)
  }
}

startTransaction()
  .then(() => {
    console.log("\nTransaction process has ended\n\n")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
