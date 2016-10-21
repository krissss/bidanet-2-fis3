"use strict";

var DEBUG = true,
    HOST_FOLDER = '',
    WEB_ROOT = HOST_FOLDER;

function logger(msg, data){
  if(DEBUG){
    console.log(msg);
    console.log(data);
  }
}

var api = {
  // hostname: 'http://139.224.66.175/wxy/inf/',
  hostname: 'http://183.240.86.109/wxy/inf/',
  token: window.localStorage.getItem('token'),
  userInfo: JSON.parse(window.localStorage.getItem('userInfo')),
  openid: 'ox_askdjklqweqwenm',//window.localStorage.getItem('openid'),
  // 抓客 ox_askdjklqweqwenm
  // 邀约 ox_askdjklqweqwenm2
  // 门市 ox_askdjklqweqwenm3
  login: function () {
    if(!api.openid){
      window.location.href = HOST_FOLDER + '/public/oauth.php';
      return;
    }
    $.ajax({
      url: api.hostname + 'login',
      method: 'get',
      data: {
        openid: api.openid,
        weChatFlag: 1,
      },
      dataType: 'JSON',
      success: function (data) {
        if (data.retMsg == 'OK') {
          logger('login', data.retVal);
          window.localStorage.setItem('token', data.retVal.token);
          window.localStorage.setItem('userInfo', JSON.stringify(data.retVal));
          var href = '';
          if (data.retVal.groupFlag == 1) {
            href = WEB_ROOT + '/zhuake/index.html';
          } else if (data.retVal.groupFlag == 2) {
            href = WEB_ROOT + '/yaoyue/index.html';
          } else if (data.retVal.groupFlag == 3) {
            href = WEB_ROOT + '/menshi/index.html';
          } else {
            href = WEB_ROOT + '/unkonwn';
          }
          window.location.href = href;
        } else {
          if(data.retMsg == 'sysUser不存在!'){
            window.location.href = WEB_ROOT + '/apply/index.html';
          }else{
            alert(data.retMsg);
          }
        }
      }
    });
  },
  register: function (params, successCallback) {
    $.ajax({
      url: api.hostname + 'register',
      method: 'post',
      data: params,
      dataType: 'JSON',
      crossDomain: true, // 如果用到跨域，需要后台开启CORS
      processData: false,  // 注意：不要 process data
      contentType: false,  // 注意：不设置 contentType
      success: function (data) {
        logger('register', data);
        successCallback(data);
      }
    });
  },
  listIdAndNameNoToken: function (objType, searchParams, successCallback) {
    searchParams['objType'] = objType;
    searchParams['weChatFlag'] = 1;
    $.ajax({
      url: api.hostname + 'registerInitData',
      method: 'get',
      data: searchParams,
      dataType: 'JSON',
      success: function (data) {
        logger('listIdAndNameNoToken', data);
        if (data.retMsg == 'OK') {
          var itemElem = '<option value="">请选择</option>';
          $.each(data.retVal, function (index, item) {
            itemElem += '<option value="' + item.uuid + '">' + item.name + '</option>';
          });
          successCallback(itemElem);
        } else {
          alert(data.retMsg);
        }
      }
    });
  },

  filterToken: function (data) {
    if (data.retMsg == 'Token is invalid') {
      window.top.location.href = WEB_ROOT + '/index.html';
      return false;
    }
    return true;
  },

  listIdAndName: function (objType, successCallback) {
    var params = {
      objType: objType
    };
    $.ajax({
      url: api.hostname + 'listIdAndName',
      method: 'get',
      data: {
        token: api.token,
        weChatFlag: 1,
        params: JSON.stringify(params)
      },
      dataType: 'JSON',
      success: function (data) {
        if (api.filterToken(data)) {
          logger('listIdAndName', data);
          if (data.retMsg == 'OK') {
            var itemElem = '<option value="">请选择</option>';
            $.each(data.retVal.list, function (index, item) {
              itemElem += '<option value="' + item.uuid + '">' + item.name + '</option>';
            });
            successCallback(itemElem);
          } else {
            alert(data.retMsg);
          }
        }
      }
    });
  },
  listObject: function (objType, searchParams, pageIndex, pageSize, successCallback) {
    var params = {
      objType: objType,
      pageIndex: pageIndex,
      pageSize: pageSize
    };
    $.each(searchParams, function (key, value) {
      params[key] = value;
    });
    $.ajax({
      url: api.hostname + 'listObject',
      method: 'get',
      data: {
        token: api.token,
        weChatFlag: 1,
        params: JSON.stringify(params)
      },
      dataType: 'JSON',
      success: function (data) {
        if (api.filterToken(data)) {
          logger('listObject', data);
          successCallback(data.retVal);
        }
      }
    });
  },
  saveObject: function (objType, params, successCallback) {
    params.objType = objType;
    $.ajax({
      url: api.hostname + 'saveObject',
      method: 'post',
      data: {
        token: api.token,
        weChatFlag: 1,
        params: JSON.stringify(params)
      },
      dataType: 'JSON',
      success: function (data) {
        if (api.filterToken(data)) {
          logger('saveObject', data);
          successCallback(data);
        }
      }
    });
  },
  getObject: function (objType, uuid, successCallback) {
    $.ajax({
      url: api.hostname + 'getObject',
      method: 'get',
      data: {
        token: api.token,
        weChatFlag: 1,
        objType: objType,
        uuid: uuid
      },
      dataType: 'JSON',
      success: function (data) {
        if (api.filterToken(data)) {
          logger('getObject', data);
          successCallback(data);
        }
      }
    });
  },
}
// api.login(); // 登录

var iframe = {
  init: function () {
    $(window.parent.document).find("#iframe").load(function () {
      $(this).height($('body').height());
    });
  },
  changeHeight: function () {
    $(window.parent.document).find("#iframe").height($('body').height());
  },
}
iframe.init();

var request = {
  getParam: function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
  }
}

/** 
 * 时间对象的格式化; 
 */
Date.prototype.format = function (format) {
  /* 
   * eg:format="yyyy-MM-dd hh:mm:ss"; 
   */
  var o = {
    "M+": this.getMonth() + 1, // month  
    "d+": this.getDate(), // day  
    "h+": this.getHours(), // hour  
    "m+": this.getMinutes(), // minute  
    "s+": this.getSeconds(), // second  
    "q+": Math.floor((this.getMonth() + 3) / 3), // quarter  
    "S": this.getMilliseconds()
    // millisecond  
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4
      - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1
        ? o[k]
        : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
}

/**
 * 连字符转驼峰式
 */
function dash2Hump(str) {
  return str.replace(/\-(\w)/g, function (x) { return x.slice(1).toUpperCase(); });
}
