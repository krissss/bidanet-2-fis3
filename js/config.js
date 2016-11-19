var DEBUG = false,
  PROD = !DEBUG;

if(!PROD){ // 测试环境
  var HOST_FOLDER = '',
  WEB_ROOT = HOST_FOLDER,
  //API_BASE = 'http://118.178.226.161:8082/wxy/inf/',
  API_BASE = 'http://192.168.2.122:8080/wxy/inf/',
  //USER_OPENID = 'okju2w7Rt607heeud2joDzfPpBmQ';
  USER_OPENID = 'ox_askdjklqweqwenm';
  // 抓客 ox_askdjklqweqwenm
  // 邀约 ox_askdjklqweqwenm2   4 |  6   7
  // 门市 ox_askdjklqweqwenm3   5 |  8
}else{
  var HOST_FOLDER = '/wangxiaoyun',
  WEB_ROOT = 'http://local.yingegou.com' + HOST_FOLDER + '/web',
  API_BASE = 'http://118.178.226.161:8082/wxy/inf/',
  USER_OPENID = window.localStorage.getItem('openid');
}
