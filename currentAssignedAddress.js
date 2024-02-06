import { networkInterfaces, platform } from "os";

export default function thisMachineAddress() {
  //!consider cases for the ethernet cable
  if (platform() === "linux") {
    return networkInterfaces()["wlo1"][0].address;
  }

  return networkInterfaces()["Wi-Fi"][0].address;
}
