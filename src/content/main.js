import {  preprocess, takeVideoNote } from "./actions/take-video-note";

console.time('init-content-script');
const shadowRoot = createShadowRoot();
preprocess(shadowRoot)
console.timeEnd('init-content-script');

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === "TRIGGER_CAPTURE") {
    await takeVideoNote();
  }
  if( msg.action === "NOTIFY") {
    alert(msg.message);
  }
});

function createShadowRoot() {
  const host = document.createElement('div')
  host.id = 'clickshot-shadow-host'
  host.style.position = "fixed"
  host.style.inset = "0"
  host.style.zIndex = "999999"
  host.style.pointerEvents = "none"
  document.documentElement.appendChild(host)
  const shadowRoot = host.attachShadow({ mode: 'open',  delegatesFocus: true })
  return shadowRoot;
}