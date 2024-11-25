import thisMachineAddress from "../backend/currentAssignedAddress.js";




test("get usable ip address", async () => {
  //INFO: make sure to connect to a network before running this test.
  const address = thisMachineAddress()
  const ipRegex = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
  expect(ipRegex.test(address)).toBe(true)
})

