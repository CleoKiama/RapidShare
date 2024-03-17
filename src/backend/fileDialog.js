import { dialog } from "electron";



export default async function  HandleFileDialogLogic(address,browserWindow) {
    console.log(`opening file dialog to send file to ${address}`)
    const {filePaths}   = await dialog.showOpenDialog(browserWindow)
    console.log(filePaths)
}