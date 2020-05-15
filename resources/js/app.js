import {GenericUtil, ElementUtil, ArrayUtil, StringUtil, ObjectUtil} from './lib/utils';

import Player from './player/index';
import Statistics from './statistics/index';

import tippy from 'tippy.js';
import EventEmitter from 'events';

import '../styles/app.less';

class App extends EventEmitter {

    options = {
        texts: {
            views: 'Заинтересовались песней -  {count} чел.'
        },
        selectors: {
            blocks: '.t778 > div > div[data-product-lid]',

            content: '.t778__content',
            image: '.t-bgimg',
            sku: '.js-product-sku',
        },
        classes: {
            play: 'mangoplry__play-button',
            active: 'mangoplry__play-button-active',
        },

        statistics: {},
        player: {}
    };

    currentPlayed = null;

    constructor(options = {}) {
        super();

        try {
            GenericUtil.setOptions(this, options);

            this.bootstrap();
        } catch (e) {
            ('console' in window) && console.error(`mangoPlyr fatal error: ${e.message}`);
        }
    }

    bootstrap() {
        this.blocks = this.getBlocks();

        this.player = new Player(ObjectUtil.merge(true, {
            onStatechange: state => {
                const block = this.blocks[this.currentPlayed];

                if (!GenericUtil.isEmpty(block)) {
                    if (state === 'play') {
                        Object.values(this.blocks).forEach(item => this.togglePlayButton(item, 'pause'))
                    }

                    this.togglePlayButton(block, state);
                }
            }
        }, this.options.player));

        this.statistics = new Statistics(ObjectUtil.merge(true, {
            onFetched: this.attachTippies.bind(this)
        }, this.options.statistics));
    }

    getBlocks() {
        let blocks = {};

        const elements = document.querySelectorAll(this.options.selectors.blocks);
        for (let element of Array.from(elements)) {
            const id = parseInt(ElementUtil.getDataAttribute(element, 'productLid'), 10),
                image = element.querySelector(this.options.selectors.image),
                audio = element.querySelector(this.options.selectors.sku);

            if (ArrayUtil.isNotEmpty([id, image, audio]) && /\.mp3$/.test(audio.innerText)) {
                blocks[id] = {
                    container: element,
                    image: ElementUtil.getDataAttribute(image, 'original'),
                    file: audio.innerText,
                    play: this.createPlayButton(element, {
                        events: {
                            click: this.playStart.bind(this, id)
                        }
                    })
                };
            }
        }

        return blocks;
    }

    playStart(id) {
        const current = this.blocks[id];

        if (!this.player.initialized) {
            this.player.create();
        }

        this.player.toggle(current.file, current.image);
        this.statistics.store(id);
        this.currentPlayed = id;

        this.updateTippyContent(current.play);
    }

    createPlayButton(element, attributes) {
        const button = ElementUtil.create('BUTTON', ObjectUtil.merge(true, {
            class: this.options.classes.play
        }, attributes));

        ElementUtil.inject(element.querySelector(this.options.selectors.content), button);

        return button;
    }

    togglePlayButton(block, state) {
        ElementUtil.set(block.play, 'class', (state === 'pause' ? '!' : '') + this.options.classes.active);
    }

    attachTippies(data) {
        for (let [id, value] of Object.entries(this.blocks)) {
            const count = data[id] || 0;

            ElementUtil.set(value.play, 'data-count', count);

            tippy(value.play, {
                content: StringUtil.substitute(this.options.texts.views, {
                    count: count
                }),
                theme: 'light',
                arrow: false,
                animation: 'shift-toward-subtle',
                placement: 'top-start',
                hideOnClick: false
            });
        }
    }

    updateTippyContent(element) {
        if (element._tippy !== void 0) {
            const count = parseInt(ElementUtil.getDataAttribute(element, 'count', 0), 10);
            element._tippy.setContent(StringUtil.substitute(this.options.texts.views, {
                count: count + 1
            }));
        }
    }
}

export default {
    version: 'VERSION',
    create: (options) => new App(options)
};