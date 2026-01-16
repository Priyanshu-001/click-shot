 const openNoteTarget = (note) => {
    const url = note?.timestampUrl || note?.video?.url;
    if (!url) return;
    window.open(url, note?.video?.id ? `video=${note?.video?.id}` : "_blank");
  }

  export {openNoteTarget}