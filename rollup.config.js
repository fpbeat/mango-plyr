const { PRODUCTION } = process.env;
const pkg = require("./package.json");

const path = require('path');
const LessPluginInlineSvg = require('less-plugin-inline-svg');

const inlineSvg = new LessPluginInlineSvg({
    base64: true
});

import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import less from 'rollup-plugin-less';
import nodePolyfills from 'rollup-plugin-node-polyfills';

import { uglify } from 'rollup-plugin-uglify';

export default {
    input: './resources/js/app.js',

    output: {
        file: './public/js/dist.js',
        name: 'mangoPlyr',
        format: 'iife',
    },
    plugins: [
        resolve({
            browser: true
        }),
        commonjs({
            include: 'node_modules/**',
        }),
        alias({
            '~': path.resolve(__dirname, './resources/js/')
        }),
        babel({
            exclude: ['node_modules/**']
        }),
        less({
            output: './public/css/dist.css',
            option: {
                plugins: [inlineSvg],
                paths: [
                    path.resolve(__dirname, 'node_modules'),
                ]
            }
        }),
        nodePolyfills(),
        replace({
            VERSION: String(pkg.version),
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        (PRODUCTION && uglify())
    ]
};