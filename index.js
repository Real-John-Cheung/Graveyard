import createFingerPrint from "./fingerPrint.js"
import { isOnlineNow } from "./findDeadSite.js"

console.log(await isOnlineNow("https://www.google.com"));