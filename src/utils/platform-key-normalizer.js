function normalize(keycode) {
    if(!keycode) {
        return keycode;
    }
   const keys =  keycode.split("+")
   const isMac = navigator.platform.toUpperCase().includes('MAC')

   return keys.map(normalizeAKey(isMac)).join(" + ")
}

function normalizeAKey(isMac) {
  return (key) => {
    if (!isMac) return key

    switch (key.toLowerCase()) {
      case 'meta':
      case 'cmd':
      case 'command':
        return '⌘'

      case 'option':
      case 'alt':
        return '⌥'

      default:
        return key
    }
  }
}

export {normalize}
