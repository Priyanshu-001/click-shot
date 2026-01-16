function captureVideoData({video}) {
    console.debug("Video capture started...");
    if (!video) {
        console.debug("No video element found for capture.");
        return {};
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const currentTime = video.currentTime;
    return { dataUrl, currentTime };
}

export { captureVideoData };