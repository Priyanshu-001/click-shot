function getTargetVideo() {
    const video = document.querySelector('video');
    if (!video) return {};
    return {video};    
}

export { getTargetVideo };