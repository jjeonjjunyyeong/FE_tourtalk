const { EsbuildPlugin } = require('esbuild-loader');

module.exports = {
  chainWebpack: (config) => {
    // JavaScript 처리를 위한 기존 babel-loader 제거
    config.module.rules.delete('js');
    config.module.rule('js')
      .test(/\.jsx?$/)
      .use('esbuild-loader')
      .loader('esbuild-loader')
      .options({
        loader: 'jsx',
        target: 'es2015'
      });

    // TypeScript 처리를 위한 설정 (프로젝트에서 TypeScript를 사용하는 경우)
    config.module.rules.delete('ts');
    config.module.rule('ts')
      .test(/\.tsx?$/)
      .use('esbuild-loader')
      .loader('esbuild-loader')
      .options({
        loader: 'tsx',
        target: 'es2015'
      });

    // Vue SFC의 JavaScript 부분에 대한 처리
    config.module.rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compilerOptions = {
          ...options.compilerOptions,
          isCustomElement: tag => tag.startsWith('ion-')
        };
        return options;
      });

    // MinifyJS 플러그인을 ESBuild로 교체
    config.optimization.minimizer('terser').use(EsbuildPlugin, [{
      minify: true,
      target: 'es2015',
      css: true
    }]);
  }
};
