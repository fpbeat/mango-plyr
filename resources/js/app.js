import {GenericUtil, ElementUtil, ArrayUtil, StringUtil, ObjectUtil} from './lib/utils';

import Player from './player/index';
import Statistics from './statistics/index';

import EventEmitter from 'events';

import '../styles/app.less';

class Application extends EventEmitter {

    options = {
        texts: {
            viewsShort:  '{count} чел.',
            viewsTitle: 'Заинтересовались песней - {count} чел.'
        },
        selectors: {
            blocks: '.t778 > div > div[data-product-lid]',

            playPlace: '.t778__content',
            viewsPlace: '.t778__content .t778__textwrapper',
            image: '.t-bgimg',
            sku: '.js-product-sku',
        },
        classes: {
            play: 'mangoplry__play-button',
            playActive: 'mangoplry__play-button-active',

            views: 'mangoplry__views-label',
            viewsActive: 'mangoplry__views-label-active'
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
        this.blocks = this.parseBlocks();

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
            onFetched: this.attachViewsLabels.bind(this)
        }, this.options.statistics));
    }

    parseBlocks() {
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
                    }),
                    views: this.createViewsLabel(element)
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

        this.updateViewsContent(current.views);
    }

    createViewsLabel(element) {
        const button = ElementUtil.create('DIV', {
            class: this.options.classes.views
        });

        ElementUtil.inject(element.querySelector(this.options.selectors.viewsPlace), button);

        return button;
    }

    createPlayButton(element, attributes) {
        const button = ElementUtil.create('BUTTON', ObjectUtil.merge(true, {
            class: this.options.classes.play
        }, attributes));

        ElementUtil.inject(element.querySelector(this.options.selectors.playPlace), button);

        return button;
    }

    togglePlayButton(block, state) {
        ElementUtil.set(block.play, 'class', (state === 'pause' ? '!' : '') + this.options.classes.playActive);
    }

    attachViewsLabels(data) {
        for (let [id, value] of Object.entries(this.blocks)) {
            const count = data[id] || 0;

            ElementUtil.set(value.views, {
                class: this.options.classes.viewsActive,
                dataCount: count,
                text: StringUtil.substitute(this.options.texts.viewsShort, {
                    count: count
                }),

                title: StringUtil.substitute(this.options.texts.viewsTitle, {
                    count: count
                })
            });
        }
    }

    updateViewsContent(element) {
        const count = parseInt(ElementUtil.getDataAttribute(element, 'count', 0), 10);

        ElementUtil.set(element, {
            text: StringUtil.substitute(this.options.texts.viewsShort, {
                count: count + 1
            }),

            title: StringUtil.substitute(this.options.texts.viewsTitle, {
                count: count + 1
            })
        });
    }
}

export default {
    version: 'VERSION',
    create: (options) => new Application(options)
};