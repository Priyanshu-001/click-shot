import { getOriginCode, EXTRACTOR_IDS } from "../utils/origin-code-extractor";
import { upsertNote, cascadeDeleteNote } from "./persistance/note-db-service";

async function createNote(message){
    validate(message);
    const extracted = extractDetails(message);
    const enrichedDetails = buildDerivedFields(extracted);
    const {noteId} = await upsertNote(enrichedDetails);
    return {noteId, timestampUrl: enrichedDetails?.noteInfo?.timestampUrl};
}

function validate(message) {
    if(!message.data || !message.data.videoMetaData || !message.data.screenShotData || !message.data.metaData){
        throw new Error("Invalid message format");
    }

    if(!message.data.videoMetaData.videoId || !message.data.videoMetaData.url|| !message.data.videoMetaData.title){
        throw new Error("Invalid video metadata");
    }

    if(!message.data.metaData.origin || !message.data.metaData.url){
        throw new Error("Invalid context metadata");
    }

    //playlist is optional, checked its completeness at time of extraction.

}

function extractDetails(message){
    let playListInfo = null;
    const videoInfo = { ...message.data.videoMetaData };
    const noteInfo = { ...message.data.userCapturedInfo, ...message.data.screenShotData};
    const context = {site: message.data.metaData.origin, url: message.data.metaData.url};
    noteInfo.id = message.noteId;

    if(message.data.playlistMetaData && message.data.playlistMetaData.playlistId && message.data.playlistMetaData.playlistTitle){
        playListInfo = {playlistId: message.data.playlistMetaData.playlistId, title: message.data.playlistMetaData.playlistTitle};
    }

    return {
        videoInfo,
        playListInfo,
        noteInfo,
        context
    };
}

function buildDerivedFields(extracted){
    const {noteInfo, context} = extracted;
    const origin = context.site;
    const originCode = getOriginCode(origin);
    const {timestampUrl, videoUrl} = buildUrls(extracted, originCode);

    return { ...extracted, noteInfo: {...noteInfo, timestampUrl, url: context.url}, videoInfo: { ...extracted.videoInfo, url: videoUrl }}
}

function buildUrls(extracted, originCode){
    let videoUrl = extracted.videoInfo.url;
    let timestampUrl = null;
    if(originCode === EXTRACTOR_IDS.YT){
        videoUrl = `${extracted.context.site}/watch?v=${extracted.videoInfo.videoId}`;
        timestampUrl = `${videoUrl}&t=${Math.floor(extracted.noteInfo.currentTime)}s`;
    }
    return {timestampUrl, videoUrl};
}


async function deleteNote({noteId}){
   await cascadeDeleteNote(noteId);
}

function editNote(){

}



export { createNote, deleteNote, editNote };