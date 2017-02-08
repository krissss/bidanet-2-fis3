var DEBUG = true,
  PROD = !DEBUG;

if(!PROD){ // 测试环境
  var HOST_FOLDER = '',
  WEB_ROOT = HOST_FOLDER,
  API_BASE = 'http://192.168.1.111:8081/wxy/inf/',
  NEW_API_BASE = 'http://192.168.1.111/bidanet-2-phpserver/service/api/',
  //API_BASE = 'http://127.0.0.1:8081/wxy/inf/',
  //USER_OPENID = 'okju2w7Rt607heeud2joDzfPpBmQ';
  USER_OPENID = 'okju2w3k4W_ydmvRx3d-Qk6pU1-M';
  // 抓客 okju2w3k4W_ydmvRx3d-Qk6pU1-M
  // 邀约 okju2w3tYAObB_oK6343isPtIMXU
  // 门市 okju2w-cU1cIABNSa4x9Np6WEo4k
}else{
  var HOST_FOLDER = '/wangxiaoyun',
  WEB_ROOT = 'http://local.yingegou.com' + HOST_FOLDER + '/web',
  API_BASE = 'http://118.178.226.161:8082/wxy/inf/',
  NEW_API_BASE = 'http://local.yingegou.com' + HOST_FOLDER + '/service/api/',
  USER_OPENID = window.localStorage.getItem('openid');
}
