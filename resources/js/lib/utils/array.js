import GenericUtil from './generic';
import StringUtil from './string';

export default {
    hash(input) {
        let sorted = Array.from(input).sort();

        return StringUtil.sha1(sorted.join(''));
    },

    notEmpty(input) {
        return input.filter(e => !['true', 'false', 'null', '', '0', 'undefined', 'NaN'].includes(StringUtil.trim(e)));
    },

    isNotEmpty(input) {
        return this.notEmpty(input).length === Array.from(input).length;
    }
};