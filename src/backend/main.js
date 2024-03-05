import createMulticastListener from "./multicastListener.js";
import startBroadCaster from "./broadCast.js";


export default function Main () {
   try {
        createMulticastListener()
        startBroadCaster()
   }catch(error) {
     console.log(`something went wrong in the backend ${error.message}`)
   }
}