import { normalize } from "../utils/platform-key-normalizer"

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("open-shortcuts").addEventListener("click", () => {
    chrome.tabs.create({
      url: "chrome://extensions/shortcuts",
    })
  })

  document.getElementById("open-settings").addEventListener("click", () => {
    chrome.runtime.openOptionsPage()
  })

  document.getElementById("shortcutKey").textContent = normalize("meta+shift+K")
})
