const EXTRACTOR_IDS = {"YT": "YT", "UDEMY": "UDEMY", "COURSERA": "COURSERA", "ETC": "OTHERS"};

function getOriginCode(origin) {
        if (origin === 'http://www.youtube.com' || origin === 'https://www.youtube.com') {
            return EXTRACTOR_IDS.YT;
        }
        return EXTRACTOR_IDS.ETC;
    }

export { getOriginCode, EXTRACTOR_IDS };
    