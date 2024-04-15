import c from 'ansi-colors'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { render, waitFor } from '@testing-library/react'
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
      console.log(`ready to send a ${type} to address : `, address)
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
      else return console.error('no handler assigned')
    },
  }
  const device = new EventEmitter()
  setTimeout(() => {
    device.emit(
      'deviceFound',
      {
        eventId: '79374375835730',
      },
      foundDevices
    )
  }, 200)

  window.electron = {
    on: (channel, callback) => {
      device.on(channel, callback)
    },
    removeListener: (channel, fn) => {
      device.removeListener(channel, fn)
    },
    openFileDialog: (address, type) => ipcRenderer.invoke('dialog:openFile', address, type),
  }
  const { getByText, findByAltText } = render(<DiscoveredDevices />)
  const deviceToClick = await findByAltText(/logo/)
  await user.click(deviceToClick)
  let fileDialogueOpennner = await getByText("file")
  await waitFor(() => {
    expect(fileDialogueOpennner).toBeInTheDocument()
  })
  await user.click(fileDialogueOpennner)
  expect(openFileDialog).toHaveBeenCalledWith('192.168.0.103', 'file')
  fileDialogueOpennner = await getByText("folder")
  await user.click(fileDialogueOpennner)
  expect(openFileDialog).toHaveBeenCalledWith('192.168.0.103', 'file')

})

