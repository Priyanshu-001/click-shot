import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: 'public/icon48.png',
    16: 'public/icon16.png',
    32: 'public/icon32.png',
    128: 'public/icon128.png',

  },
  action: {
    default_icon: {
      48: 'public/icon48.png',
    },
    default_popup: 'src/popup/index.html',
  },
 background: {
  service_worker: 'src/background/index.js',
  type: 'module'
  },
  content_scripts: [{
    js: ['src/content/main.js'],
    matches: ['https://*/*'],
  }],
  commands: {
  "take-screenshot-note": {
    "suggested_key": {
      "default": "Ctrl+Shift+K",
    },
    "description": "Trigger screenshot capture"
    }
  },
  permissions: [
    'contentSettings',
  ],
  options_page: "src/home/index.html"

})
