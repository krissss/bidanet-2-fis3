// 使fis3使用相对路径，先安装插件
// npm install -g fis3-hook-relative 
// 启用插件
fis.hook('relative');
// 让所有文件，都使用相对路径。
fis.match('**', {
  relative: true
});

fis.match('*.scss', {
  // fis3-parser-scss 插件进行解析
  parser: fis.plugin('scss'),
  // .scss 文件后缀构建后被改成 .css 文件
  rExt: '.css'
});

fis.match('app*.{js,css,scss}', {
  useHash: true
});

fis.match('i-*.{js,css,scss}', {
  useHash: true
});

fis.match('*.{png,jpg}', {
  useHash: true
});

fis.media('prod').match('app*.js', {
  // fis-optimizer-uglify-js 插件进行压缩，已内置
  optimizer: fis.plugin('uglify-js')
});

fis.media('prod').match('app*.{css, scss}', {
  // fis-optimizer-clean-css 插件进行压缩，已内置
  optimizer: fis.plugin('clean-css')
});

fis.media('prod').match('*.png', {
  // fis-optimizer-png-compressor 插件进行压缩，已内置
  optimizer: fis.plugin('png-compressor')
});