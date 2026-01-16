import { normalize } from "../../utils/platform-key-normalizer";

const content = `
<style>
.overlay {
  color: white;  
  display: flex;
  position: absolute;
  inset: 0;
  font-color: white;  
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease, visibility 0.2s ease;
    visibility: hidden;
  display: none;
}
/* Textarea border */
.right textarea {
  border: 1px solid rgba(255, 255, 255, 0.12);
  outline: none;
}

.overlay.open {
    display: flex;
    visibility: visible;
    pointer-events: auto;
}

.modal {
  background: #212121;
  width: 60vw;
  min-height: fit-content;
  height: 75vh;
  max-width: 95%; 
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
   display: grid;
  grid-template-rows: max-content  1fr max-content; /* header, content, footer */
  font-family: system-ui, sans-serif;
}

.header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.video-title {
   font-weight: 600;
  font-size: 2rem;

}

.note-id {
  font-style: italic;
  font-size: 1rem;
  color: white;
}

.content {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  align-items: flex-start;
  margin:10px;
}

@media (max-width: 768px) {
  .content {
    flex-direction: row;
  }
}

.left {
flex: 35;
}

.right{
  flex: 65;
  height: 100%;
}

.left img {
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: #f2f2f2;
   box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}

.timestamp {
  margin-top: 6px;
  font-size: 13px;
}

.timestamp a {
  color: #2563eb;
  text-decoration: none;
}

.right textarea {
  width: 100%;
  height: 95%;
  resize: none;
  padding: 8px;
  font-family: inherit;
}

.footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

button {
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
}

button.primary {
  background: #2563eb;
  color: white;
  border: 2px;
  border-color: blue;
  width: 50%;
}

button.ghost {
  background: transparent;
  border: 1px solid #ddd;
  width:50%;
  color:white
}
  .pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  background: #f1f5f9; /* slate-100 */
  color: #334155;      /* slate-700 */
  border: 1px solid #e2e8f0;
}

.pill.success {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.pill a {
  color: inherit;
  text-decoration: none;
}
  .hidden{
  display:none;
  }
  
  #description {
    background: #212121;
      color: white;
  }
  
  .block {
  display: inline-block;
  margin-top: 4px;
  padding: 4px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
           /* dark slate */
  color: #e5e7eb;                 /* light gray */
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.12);
  letter-spacing: 0.3px;
}
  .header,
.footer {
  border-color: rgba(255, 255, 255, 0.08);
}

  </style>

<div class="overlay" id="overlay">
  <div class="modal">

    <!-- HEADER -->
    <div class="header">
       <div class="video-title" id="videoTitle">Video Name</div>
       <br/>
       <span>
        <span class="pill success" id="linkGenerationSucess">🔗 Timestamp Link generated</span>
        <span class="pill" id="linkGenerationFailure">❌ Timestamp Link not generated</span>
        </span>
    </div>

    <!-- CONTENT GRID -->
    <div class="content">
      <!-- LHS -->
      <div class="left">
        <img id="screenshot" src="https://images.unsplash.com/5/unsplash-kitsune-4.jpg?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=bc01c83c3da0425e9baa6c7a9204af81" />

        </div>

      <!-- RHS -->
      <div class="right">

        <textarea
          id="description"
          placeholder="Add revision notes here..."
        ></textarea>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
     <button id="saveBtn" class="primary">
        Save
         <br/>
        <div class="block" id="saveBtnText">
          [ CTRL/CMD + ENTER ]
        </div>
      </button>
      <button id="discardBtn" class="ghost">
        Discard
         <br/>
        <div class="block" id="discardBtnText">
          [ ALT + D ]
        </div>
      </button>
    </div>

  </div>
</div>
`
const state = {
    isShown: false,
    shadowRoot: null,
    modalRoot: null,
    lastFocusedElement: null,
    keyDownListenerOnModalPopup: {},
    onSave: () => {},
};

const handleTextareaKeydown = async e => {
      console.debug("Keydown event in textarea:", e);
       const isSubmitShortcut = (e.ctrlKey || e.metaKey) && e.key === "Enter";
       const isDeleteShortcut = e.altKey && e.key.toLowerCase() === 'd';
       const isJustSaveScreenShot = (e.key === 'Escape')
      
        if (isSubmitShortcut) {
            await state.onSave();
            hideModal();
            e.preventDefault();
        }
        else if (isDeleteShortcut) {
          await state.onDiscard();
          hideModal();
          e.preventDefault();
        } else if( isJustSaveScreenShot) {
          state.onEscape();
          hideModal();
        }
    }

function registerModal(shadowRoot, {onSave = () => {}, onDiscard = () => {}, onEscape=()=>{}} = {}) {
    console.debug("Registering modal in shadow root:", shadowRoot);
    state.shadowRoot = shadowRoot;
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    modalContainer.innerHTML = content;
    state.modalRoot = modalContainer;
    stopEventLeak();
    state.onSave = onSave;  
    state.onDiscard = onDiscard;
    state.onEscape = onEscape;
     state.modalRoot.querySelector('#saveBtn').onclick = async() => {
        await state.onSave();
        hideModal();
    }
    state.modalRoot.querySelector('#discardBtn').onclick = async() => {
        await state.onDiscard();
        hideModal();
    }
    state.shadowRoot.appendChild(modalContainer);
}


function stopEventLeak() {
  document.addEventListener("keydown", (e) => {
    if (!state.isShown) return;
    console.debug("Modal is shown, stopping keydown event propagation.");
    e.stopPropagation();
    Object.values(state.keyDownListenerOnModalPopup).forEach(listener => listener(e));
  }, true);

  document.addEventListener('keyup', (e)=>{
    if (!state.isShown) return;
    console.debug("Modal is shown, stopping keydown event propagation.");
    e.stopPropagation();
  }, true)
}

function setModalKeyDownListener(key, listener) {
  state.keyDownListenerOnModalPopup = {...state.keyDownListenerOnModalPopup, [key]: listener};
}

function removeModalKeyDownListener(key) {
  const {[key]: _, ...rest} = state.keyDownListenerOnModalPopup;
  state.keyDownListenerOnModalPopup = rest;
}


function showModal({videoTitle, noteId, screenshotSrc, timestamp, timestampLink}) {
    // console.debug("Showing modal with data:", {videoTitle, noteId, screenshotSrc, timestamp, timestampLink});
    state.isShown = true;
    state.modalRoot.querySelector('#videoTitle').textContent = videoTitle;
    state.modalRoot.querySelector('#screenshot').src = screenshotSrc;

    if(timestampLink) {
      state.modalRoot.querySelector('#linkGenerationSucess').classList.remove('hidden')
      state.modalRoot.querySelector('#linkGenerationFailure').classList.add("hidden")
    } else {
      state.modalRoot.querySelector('#linkGenerationSucess').classList.add('hidden')
      state.modalRoot.querySelector('#linkGenerationFailure').classList.remove('hidden')
    }
    
    state.modalRoot.querySelector('#saveBtnText').textContent = normalize("ctrl+Enter");
    state.modalRoot.querySelector('#discardBtnText').textContent = normalize("alt+D");

    state.modalRoot.querySelector('.overlay').classList.add('open');
    state.lastFocusedElement = document.activeElement;
    state.modalRoot.querySelector('#description').focus();
    setModalKeyDownListener('saveShortcut', handleTextareaKeydown);
}

function getModalDescription() {
  const description = state.modalRoot.querySelector('#description').value
  console.debug(description)
    return description;
}

function hideModal() {
    state.isShown = false;
    state.modalRoot.querySelector('.overlay').classList.remove('open');
    state.lastFocusedElement?.focus();
    removeModalKeyDownListener('saveShortcut');
    state.modalRoot.querySelector('#description').value = '';
    console.debug("Modal hidden.");
}
export { registerModal, showModal, hideModal, getModalDescription };