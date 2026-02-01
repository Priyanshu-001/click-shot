import { captureMetaData } from "../steps/caputre-metadata";
import { captureVideoData } from "../steps/caputre-video";

import { getTargetVideo } from "../steps/get-target-video";
import { sendCaputredPost, deleteNote } from "../bg-client";
import { showModal, registerModal, getModalDescription } from "../elements/modalService";

let context = {};
let isInProgress = false;

async function takeVideoNote() {
    if (isInProgress) {
        console.debug("Modal is already up")
        return;
    }
    isInProgress = true;
    try {
        console.time("takeVideoNote");
        const { video } = getTargetVideo();
        if (!video) {
            console.error("No video element found on the page.");
            isInProgress = false;
            return;
        }
        const { currentVideoAction, finalizeVideoAction } = getVideoAction(video);
        currentVideoAction();

        const { metaData, videoMetaData, playlistMetaData } = captureMetaData({ video });
        const screenShotData = captureVideoData({ video });
        const userCaputredData = {};
        saveToContext({ metaData, videoMetaData, playlistMetaData, screenShotData, userCaputredData, finalizeVideoAction });
        const response = await sendCaputredPost({
            data: context,
            stage: "BEGIN_CAPTURE"
        })

        saveToContext({ noteId: response.noteId, stage: "CAPTRUE_SAVED", screenShotData: { ...screenShotData }, ...(response?.correctData ?? {}) });
        showModal({
            videoTitle: videoMetaData.title,
            noteId: context.noteId,
            timestampLink: response.timestampUrl,
            screenshotSrc: screenShotData.dataUrl,
        });
    } catch (err) {
        console.error(err)
        isInProgress = false
    } finally {
        console.timeEnd("takeVideoNote");
    }
}

function getVideoAction(video) {
    const noOp = () => { }
    let currentVideoAction = noOp;
    let finalizeVideoAction = noOp;
    if (!video.paused && !video.ended) {
        //video was playing
        currentVideoAction = () => video.pause()
        finalizeVideoAction = () => video.play()
    }
    return { currentVideoAction, finalizeVideoAction }
}

async function finalizeCapture() {
    if (context.stage != "CAPTRUE_SAVED") {
        console.error("Cannot finalize capture, previous stage not completed.");
        return;
    }

    await sendCaputredPost({
        noteId: context.noteId,
        data: context,
        stage: "FINALIZE_CAPTURE"
    });

    context.finalizeVideoAction()
}

function saveToContext(data) {
    context = { ...context, ...data };
}

function createFinalizeAction(action = () => { }) {
    return async () => {
        await action()
        context.finalizeVideoAction?.()
        clearContext();
        isInProgress = false;
    };
}

function preprocess(shadowRoot) {
    registerModal(shadowRoot, {
        onSave: createFinalizeAction(async () => {
            saveToContext({ userCapturedInfo: { ...context.userCapturedInfo, description: getModalDescription() } });
            await finalizeCapture();
        }),

        onDiscard: createFinalizeAction(async () => {
            await deleteNote(context.noteId);
        }),

        onEscape: createFinalizeAction(() => {
        })
    })
}

function clearContext() {
    context = {};
}

export { takeVideoNote, preprocess };