"use strict";

var DEBUG = true,
  HOST_FOLDER = '',
  WEB_ROOT = HOST_FOLDER;

function logger(msg, data) {
  if (DEBUG) {
    console.log(msg);
    console.log(data);
  }
}

function ajax(url, data, method, successCallback) {
  $.ajax({
    url: url,
    method: method,
    data: data,
    dataType: 'JSON',
    success: function (data) {
      successCallback(data);
    }
  });
}

var api = {
  //hostname: 'http://139.224.66.175/wxy/inf/',
  hostname: 'http://192.168.0.127:8080/wxy/inf/',
  token: window.localStorage.getItem('token'),
  userInfo: JSON.parse(window.localStorage.getItem('userInfo')),
  openid: 'ox_askdjklqweqwenm2',//window.localStorage.getItem('openid'),
  // 抓客 ox_askdjklqweqwenm
  // 邀约 ox_askdjklqweqwenm2
  // 门市 ox_askdjklqweqwenm3
  login: function () {
    if (!api.openid) {
      window.location.href = HOST_FOLDER + '/public/oauth.php';
      return;
    }
    ajax(api.hostname + 'login', {
      openid: api.openid,
      weChatFlag: 1,
    }, 'get', function (data) {
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
        if (data.retMsg == 'sysUser不存在!') {
          window.location.href = WEB_ROOT + '/apply/index.html';
        } else {
          alert(data.retMsg);
        }
      }
    });
  },
  register: function (params, successCallback) {
    params['weChatFlag'] = 1;
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
    ajax(api.hostname + 'registerInitData', searchParams, 'get', function (data) {
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
      objType: objType,
      weChatFlag: 1
    };
    ajax(api.hostname + 'listIdAndName', {
      token: api.token,
      weChatFlag: 1,
      params: JSON.stringify(params)
    }, 'get', function (data) {
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
    });
  },
  listObject: function (objType, searchParams, pageIndex, pageSize, successCallback) {
    var params = {
      objType: objType,
      pageIndex: pageIndex,
      pageSize: pageSize,
      weChatFlag: 1
    };
    $.each(searchParams, function (key, value) {
      params[key] = value;
    });
    ajax(api.hostname + 'listObject', {
      token: api.token,
      params: JSON.stringify(params)
    }, 'get', function (data) {
      if (api.filterToken(data)) {
        logger('listObject', data);
        successCallback(data.retVal);
      }
    });
  },
  saveObject: function (objType, params, successCallback) {
    params.objType = objType;
    if (objType == 'BusCustomer') {
      params['group_flag'] = api.userInfo.groupFlag;
      params['modify_id'] = api.userInfo.userUuid;
      params['modify_group_flag'] = api.userInfo.groupFlag;
    }
    params['weChatFlag'] = 1;
    ajax(api.hostname + 'saveObject', {
      token: api.token,
      params: JSON.stringify(params)
    }, 'post', function (data) {
      if (api.filterToken(data)) {
        logger('saveObject', data);
        successCallback(data);
      }
    });
  },
  getObject: function (objType, uuid, successCallback) {
    ajax(api.hostname + 'getObject', {
      token: api.token,
      weChatFlag: 1,
      objType: objType,
      uuid: uuid
    }, 'get', function (data) {
      if (api.filterToken(data)) {
        logger('getObject', data);
        successCallback(data);
      }
    });
  },
  delObject: function (objType, uuid, successCallback) {
    ajax(api.hostname + 'delObject', {
      token: api.token,
      weChatFlag: 1,
      objType: objType,
      uuid: uuid
    }, 'get', function (data) {
      if (api.filterToken(data)) {
        logger('delObject', data);
        successCallback(data);
      }
    });
  },

  getStatusName: function (statusCode) {
    var msg = '';
    statusCode = parseInt(statusCode);
    switch (statusCode) {
      case 1: msg = '客资新增，待确认'; break;
      case 2: msg = '客资已报备，待追踪'; break;
      case 3: msg = '客资已报备，待追踪'; break;
      case 4: msg = '退回，无效'; break;
      case 5: msg = '下发到门店，等门市接受'; break;
      case 6: msg = '门市接收，等待到店'; break;
      case 7: msg = '客人未到店，已经改期'; break;
      case 8: msg = '客人未到店，退回再邀约'; break;
      case 9: msg = '客人到店，已经订单'; break;
      case 10: msg = '客人到店，未订单'; break;
      case 11: msg = '客人网络预付，下发到店'; break;
      case 12: msg = '客人预付，门市追踪到店'; break;
      case 13: msg = '客人网络预付订单'; break;
      default: msg = '状态未知'; break;
    }
    return msg;
  },
  getCustomerFlagName: function (customerFlag) {
    var msg = '';
    customerFlag = parseInt(customerFlag);
    switch (customerFlag) {
      case 1: msg = 'A'; break;
      case 2: msg = 'B'; break;
      case 3: msg = 'C'; break;
      case 4: msg = 'D'; break;
      default: msg = '未知'
    }
    return msg;
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
  },
  addParam: function addUrlPara(url, name, value) {
    var currentUrl = url.split('#')[0];
    if (/\?/g.test(currentUrl)) {
      if (/name=[-\w]{4,25}/g.test(currentUrl)) {
        currentUrl = currentUrl.replace(/name=[-\w]{4,25}/g, name + "=" + value);
      } else {
        currentUrl += "&" + name + "=" + value;
      }
    } else {
      currentUrl += "?" + name + "=" + value;
    }
    if (url.split('#')[1]) {
      currentUrl += '#' + url.split('#')[1];
    }
    return currentUrl;
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
