import { firstCheck, findDeath } from "./firstCheck.js"
import { finalCheck, confirmIfDead} from './finalCheck.js'

try {
    findDeath();
    finalCheck();
} catch (e) {
    console.log(e.message);
}

    //async function createTestJSON(raw) {
    //     let dl = [,"chuganwang.com","carlightstore.com","tnsvoronezh.ru", "fcspam.ru", "YourGameGuy.com", "CanadaGoose-Jackets.org.uk","MichaelKorsOnline.ca",
    //     "nao-stroy.ru",
    //     "StampProject.it",
    //     "usacheapnfljerseysbiz.com",
    //     "yazdhistory.com",
    //     "CanadaGooseOutletStore.ca",
    //         "wsland.cn",
    //         "Brenda-RossRealty.org",
    //         "AllJordan.xyz",
    //         "Teach-Sports.com",
    //         "Black-Tip.top",
    //         "druskabydaisy.com",
    //         "JazzWorld.ch",
    //         "Milk.xyz",
    //         "ra3e.com"]
    //     let a = [];
    //     for (let i = 0; i < dl.length; i ++) {
    //         let o = await confirmIfDead(dl[i], 1);
    //         if (o) a.push(o);
    //     }
       
    //     import('fs').then(fs => {
    //         fs.writeFileSync('./test.json', JSON.stringify(a));
    //     });
    
    // }
