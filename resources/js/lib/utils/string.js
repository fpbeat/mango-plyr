export default {
    trim(string) {
        return String(string).replace(/^\s+|\s+$/g, '');
    },

    test(string, regexp) {
       return regexp.test(this.trim(string));
    },

    isEmpty(string) {
        return ['false', 'null', '', 'undefined', 'NaN'].includes(this.trim(string));
    },

    substitute(string, object, regexp) {
        return String(string).replace(regexp || (/\\?\{([^{}]+)\}/g), (match, name) => {
            if (match.charAt(0) === '\\') return match.slice(1);
            return (object[name] !== null) ? object[name] : '';
        });
    },
    
    lcFirst(string) {
        let first = string.charAt(0).toLowerCase();
        return first + string.substr(1, string.length - 1);
    },

    toCamelCase(string) {
        return String(string).replace(/-\D/g, (match) => match.charAt(1).toUpperCase());
    },

    sanitize(string) {
        return String(string).replace(/[^a-z0-9]/gi, '').toLowerCase();
    },

    hyphenate(string) {
        return this.lcFirst(String(string)).replace(/[A-Z]/g, match => {
            return ('-' + match.charAt(0).toLowerCase());
        });
    },

    sha1(string) {
        let rot = (word, shift) => word << shift | word >>> (32 - shift);
        return unescape(encodeURIComponent(string)).split("").map(char =>
            char.charCodeAt(0)
        ).reduce((done, byte, idx, arr) => idx % 4 === 0 ? [...done, arr.slice(idx, idx + 4)] : done
            , []).reduce((done, group) =>
                [...done, group[0] << 24 | group[1] << 16 | group[2] << 8 | group[3]]
            , []).reduce((done, word, idx, arr) => idx % 8 === 0 ? [...done, arr.slice(idx, idx + 8)] : done
            , []).map(group => {
            while (group.length < 40)
                group.push(rot(group[group.length - 2] ^ group[group.length - 5] ^ group[group.length - 8], 3));
            return group;
        }).flat().reduce((state, word, idx, arr) => {
                let temp = ((state[0] + rot(state[1], 5) + word + idx + state[3]) & 0xffffffff) ^ state[idx % 2 === 0 ? 4 : 5](state[0], state[1], state[2]);
                state[0] = rot(state[1] ^ state[2], 11);
                state[1] = ~state[2] ^ rot(~state[3], 19);
                state[2] = rot(~state[3], 11);
                state[3] = temp;
                return state;
            }, [0xbd173622, 0x96d8975c, 0x3a6d1a23, 0xe5843775,
                (w1, w2, w3) => (w1 & rot(w2, 5)) | (~rot(w1, 11) & w3),
                (w1, w2, w3) => w1 ^ rot(w2, 5) ^ rot(w3, 11)]
        ).slice(0, 4)
            .map(p => p >>> 0)
            .map(word => ("0000000" + word.toString(16)).slice(-8))
            .join("");
    }
};