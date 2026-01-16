import { ref, watch } from 'vue'

export function useNotes(queryRef) {
  const notes = ref([])
  const loading = ref(false)
  const refreshing = ref(false)

  async function load() {
    loading.value = true
    try {
      const response  = await getNotes(queryRef.value)
      if(!response.success) {
        alert("error loading notes")
      }
      notes.value = response.notes
    } finally {
      loading.value = false
    }
  }

  async function editNote(id, patch) {
    refreshing.value = true
    try {
      console.debug({id})
      const res =  await chrome.runtime.sendMessage ({
         action: "EDIT_NOTE",
         patch: {noteInfo:{id, ...patch}}
        })
        console.log("hrere")
      if(!res.success) {
        throw new Error("error while editing")
      }  
      await load()
    } finally {
      refreshing.value = false
    }
  }

  async function deleteNote(id) {
    refreshing.value = true
    try {
      const result = await discardNote(id)
      if(!result.success) {
        debugger;
        throw new Error("Deleteion not successful")
      }
    } finally {
      refreshing.value = false
    }
  }

  watch(queryRef, load, { immediate: true, deep: true })

  async function getNotes(query) {
     return await chrome.runtime.sendMessage ({
         action: "SEARCH_NOTES",
         query 
        })
  }

async function discardNote(noteId){
  console.debug(noteId)
      return await chrome.runtime.sendMessage({
        action: "DELETE_NOTE",
        noteId
    })
}
    
  return {
    notes,
    loading,
    refreshing,
    editNote,
    deleteNote,
    reload: load
  }
}
