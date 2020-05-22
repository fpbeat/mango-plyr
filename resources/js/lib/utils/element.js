import GenericUtil from './generic';
import StringUtil from './string';

export default {
    inject(el, element, where = 'bottom') {
        const appendInserters = {
            before: 'beforeBegin',
            after: 'afterEnd',
            bottom: 'beforeEnd',
            top: 'afterBegin'
        };

        GenericUtil.getType(element) === 'element' ? el.insertAdjacentElement(appendInserters[where], element) : el.insertAdjacentHTML(appendInserters[where], element);

        return element;
    },

    create(name, options = {}) {
        let element = document.createElement(name.toLowerCase());
        this.set(element, options);

        return element;
    },

    createAndInject(name, options = {}, inject, where = 'bottom') {
       return this.inject(inject, this.create(name, options), where);
    },

    getDataAttributes(element) {
        let response = {};
        if (GenericUtil.getType(element) === 'element' && GenericUtil.isIterable(element.attributes)) {
            for (let attribute of element.attributes) {
                let components = String(attribute.nodeName).match(new RegExp(`^data\-(.*)`, 'i'));

                if (!GenericUtil.isEmpty(components)) {
                    response[StringUtil.toCamelCase(components[1])] = String(attribute.nodeValue);
                }
            }
        }

        return response;
    },

    getDataAttribute(element, name, def = null) {
        let attributes = this.getDataAttributes(element);

        return name !== null ? (attributes[name] || def) : attributes;
    },

    set(element, ...args) {
        let params = args.length === 2 ? {[args[0]]: args[1]} : args[0];

        for (let param of Object.keys(params)) {
            switch (param) {
                case 'html':
                    element.innerHTML = params[param];
                    break;
                case 'text':
                    if (['input', 'button', 'checkbox'].includes(element.tagName.toLowerCase())) {
                        element.value = params[param];
                    } else {
                        element.innerText = params[param];
                    }
                    break;
                case 'class':
                    params[param].split(' ').forEach((name) => {
                        let classTest = String(name).match(/^(\!)?(.*)/);

                        if (StringUtil.trim(name) !== '' && classTest) {
                            element.classList[classTest[1] === '!' ? 'remove' : 'add'].call(element.classList, classTest[2]);
                        }
                    });
                    break;
                case 'events':
                    Object.entries(params[param]).forEach(params => element.addEventListener(...params));

                    break;
                case 'styles':
                    for (let [name, style] of Object.entries(params[param])) {
                        element.style[name] = style;
                    }
                    break;
                default:
                    let hyphenatedParam = StringUtil.hyphenate(param);

                    if (/^data\-/.test(hyphenatedParam) && params[param] === null) {
                        element.removeAttribute(hyphenatedParam);
                    } else {
                        element.setAttribute(hyphenatedParam, params[param]);
                    }
            }
        }

        return element;
    }
};