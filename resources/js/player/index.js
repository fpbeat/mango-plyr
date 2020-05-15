import {ArrayUtil, ElementUtil, GenericUtil} from '../lib/utils';

import Plyr from 'plyr';
import EventEmitter from 'events';

export default class extends EventEmitter {

    initialized = false;
    currentSourceHash = null;

    options = {
        classes: {
            wrapper: 'plyr__container-wrapper',
            preview: 'plyr__controls__item plyr__preview'
        }
    };

    constructor(options = {}) {
        super();

        GenericUtil.setOptions(this, options);
    }

    create() {
        this.player = new Plyr(this.buildPlayerHTML(), {
            controls: ['play', 'progress', 'current-time', 'mute', 'volume'],
            invertTime: false
        });

        this.player.on('play', () => this.emit('statechange', 'play'));
        this.player.on('pause', () => this.emit('statechange', 'pause'));

        this.initialized = true;
    }

    buildPlayerHTML() {
        this.wrapper = ElementUtil.create('DIV', {
            class: this.options.classes.wrapper
        });

        const audio = ElementUtil.create('AUDIO', {
            controls: true
        });

        ElementUtil.inject(document.body, ElementUtil.inject(this.wrapper, audio));

        return audio;
    }

    createPreview(image) {
        let preview = ElementUtil.create('DIV', {
            class: this.options.classes.preview,
        });

        preview.style.backgroundImage = 'url(' + image + ')';

        ElementUtil.inject(this.player.elements.controls, preview, 'top');
    }

    toggle(file, image) {
        if (this.currentSourceHash !== ArrayUtil.hash(arguments)) {
            this.player.source = {
                type: 'audio',
                sources: [
                    {
                        src: file,
                        type: 'audio/mp3',
                    }
                ]
            };

            this.createPreview(image);
        }

        this.currentSourceHash = ArrayUtil.hash(arguments);
        this.player.togglePlay();
    }

    isPaused() {
        return this.player.paused;
    }

}