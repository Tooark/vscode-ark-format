import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: 'dist/extension.js',
  sourcemap: !production,
  sourcesContent: false,
  minify: production,
  external: ['vscode'],
  logLevel: 'warning'
};

async function main () {
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('[watch] esbuild is watching...');
    return;
  }

  await esbuild.build(buildOptions);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
