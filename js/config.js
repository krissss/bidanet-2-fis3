var DEBUG = false,
  PROD = !DEBUG;

if(!PROD){ // 测试环境
  var HOST_FOLDER = '',
  WEB_ROOT = HOST_FOLDER,
  //API_BASE = 'http://118.178.226.161:8082/wxy/inf/',
  API_BASE = 'http://127.0.0.1:8081/wxy/inf/',
  //USER_OPENID = 'okju2w7Rt607heeud2joDzfPpBmQ';
  USER_OPENID = 'okju2w_xk9qpjXgEeDF2pu3i3c922A';
  // 抓客 okju2w9qlr7oq7nmv5R_EfsMSO5A
  // 邀约 okju2wyrqbNNeNsYLWNpPGaJZ6FU
  // 门市 okju2w-cU1cIABNSa4x9Np6WEo4k
}else{
  var HOST_FOLDER = '/wangxiaoyun',
  WEB_ROOT = 'http://local.yingegou.com' + HOST_FOLDER + '/web',
  API_BASE = 'http://118.178.226.161:8082/wxy/inf/',
  USER_OPENID = window.localStorage.getItem('openid');
}
