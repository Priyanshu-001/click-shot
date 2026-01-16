import { EXTRACTOR_IDS, getOriginCode } from "../../utils/origin-code-extractor";

const EXTRACTORS_BY_ID = {
    [EXTRACTOR_IDS.YT]: yTExtractor(),
};

function captureMetaData({video}) {
    const url = window.location.href;
    const origin = window.location.origin;
    const originCode = getOriginCode(origin);
    const { playlistTitle, playlistId, title, videoId } = extractOriginSpecificInformation(originCode);
    const duration = video?.duration;
    const videoMetaData = {title, videoId, duration, url}
    const playlistMetaData = {playlistTitle, playlistId}
    const metaData = {origin, url}
    return {videoMetaData, playlistMetaData, metaData};

    function extractOriginSpecificInformation(originCode) {
        const extractor = EXTRACTORS_BY_ID[originCode];
        if (extractor) {
            return extractor.extract();
        }
        const videoId = document.title;
        const title = document.title
        return { videoId, title };
    }
}

function yTExtractor() {
    
        function extract() {
            const playlistTitle = document.querySelector('ytd-playlist-panel-renderer h3')?.innerText || null;
            const title = document.title;

            // move to bg script
            const playlistId = new URLSearchParams(window.location.search).get('list');
            const videoId = new URLSearchParams(window.location.search).get('v');
            return { playlistTitle, playlistId, title, videoId };
        }

        return { extract };
}
export { captureMetaData };