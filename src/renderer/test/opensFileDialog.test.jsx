import userEvent from '@testing-library/user-event'
import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import DiscoveredDevices from '../components/discoveredDevices.jsx'
import { EventEmitter } from 'node:events'


test('handles the file send button click', async () => {
  const foundDevices = {
    devices: [
      {
        uid: 1000,
        gid: 1000,
        username: 'cleo',
        homedir: '/home/cleo',
        shell: 'bin/bash',
        address: '192.168.0.103',
        port: 3000,
        platform: 'Linux',
      },
    ],
  }

  const openFileDialog = jest.fn(async (address, type) => {
    return new Promise((done) => {
      setTimeout(() => {
        done()
      }, 400)
    })
  })
  const user = userEvent.setup()
  const ipcRenderer = {
    invoke: async (handler, address, type) => {
      if (handler === 'dialog:openFile')
        return await openFileDialog(address, type)
    },
  }
  const device = new EventEmitter()
  window.electron = {
    on: (channel, callback) => {
      device.on(channel, callback)
    },
    removeListener: (channel, fn) => {
      device.removeListener(channel, fn)
    },
    async invoke() {
      return foundDevices
    },
    openFileDialog: (address, type) => ipcRenderer.invoke('dialog:openFile', address, type)
  }
  const { getByText, findByAltText } = render(<DiscoveredDevices />)
  await act(async () => {
    device.emit(
      'deviceFound',
      {
        eventId: '79374375835730',
      },
      foundDevices
    )
  })
  const deviceToClick = await findByAltText(/logo/)
  await act(async () => {
    await user.click(deviceToClick)
  })
  let fileDialogOpenner = await getByText("file")
  await waitFor(() => {
    expect(fileDialogOpenner).toBeInTheDocument()
  })
  await act(async () => {
    await user.click(fileDialogOpenner)
  })
  expect(openFileDialog).toHaveBeenCalledWith('192.168.0.103', 'file')
  fileDialogOpenner = await getByText("folder")
  await user.click(fileDialogOpenner)
  expect(openFileDialog).toHaveBeenCalledWith('192.168.0.103', 'file')
})

