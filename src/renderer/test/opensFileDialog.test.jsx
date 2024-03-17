import c from 'ansi-colors'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { render, waitFor } from '@testing-library/react'
import DiscoveredDevices from '../components/discoveredDevices.js'
import { EventEmitter } from 'node:events'
import { setTimeout as setTimeoutPromise } from 'node:timers/promises'


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

    const openFileDialog =  jest.fn(async (address) => {
        //expect(address).toMatch(foundDevices.devices[0].address)
        return new Promise((done) => {
            console.log('ready to send a file to address : ', address)
            setTimeout(() => {
                done()
            }, 400)
        })
    })
    const user = userEvent.setup()
    const ipcRenderer = {
        invoke: async (handler, address) => {
            if (handler === 'dialog:openFile')
                return await openFileDialog(address)
            return console.error(c.red('handler not found'))
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
        openFileDialog: (arg) => ipcRenderer.invoke('dialog:openFile',arg),
    }
    const { findByRole } = render(<DiscoveredDevices />)
    const uploadBtn = await findByRole('button')
    await waitFor(() => {
        expect(uploadBtn).toBeInTheDocument()
    })

    await user.click(uploadBtn)
     expect(openFileDialog).toHaveBeenCalled()
     await setTimeoutPromise(500)
     
})
