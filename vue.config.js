module.exports = {
  baseUrl: './',
  chainWebpack: config => {
    config.module
      .rule('raw')
      .test(/\.(vs|fs|glsl)(\?.*)?$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end()
  }
}
