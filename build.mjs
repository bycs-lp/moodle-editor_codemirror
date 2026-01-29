import * as esbuild from 'esbuild';
import {readFileSync, writeFileSync} from 'fs';

// Get codemirror version from package.json
const pkg = JSON.parse(readFileSync('node_modules/codemirror/package.json', 'utf8'));
const version = pkg.version;

await esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'esm',
    outfile: 'amd/src/cm6pro-lazy.js',
    banner: { js: '/* eslint-disable */' },
    minify: false,
});

// Update thirdpartylibs.xml with current version
const thirdpartylibs = readFileSync('thirdpartylibs.xml', 'utf8');
const updated = thirdpartylibs.replace(
    /<version>[^<]+<\/version>/,
    `<version>${version}</version>`
);
writeFileSync('thirdpartylibs.xml', updated);

console.log(`Build complete: amd/src/cm6pro-lazy.js (codemirror ${version})`);
