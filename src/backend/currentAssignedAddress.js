import { networkInterfaces, platform } from "os";

var getWifiAddress = () => {
  if (platform() === "linux") {
    return networkInterfaces()["wlo1"][0].address;
  } else return networkInterfaces()["Wi-Fi"][0].address;

}

var getEthAddress = () => {
  return networkInterfaces()/*['eth0'] [0].address */
}

//throws an error when not connected to wifi or etharnet handle such cases
//of poll till a wifi connection is established
export default function thisMachineAddress() {
  //!consider cases for the ethernet cable
  return getWifiAddress()
  // return getEthAddress()
}


