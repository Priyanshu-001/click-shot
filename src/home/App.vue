<script setup>
import { VApp, VMain, VContainer, VBtn, VDialog,VRow, VAlert,VAlertTitle, VSnackbar, VFooter, VIcon, VDivider } from 'vuetify/components';
import NoteCard from './components/NoteCard.vue';
import { ref, computed } from 'vue';
import FilterOptions from './components/FilterOptions.vue';
import { useNotes } from './composables/useNotes';
import useClipBoard from './composables/useClipboard';
import BigList from './components/BigList.vue'
import NoNotesAvailable from './components/NoNotesAvailable.vue';


const showSnackBar = ref(false)
const snackBarMsg = ref('')
const sendAlert = msg=>{
  showSnackBar.value = true
  snackBarMsg.value = msg
}

const links = [ 
  { link: "https://clickshot-site.netlify.app/", text: "Website",  icon: "mdi-link"},
  {link: "https://forms.gle/VPrYQRz9StnmV6F78", text: "Bugs/Feedback", icon: "mdi-bug"},
]
const {copyNote, copyNotesBulk } = useClipBoard()
const copy = note=>{
  
   const isSuccess = copyNote(note)
   if(isSuccess) {
    sendAlert("Note Copied !!")
   }else {
    sendAlert("Error copying note.")
   }
  
}
const allowedSites = ref([])
const allowedVideoIds = ref([])
const query = ref({})
const activeIndex = ref()
const dialog = computed({
  get() {
    return activeIndex.value != null
  },
  set(val) {
    if (!val) {
      activeIndex.value = null
    }
  }
})


const {notes, loading, deleteNote, reload, editNote} = useNotes(query)

const moveRef = nextRef=>{
 activeIndex.value = nextRef
} 

const idToTitle = computed ( ()=>notes.value?.reduce((acc, note) => {
  acc[note.video.id] = note.video.title;
  return acc;
}, {}));

const editActiveNote = async (id, description) =>{
  try {
    moveRef()
   await editNote(id, {description})
    sendAlert("Edit completed sucessfully")
  } catch(err) {
    console.error(err)
    sendAlert("Error while editing")
  } finally {
    reload()
  }
}
const sites = computed(()=>[...new Set( notes.value?.map(note=>note.site))])

const filteredNotes = computed(()=>{
  return notes.value.filter(note => {
    const siteOk =
      !allowedSites.value.length ||
      allowedSites.value.includes(note.site)

    const videoOk =
      !allowedVideoIds.value.length ||
      allowedVideoIds.value.includes(String(note.video?.id))

    return siteOk && videoOk
  })
})

const activeId = computed(()=> activeIndex.value===null ? null : filteredNotes.value[activeIndex.value]?.id)
const deleteActiveNote = async id=>{
  console.debug(activeId.value)
  if(!id) {
    return
  }
 try { 
  moveRef()
  await deleteNote(id)
  sendAlert("Note Deleted")
 } catch(err) {
  console.error(err)
  sendAlert("Error deleting note")
 } finally {
  reload()
 }
}

const handleFilterUpdate = ({selectedVideoIds, selectedSites}) =>{
  allowedSites.value = selectedSites
  allowedVideoIds.value = selectedVideoIds
}

const handleBulkOp = async (operation, selected)=>{
  console.debug(selected)
  const selectedNotes = filteredNotes?.value.filter(note=>selected.has(note.id))
  const success = await copyNotesBulk(selectedNotes)
  if(success) {
    sendAlert(`${selectedNotes.length} notes copied !!`)
  } else {
    sendAlert("Error copying notes")
  }
  await reload()

}

</script>

<template>
  <v-app>
    <v-main>
      <v-container class="d-flex justify-center"><h2 class="text-h1">ClickShot</h2></v-container>
       <v-container>
        
      <filter-options 
      :sites="sites"
      :idToTitle="idToTitle"
      @filter-update="handleFilterUpdate"
      :loading="loading"
      />
      </v-container>
   
    <v-container>
      <v-row class="d-flex align-center">
        <h2>Showing {{ filteredNotes.length }} notes </h2>
        <v-btn icon="mdi-reload" variant="text" @click="reload"/>
       </v-row>
       <v-row class="mb-3">
          <v-alert type="info"
          variant="tonal"
          icon="mdi-cloud"
          closable
          >
      <v-alert-title>Don't forget to backup</v-alert-title>
      Please backup to app like onenote/notion to read from multiple device and have better safety. You will lose notes if extension is deleted, or any bug causes issues.
    </v-alert> 
       </v-row>
      <v-row>
        <big-list 
        v-show="filteredNotes.length !== 0"
        :notes="filteredNotes" 
        :loading="loading"
        @show-card="moveRef" 
        @copy="()=>sendAlert('Note Copied sucessfully !!')"
        @bulk-op="handleBulkOp"
        />
      <no-notes-available v-if="notes.length === 0"/>
      
      </v-row>
      </v-container>
    </v-main>
 <v-footer class="d-flex align-center justify-center ga-2 flex-wrap flex-grow-1 py-3" color="surface-light">

  


   
         <v-btn 
      v-for="link in links"
      :href="link.link"
      
      :key="link.link"
      :text="link.text"
      :prepend-icon="link.icon"
      variant="text"
      rounded
    ></v-btn>

     <div class="flex-1-0-100 text-center mt-2">
     ClickShot <strong>V0.9.1</strong>
    </div>
 
</v-footer>

      <v-dialog
      v-model="dialog"
      max-width="68vw"
    >
        <note-card
          :index="activeIndex"
          :total-index="filteredNotes.length"
          :note="filteredNotes[activeIndex]"
          @delete="deleteActiveNote"
          @edit="editActiveNote"
          @move="moveRef"
          @close="moveRef"
        />
    </v-dialog>
      <v-snackbar v-model="showSnackBar" timeout="3000" dark>

        {{ snackBarMsg }}
           <template v-slot:actions>
        <v-btn
          color="pink"
          variant="text"
          @click="showSnackBar = false"
        >
          Close
        </v-btn>
        </template>
     </v-snackbar>
  </v-app>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.logo.crx:hover {
  filter: drop-shadow(0 0 2em #f2bae4aa);
}

.underline-ltr {
  position: relative;
  display: inline-block;
}

.underline-ltr::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}

.underline-ltr:hover::after {
  transform: scaleX(1);
}
</style>
