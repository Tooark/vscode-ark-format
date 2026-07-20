import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * Plugin de log para o modo watch. Emite marcadores estáveis de início/fim de build
 * (`[watch] build started` / `[watch] build finished`) que o problemMatcher do VS Code
 * (.vscode/tasks.json) usa como beginsPattern/endsPattern para saber quando o preLaunchTask
 * ficou pronto. Sem esses marcadores, o debug fica preso em "Waiting for preLaunchTask...".
 * @type {import('esbuild').Plugin}
 */
const watchLogPlugin = {
  name: 'watch-log',
  setup (build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      console.log(`[watch] build finished (${result.errors.length} errors)`);
    });
  }
};

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
  logLevel: 'warning',
  plugins: watch ? [watchLogPlugin] : []
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
