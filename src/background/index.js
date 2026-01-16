import { editNote, searchNotes } from "./persistance/note-db-service";
import { createNote, deleteNote } from "./video-note-manager";


console.debug("Background script running");
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "take-screenshot-note") {
    console.debug("Hotkey pressed (background script)");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_CAPTURE" });
  }
});


chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: 'https://clickshot-site.netlify.app/?atInstall=true'
    })
  }
})


chrome.runtime.onMessage.addListener(  (message, sender, sendResponse) => {
 ( async ()=> {if (message.action === "CAPTURED_POST_DATA") {
    const res = await captureHanlder(message)
    sendResponse(res)

  }
  if(message.action === 'DELETE_NOTE'){
    const res = await deleteHandler(message)
    sendResponse(res)

  }
  if(message.action === 'SEARCH_NOTES'){
    const res =  await searchNotesHandler(message)
    sendResponse(res)
  }

  if (message.action === "EDIT_NOTE")
  {
    const res = await editNoteHandler(message)
    sendResponse(res)
  }
})()
  return true;
});

async function captureHanlder(message) {
  try {
    const res = await createNote(message);
    return {success: true, ...res};
  } catch(error) {
    console.error(err)
    console.log(err)
    return {success: false}
  }
}

async function deleteHandler(message) {
  try {
  await deleteNote(message)
  return {success: true}
  } catch(err) {
    console.error(err)
    return {success: false}
  }
  
}

async function searchNotesHandler(message) {
  try {
  const notes = await searchNotes(message.query)
  return {success: true,notes}
  } catch (err) {
    console.error(error)
    return {success: false}
  }
}

async function editNoteHandler(message) {
  try {
  await editNote(message.patch)
  return {success: true}
  } catch(err) {
    console.error(err)
    return {success: false}
  }
}