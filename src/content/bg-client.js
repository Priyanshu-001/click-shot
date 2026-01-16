
async function sendCaputredPost({noteId, data, stage}){
   const res = await chrome.runtime.sendMessage ({
        action: "CAPTURED_POST_DATA",
        stage,
        noteId,
        data
    })
    return res;
}  

async function deleteNote(noteId){
    return await chrome.runtime.sendMessage ({
         action: "DELETE_NOTE",
        noteId
        })
}

export { sendCaputredPost, deleteNote };