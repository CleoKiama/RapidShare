import React from 'react'
import App from '../app.jsx'
import { render } from '@testing-library/react'
import { EventEmitter } from "node:events"
import os from 'os'
import userEvent from '@testing-library/user-event'
import { setTimeout as setTimeoutPromise } from 'node:timers/promises'


test('cancels the transfer of files', async () => {
  let ipcHandleSpy = jest.fn(async () => {
    console.log('canceling')
    return
  })
  const user = userEvent.setup()
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
      } else if (channel === 'cancelTransfer') {
        return ipcHandleSpy()
      }
      return { devices: [] }
    }

  }
  const { findByText } = render(<App />)
  let initCancelBtn = await findByText('Cancel')
  expect(initCancelBtn).toBeInTheDocument()
  await user.click(initCancelBtn)
  let confirmDeleteBTN = await findByText("Yes, Cancel Transfer")
  expect(confirmDeleteBTN).toBeInTheDocument()
  await user.click(confirmDeleteBTN)
  expect(ipcHandleSpy).toHaveBeenCalled()
})

test('attaches the listener to revert back the ui after a cancel', async () => {
  let ipcHandleSpy = jest.fn(async () => {
    console.log('canceling')
    return
  })
  const user = userEvent.setup()
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
      } else if (channel === 'cancelTransfer') {
        return ipcHandleSpy()
      }
      return { devices: [] }
    }

  }
  const { findByText, findByAltText } = render(<App />)
  const initCancelBtn = await findByText('Cancel')
  await user.click(initCancelBtn)
  let confirmDeleteBTN = await findByText("Yes, Cancel Transfer")
  await user.click(confirmDeleteBTN)
  const arrowBack = await findByAltText('navigate back')
  expect(arrowBack).toBeInTheDocument()
  setTimeout(() => {
    transferMonitor.emit('transferring', {
      eventid: "1234142jIJ$%"
    }, true)
  }, 700)
  await setTimeoutPromise(1000)
  expect(arrowBack).not.toBeInTheDocument()
})
