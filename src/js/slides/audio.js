/**
 * Set slide audio
 *
 * @param {node} slide
 * @param {object} data
 * @param {int} index
 * @param {function} callback
 */
import { has, closest, injectAssets, addClass, removeClass, createHTML, isFunction, waitUntil } from '../utils/helpers.js';

export default function slideAudio(slide, data, index, callback) {
    const slideContainer = slide.querySelector('.ginner-container');
    const audioID = 'gmedia' + index;
    const slideMedia = slide.querySelector('.gslide-media');
    const audioPlayers = this.getAllPlayers();

    addClass(slideContainer, 'gmedia-container');

    slideMedia.insertBefore(createHTML('<div class="gmedia-wrapper"></div>'), slideMedia.firstChild);

    const audioWrapper = slide.querySelector('.gmedia-wrapper');

    injectAssets(this.settings.plyr.css, 'Plyr');

    let url = data.href;
    let provider = data?.audioProvider;
    let customPlaceholder = false;

    slideMedia.style.maxWidth = data.width;

    injectAssets(this.settings.plyr.js, 'Plyr', () => {
        // local audio
        provider = 'local';
        let html = '<audio id="' + audioID + '" ';
        html += `style="background:#000; max-width: ${data.width};" `;
        html += 'preload="metadata" ';
        html += 'x-webkit-airplay="allow" ';
        html += 'playsinline ';
        html += 'controls ';
        html += 'class="gmedia-local">';
        html += `<source src="${url}">`;
        html += '</audio>';
        customPlaceholder = createHTML(html);

        // prettier-ignore
        const placeholder = customPlaceholder ? customPlaceholder : createHTML(`<div id="${audioID}" data-plyr-provider="${provider}" data-plyr-embed-id="${url}"></div>`);

        addClass(audioWrapper, `${provider}-media gmedia`);
        audioWrapper.appendChild(placeholder);
        audioWrapper.setAttribute('data-id', audioID);
        audioWrapper.setAttribute('data-index', index);

        const playerConfig = has(this.settings.plyr, 'config') ? this.settings.plyr.config : {};
        const player = new Plyr('#' + audioID, playerConfig);

        player.on('ready', (event) => {
            audioPlayers[audioID] = event.detail.plyr;
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
