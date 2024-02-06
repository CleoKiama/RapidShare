import dgram from "dgram";
import { userInfo, networkInterfaces, platform } from "os";
import c from "ansi-colors";
import { clearInterval } from "timers";
import EventEmitter from "events";


export const deviceDiscovery = new EventEmitter();

const udpSocket = dgram.createSocket("udp4");
const multicastAddress = "239.1.1.1";
const multicastAdrPort = 8080;
//const port = 4000;
const foundDevices = new Map();

const thisMachineAddress = function () {
  if (platform() === "linux") {
    return networkInterfaces()["wlo1"][0].address;
  }

  return networkInterfaces()["Wi-Fi"][0].address;
};

udpSocket.on("error", (error) => {
  console.error(error.message);
  udpSocket.close();
  process.exit(1);
});
function sendUserData(callback) {
  const user = JSON.stringify(userInfo());
  udpSocket.send(user, multicastAdrPort, multicastAddress, (error) => {
    if (error) {
      if (typeof callback === "function") callback();
      throw error;
    }
    if (typeof callback === "function") callback();
    console.log(c.green("message sent"));
  });
}
function broadCastDevice() {
  const broadCastInterval = setInterval(() => {
    if (foundDevices.size > 0) {
      clearInterval(broadCastInterval);
      console.log(`found some devices`);
      for (const value of foundDevices.entries()) {
        console.log(value);
      }
      return setTimeout(() => {
        udpSocket.close();
      }, 5000);
    }
    console.log(c.yellow("sending message"));
    sendUserData();
  }, 5000);
}

udpSocket.bind((error) => {
  if (error) {
    console.error(error.message);
    udpSocket.close();
  }
  udpSocket.addMembership(multicastAddress);
  const { address, port } = udpSocket.address();
  console.log(c.green(`receiver is listening on ${address}:${port}`));
  broadCastDevice();
});

udpSocket.on("message", (msg, rinfo) => {
  if (rinfo.address === thisMachineAddress()) return;
    const deviceFound = JSON.parse(msg.toString());
  console.log(c.yellow(`received message from ${rinfo.address}`));
  foundDevices.set(rinfo.address, {
    port: rinfo.port,
    username: deviceFound.username,
  });
  deviceDiscovery.emit("deviceFound", foundDevices);
});
