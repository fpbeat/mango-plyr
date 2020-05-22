import {GenericUtil, NumberUtil, ElementUtil, ArrayUtil, StringUtil} from '~/lib/utils';

import EventEmitter from 'events';

export default class extends EventEmitter {
    options = {
        shopId: 'test_online',
        showcaseId: 'test_online',

        priceCreditDivider: 19,

        apiEntryPoint: 'https://loans-qa.tcsbank.ru/api/partners/v1/lightweight/create',

        selectors: {
            blocks: '.t750 .t-popup',

            title: '.t750__title-wrapper .t-name',
            desc: '.t750__title-wrapper .t-descr',
            price: '.t750__price-wrapper .t750__price-value',
            button: '.t750__btn-wrapper'
        },

        classes: {
            container: 'mangotools__tinkoff-container'
        },

        buttons: [
            {
                title: 'Кредит от {price}₽ в мес.',
                style: 't750__btn_wide t-btn t-btn_sm mangotools__tinkoff-credit'
            },
            {
                title: 'Рассрочка без переплат',
                promo: 'default',
                style: 't750__btn_wide t-btn t-btn_sm mangotools__tinkoff-installments'
            }
        ]
    };

    constructor(options = {}) {
        super();

        try {
            GenericUtil.setOptions(this, options);

            this.bootstrap();
        } catch (e) {
            ('console' in window) && console.error(`mangoTinkoff fatal error: ${e.message}`);
        }
    }

    bootstrap() {
        this.blocks = this.parseBlocks();

        this.blocks.forEach(block => {
            if (block.price > 0) {
                ElementUtil.inject(block.button, this.buildHtmlButtons(block));
            }
        });
    }

    parseBlocks() {
        let blocks = [];

        const elements = document.querySelectorAll(this.options.selectors.blocks);
        for (let element of Array.from(elements)) {
            const hook = ElementUtil.getDataAttribute(element, 'tooltipHook'),
                title = element.querySelector(this.options.selectors.title),
                desc = element.querySelector(this.options.selectors.desc),
                price = element.querySelector(this.options.selectors.price),
                button = element.querySelector(this.options.selectors.button);

            if (ArrayUtil.isNotEmpty([hook, title, desc, price])) {
                blocks.push({
                    button: button,
                    title: this.processTitle(title.innerText, desc.innerHTML),
                    price: this.processPrice(price.innerText)
                });
            }
        }

        return blocks;
    }

    processTitle(title, desc) {
        const cleanStr = desc.replace(/[\s\n\t]+/g, ' '),
            parts = ArrayUtil.notEmpty(cleanStr.split(/<br\s?\/?>/g)).map(StringUtil.trim);

        return StringUtil.trim(title) + (parts.length > 0 ? ' (' + parts.join(', ') + ')': '');
    }

    processPrice(price) {
        return parseInt(String(price).replace(/[^\d]/g, ''), 10);
    }

    buildHtmlButtons(block) {
        const container = ElementUtil.create('DIV', {
            class: this.options.classes.container
        });

        for (let button of this.options.buttons) {
            ElementUtil.createAndInject('A', {
                text: StringUtil.substitute(button.title, {
                    price: NumberUtil.numberFormat((block.price / this.options.priceCreditDivider).toFixed(0), 0, '.', ' ')
                }),
                class: button.style,

                events: {
                    click: this.processForm.bind(this, Object.assign({
                        promo: button.promo || null
                    }, block))
                }
            }, container);
        }

        return container;
    }

    processForm(block) {
        const params = {
            shopId: this.options.shopId,
            showcaseId: this.options.showcaseId,
            promoCode: block.promo,
            sum: block.price,
            itemName_0: block.title,
            itemQuantity_0: 1,
            itemPrice_0: block.price,
        }

        const form = ElementUtil.createAndInject('FORM', {
            action: this.options.apiEntryPoint,
            method: 'post'
        }, document.body);

        for (let [name, value] of Object.entries(params)) {
            if (!StringUtil.isEmpty(value)) {
                ElementUtil.createAndInject('INPUT', {
                    type: 'hidden',
                    name: name,
                    value: value
                }, form);
            }
        }

        form.submit();
    }
}