import Dexie from 'dexie';

export const db = new Dexie('clickshot');

db.version(1).stores({
  videos: '++id, &[site+videoId], site, videoId, title, playlistId, createdAt',
  notes: '++id, videoId, description, site, [site+videoId], *tags',
  playlists: '++id, title, &[site+playlistId], playlistId, site',
});

async function upsertNote({ noteInfo, videoInfo, playListInfo, context }) {
  console.debug("upserting")
  const now = Date.now();

  const dbVideoInfo = {
    site: context.site,
    ...videoInfo,
    updatedAt: now
  };

  const dbPlayListInfo = playListInfo
    ? { site: context.site, ...playListInfo, updatedAt: now }
    : null;

  const { id:noteId, createdAt, ...rest } = noteInfo;
  const dbNote = {
    ...rest,
    site: context.site,
    updatedAt: now
  };

  return db.transaction('rw', db.videos, db.notes, db.playlists, async () => {
    let playlist = null;
    console.debug("upserting playlist")

    if (dbPlayListInfo) {
      playlist = await db.playlists
        .where('[site+playlistId]')
        .equals([context.site, dbPlayListInfo.playlistId])
        .first();

      if (!playlist) {
        const playlistId = await db.playlists.add({
          ...dbPlayListInfo,
          createdAt: now
        });
        playlist = { id: playlistId };
      }

      dbVideoInfo.playlistId = playlist.id;
    }

    let video = await db.videos
      .where('[site+videoId]')
      .equals([context.site, dbVideoInfo.videoId])
      .first();

    if (!video) {
      const videoId = await db.videos.add({
        ...dbVideoInfo,
        createdAt: now
      });
      video = { id: videoId };
    }

    dbNote.videoId = video.id;
    console.debug("upserting note")
    let savedNoteId = noteId;

    if (savedNoteId) {
      await db.notes.update(savedNoteId, dbNote);
    } else {
      savedNoteId = await db.notes.add({
        ...dbNote,
        createdAt: now
      });
    }

    return { videoId: dbVideoInfo.id, playlistId: dbPlayListInfo?.id, noteId: savedNoteId};
  });
}

async function editNote({noteInfo}) {
  const now = Date.now();
  const { id, ...rest } = noteInfo;
  const dbNote = {
    ...rest,
    updatedAt: now
  };

  const isUpdated = await db.notes.update(id, dbNote);

  if (!isUpdated) {
    throw new Error(`Note with id ${id} not found`);
  }
}

async function cascadeDeleteNote(noteId) {
  return db.transaction('rw', db.videos, db.notes, db.playlists, async () => {
    const note = await db.notes.get(noteId);
    if (!note) {
      console.warn(`Note with id ${noteId} not found`);
      return;
    }
    
    await db.notes.delete(noteId);
    let video = null;  

    if (note.videoId) { 
      const remainingNotes = await db.notes.where('videoId').equals(note.videoId).count();
        if (remainingNotes === 0) {
          video = await db.videos.get(note.videoId);
          await db.videos.delete(video.id);
        }
    }

    if (video?.playlistId) {
      const remainingVideos = await db.videos.where('playlistId').equals(video.playlistId).count();
      if (remainingVideos === 0) {
        await db.playlists.delete(video.playlistId);
      }
    }
  });
}

async function searchNotes({ site, videoIds }) {
  let collection;

  if (site && videoIds?.length) {
    // compound index
   collection =  db.notes
      .where('[site+videoId]')
      .anyOf(videoIds.map(id => [site, id]))
      

  } else if (site) {
   collection =  db.notes
      .where('site')
      .equals(site)
      

  } else if (videoIds?.length) {
   collection =  db.notes
      .where('videoId')
      .anyOf(videoIds)
      

  } else {
   collection =  db.notes
  }
  const notes = await collection.reverse().sortBy('createdAt');
  return await enrichNotes(notes);
}

async function enrichNotes(notes) {
  if (!notes.length) return [];

  const videoDbIds = [...new Set(notes.map(n => n.videoId))];

  const videos = await db.videos
    .where('id')
    .anyOf(videoDbIds)
    .toArray();

  const videoMap = Object.fromEntries(
    videos.map(v => [v.id, v])
  );

  const playlistIds = [
    ...new Set(videos.map(v => v.playlistId).filter(Boolean))
  ];

  const playlists = playlistIds.length
    ? await db.playlists
        .where('id')
        .anyOf(playlistIds)
        .toArray()
    : [];

  const playlistMap = Object.fromEntries(
    playlists.map(p => [p.id, p])
  );

  return notes.map(note => {
    const video = videoMap[note.videoId];
    return {
      ...note,
      video,
      playlist: video?.playlistId
        ? playlistMap[video.playlistId]
        : null
    };
  });
}



export { upsertNote, cascadeDeleteNote, editNote, searchNotes };