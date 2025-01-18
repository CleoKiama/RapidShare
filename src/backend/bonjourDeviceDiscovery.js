import bonjour from "bonjour";
import updateUi from "./updateUi.js";
import { ipcMain } from "electron";
import { platform } from "os";
import thisMachineAddress from "./currentAssignedAddress.js";

class BonjourDeviceDiscovery {
	constructor() {
		this.foundDevices = { devices: [] };
		this.browser = bonjour().find(
			{
				type: "http",
			},
			(service) => {
				const deviceInfo = {
					...service.txt,
					port: service.port,
				};
				this.verifyDevices(deviceInfo);
			},
		);
		this.monitorDevices();
		this.returnToUi();
	}
	getFoundDevices() {
		return this.foundDevices;
	}
	start() {
		this.browser.start();
	}
	stop() {
		this.browser.stop();
	}
	verifyDevices(deviceInfo) {
		//INFO: I have set loopback to false in the bonjour publish method but on windows it still its own address thus this check below
		if (platform() === "win32" && deviceInfo.address === thisMachineAddress())
			return;
		if (this.addDevice(deviceInfo)) updateUi.updateDevices(this.foundDevices);
	}
	addDevice(deviceInfo) {
		for (const device of this.foundDevices.devices) {
			if (device.address === deviceInfo.address) return false;
		}
		this.foundDevices.devices.push(deviceInfo);
		return true;
	}
	removeDevice(offlineDevice) {
		let onlineDevices = this.foundDevices.devices.filter(
			(device) => offlineDevice.address !== device.address,
		);
		this.foundDevices.devices = onlineDevices;
		updateUi.updateDevices(this.foundDevices);
	}
	monitorDevices() {
		this.browser.on("down", (service) => {
			if (
				platform() === "win32" &&
				service.txt.address === thisMachineAddress()
			) {
				return;
			}
			this.removeDevice(service.txt);
		});
	}
	returnToUi() {
		ipcMain.handle("currentDevices", () => {
			return this.foundDevices;
		});
	}
}

export default new BonjourDeviceDiscovery();
