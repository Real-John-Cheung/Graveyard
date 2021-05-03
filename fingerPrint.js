import SHA256 from "crypto-js/sha256.js"
import encoder from "crypto-js/enc-hex.js"
function createFingerPrint(input) {
    let hash = SHA256(input);
    return hash.toString(encoder);
}

export default createFingerPrint