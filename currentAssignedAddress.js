import { networkInterfaces, platform } from "os";

export default function thisMachineAddress() {
    if(process.env.NODE_ENV === "test"){
        // localhost
        return "127.0.0.1"
    }
  //!consider cases for the ethernet cable
  if (platform() === "linux") {
    return networkInterfaces()["wlo1"][0].address;
  } else networkInterfaces()["Wi-Fi"][0].address;
  
}
