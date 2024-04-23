import React from 'react'
import { render } from "@testing-library/react"
import { EventEmitter } from "node:events"
import App from "../app.jsx"
import os from 'os'
import c from 'ansi-colors'


test("renders the TransferFileProgress component on startTransfer", async () => {
  const transferMonitor = new EventEmitter()
  setTimeout(() => {
    transferMonitor.emit('transferring', {
      eventid: "1234142jIJ$%"
    }, true)
  }, 700)
  window.electron = {
    on: (channel, callback) => {
      transferMonitor.on(channel, callback)
    },
    removeListener: (channel, callback) => {
      transferMonitor.removeListener(channel, callback)
    },
    async invoke(channel) {
      if (channel === 'thisDevice') {
        return {
          type: os.type(),
          userInfo: os.userInfo(),
        }
      }
      return { devices: [] }
    }

  }
  let thisDeviceSpy = jest.spyOn(window.electron, 'invoke')
  const { findByText } = render(<App />)
  const statusMessage = await findByText(/sending files/, {
    timeout: 950
  })
  expect(thisDeviceSpy).toHaveBeenCalledWith('thisDevice')
  expect(statusMessage).toBeInTheDocument()
})

test("reverts  back the ui once the the transfer of files is done", async () => {
  const transferMonitor = new EventEmitter()
  setTimeout(() => {
    transferMonitor.emit('transferring', {
      eventid: "1234142jIJ$%"
    }, false)
  }, 900)

  setTimeout(() => {
    transferMonitor.emit('transferring', {
      eventid: "1234142jIJ$%"
    }, true)
  }, 700)
  window.electron = {
    on: (channel, callback) => {
      transferMonitor.on(channel, callback)
    },
    removeListener: (channel, callback) => {
      transferMonitor.removeListener(channel, callback)
    },
    async invoke(channel) {
      if (channel === 'thisDevice') {
        return {
          type: os.type(),
          userInfo: os.userInfo(),
        }
      }
      return { devices: [] }
    }
  }
  let thisDeviceSpy = jest.spyOn(window.electron, 'invoke')
  const { findByText } = render(<App />)
  const statusMessage = await findByText(/sending files/, {
    timeout: 800
  })
  expect(statusMessage).toBeInTheDocument()
  await new Promise(resolve => setTimeout(resolve, 1000))
  expect(thisDeviceSpy).toHaveBeenCalledWith('thisDevice')
  expect(statusMessage).not.toBeInTheDocument()
})

