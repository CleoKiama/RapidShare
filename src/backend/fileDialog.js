import { dialog } from "electron";


export default async function HandleFileDialogLogic(address, type, browserWindow) {
  //TODO if the dialog is cancelled ,the promise returns undefined
  if (type === 'folder') {
    const { filePaths } = await dialog.showOpenDialog(browserWindow, {
      properties: ['openDirectory', "showHiddenFiles"],
      title: "select folder to send",
      buttonLabel: "send"
    })

    console.log(filePaths)
  } else {
    const { filePaths } = await dialog.showOpenDialog(browserWindow, {
      properties: ["showHiddenFiles", "openFile"],
      title: "select file to send",
      buttonLabel: "send"
    })
    console.log(filePaths)
  }
}
