import { server, service as publishedService } from "../backend/transferInterface.js";
import { setTimeout as setTimeoutPromise } from 'timers/promises'
import { browser } from "../backend/bonjourDeviceDiscovery.js";

jest.mock("../backend/currentAssignedAddress.js", () => {
  return {
    __esModule: true,
    default: () => {
      return 'localhost'
    }
  }
})

beforeAll((done) => {
  publishedService.stop()
  browser.stop()
  done()
})

afterAll((done) => {
  publishedService.stop()
  browser.stop()
  server.close(done)
})

test("it discovers services published on the local network", async () => {
  let onDevice = jest.fn((service) => {
    console.log(service)
  })
  browser.on('up', onDevice)
  // browser.update()
  await setTimeoutPromise(300)
  expect(onDevice).toHaveBeenCalled()
})
