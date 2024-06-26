import dgram from "dgram";
import c from "ansi-colors";
import { userInfo } from "os";
import thisMachineAddress from "./currentAssignedAddress.js";
import { foundDevices } from "./broadCast.js";
//returns the multicast server for clean up and closing
const bindingPort = 8080;
const multicastAddress = "239.1.1.1";

export default function createMulticastServer() {
  const server = dgram.createSocket("udp4");

  server.on("error", (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });

  server.bind(bindingPort, () => {
    server.addMembership(multicastAddress);
    server.setMulticastTTL(128);
    server.setMulticastLoopback(true);
    let { address, port } = server.address();
    console.log(
      c.green(
        `multicast server listening to multicast group on adr : ${address}  port : ${port}`
      )
    );
  });

  server.on("message", (msg, rinfo) => {
    if (rinfo.address === thisMachineAddress()) return;
    const defaultPeerPort = 3000;
    console.log(c.blue(`received message from multicast: ${msg}`));
    console.log(c.yellow(`adr ${rinfo.address} : port => ${rinfo.port}`));
    console.log(c.magenta(`sending back a reply...`));
    const thisDeviceDetails = JSON.stringify(userInfo());
    const deviceFound = JSON.parse(msg.toString());
    const deviceFoundDetails = {
      ...deviceFound,
      address: rinfo.address,
      port: defaultPeerPort,
    };
    if (!foundDevices.has(rinfo.address))
      foundDevices.set(rinfo.address, deviceFoundDetails);
    server.send(thisDeviceDetails, rinfo.port, rinfo.address, (error) => {
      if (error) {
        console.error(c.red(`error echoing back a response  ${error.message}`));
      }
    });
  });
  return server;
}

export { bindingPort, multicastAddress };
