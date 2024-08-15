/**
 * Set slide video
 *
 * @param {node} slide
 * @param {object} data
 * @param {int} index
 * @param {function} callback
 */
import { has, closest, injectAssets, addClass, removeClass, createHTML, isFunction, waitUntil, isString, isArray } from '../utils/helpers.js';

const defaultConstols = ['play-large', 'play', 'fast-forward', 'progress', 'current-time', 'duration', 'mute', 'restart', 'rewind', 'volume', 'settings', 'captions', 'pip', 'airplay', 'fullscreen'];

export default function slideVideo(slide, data, index, callback) {
    const slideContainer = slide.querySelector('.ginner-container');
    const videoID = 'gmedia' + index;
    const slideMedia = slide.querySelector('.gslide-media');
    const videoPlayers = this.getAllPlayers();

    addClass(slideContainer, 'gmedia-container');

    slideMedia.insertBefore(createHTML('<div class="gmedia-wrapper"></div>'), slideMedia.firstChild);

    const videoWrapper = slide.querySelector('.gmedia-wrapper');

    injectAssets(this.settings.plyr.css, 'Plyr');

    let url = data.href;
    let provider = data?.videoProvider;
    let customPlaceholder = false;

    slideMedia.style.maxWidth = data.width;

    injectAssets(this.settings.plyr.js, 'Plyr', () => {
        // Set vimeo videos
        if (!provider && url.match(/vimeo\.com\/([0-9]*)/)) {
            provider = 'vimeo';
        }

        // Set youtube videos
        if (
            !provider &&
            (url.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/) ||
                url.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/) ||
                url.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/) ||
                url.match(/(youtube\.com|youtube-nocookie\.com)\/shorts\/([a-zA-Z0-9\-_]+)/))
        ) {
            provider = 'youtube';
        }

        // Set local videos
        // if no provider, default to local
        if (provider === 'local' || !provider) {
            provider = 'local';
            let html = '<video id="' + videoID + '" ';
            html += `style="background:#000; max-width: ${data.width};" `;
            html += 'preload="metadata" ';
            html += 'x-webkit-airplay="allow" ';
            html += 'playsinline ';
            html += 'controls ';
            html += 'class="gmedia-local">';
            html += `<source src="${url}">`;
            html += '</video>';
            customPlaceholder = createHTML(html);
        }

        // prettier-ignore
        const placeholder = customPlaceholder ? customPlaceholder : createHTML(`<div id="${videoID}" data-plyr-provider="${provider}" data-plyr-embed-id="${url}"></div>`);

        addClass(videoWrapper, `${provider}-media gmedia`);
        videoWrapper.appendChild(placeholder);
        videoWrapper.setAttribute('data-id', videoID);
        videoWrapper.setAttribute('data-index', index);

        let playerConfig = has(this.settings.plyr, 'config') ? this.settings.plyr.config : {};
        if (provider === 'local' && has(data, 'download') && data.download) {
            if (isString(data.download)) {
                playerConfig = { ...playerConfig, urls: { download: data.download } };
            }
            if (has(playerConfig, 'controls') && isArray(playerConfig.controls)) {
                playerConfig = { ...playerConfig, controls: [...playerConfig.controls, 'download'] };
            } else {
                playerConfig = { ...playerConfig, controls: [...defaultConstols, 'download'] };
            }
        }
        const player = new Plyr('#' + videoID, playerConfig);

        player.on('ready', (event) => {
            videoPlayers[videoID] = event.detail.plyr;
            if (isFunction(callback)) {
                callback();
            }
        });
        waitUntil(
            () => {
                return slide.querySelector('iframe') && slide.querySelector('iframe').dataset.ready == 'true';
            },
            () => {
                this.resize(slide);
            }
        );
        player.on('enterfullscreen', handleMediaFullScreen);
        player.on('exitfullscreen', handleMediaFullScreen);
    });
}

/**
 * Handle fullscreen
 *
 * @param {object} event
 */
function handleMediaFullScreen(event) {
    const media = closest(event.target, '.gslide-media');

    if (event.type === 'enterfullscreen') {
        addClass(media, 'fullscreen');
    }
    if (event.type === 'exitfullscreen') {
        removeClass(media, 'fullscreen');
    }
}
