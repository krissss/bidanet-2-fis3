"use strict";

__inline('config.js');

// 设置rem的基准
document.getElementsByTagName('html')[0].style.fontSize = window.innerWidth / 10 + 'px';

function logger(msg, data) {
  if (DEBUG) {
    console.log(msg);
    console.log(data);
  }
}

// 取消load-container的滑动
$(document).on("touchmove",function(e) {
   if(e.target.className.indexOf("load-container") >= 0) {
        e.preventDefault();      
    } else {
        e.stopPropagation();     
    }
});

var loader = {
  show: function(){
    $('.load-container',window.top.document).eq(0)
      .css('top', $(window.top.document).scrollTop()) // 下滑一定高度
      .removeClass('hidden');
  },
  hide: function(){
    $('.load-container',window.top.document).eq(0)
      .addClass('hidden');
  }
}

function ajax(url, data, method, successCallback) {
  loader.show();
  $.ajax({
    url: url,
    method: method,
    cache: false,
    data: data,
    dataType: 'JSON',
    timeout : 10000,
    success: function (data) {
      successCallback(data);
      loader.hide();
    },
    complete : function(XMLHttpRequest,status){
      if(status=='timeout'){
        alert("请求超时");
        loader.hide();
      }
    }
  });
}

var api = {
  hostname: API_BASE,
  token: window.localStorage.getItem('token'),
  userInfo: JSON.parse(window.localStorage.getItem('userInfo')),
  openid: USER_OPENID,

  redirectUserPage: function(){
    var userData = api.userInfo,
        href = '';
    if (userData.groupFlag == 1) {
      href = WEB_ROOT + '/zhuake/index.html';
    } else if (userData.groupFlag == 2) {
      href = WEB_ROOT + '/yaoyue/index.html';
    } else if (userData.groupFlag == 3) {
      href = WEB_ROOT + '/menshi/index.html';
    } else {
      href = WEB_ROOT + '/unkonwn';
    }
    window.location.href = href;
  },
  login: function () {
    if (!api.openid) {
      // 清空所有数据
      window.localStorage.clear();
      window.location.href = HOST_FOLDER + '/public/oauth.php';
      return;
    }
    if(!DEBUG){
      if(api.token && api.userInfo && ('openid' in api.userInfo) && api.userInfo.openid == api.openid){
        api.redirectUserPage();
        return;
      }
    }
    ajax(api.hostname + 'login', {
      openid: api.openid,
      weChatFlag: 1,
    }, 'get', function (data) {
      if (data.retMsg == 'OK') {
        logger('login', data.retVal);
        window.localStorage.setItem('token', data.retVal.token);
        api.token = data.retVal.token;
        window.localStorage.setItem('userInfo', JSON.stringify(data.retVal));
        api.userInfo = data.retVal;
        api.redirectUserPage();
      } else {
        if (data.retMsg == 'sysUser不存在!') {
          window.location.href = WEB_ROOT + '/apply/index.html';
        } else {
          alert(data.retMsg);
        }
      }
    });
  },
  changeOnlineState: function(isOnline){
    api.userInfo.isOnline = parseInt(isOnline);
    window.localStorage.setItem('userInfo', JSON.stringify(api.userInfo));
  },
  logout: function(){
    // 清空所有数据
    window.localStorage.clear();
    window.location.href = HOST_FOLDER + '/public/logout.php';
  },
  register: function (params, successCallback) {
    params['weChatFlag'] = 1;
    loader.show();
    $.ajax({
      url: api.hostname + 'register',
      method: 'post',
      cache: false,
      data: params,
      dataType: 'JSON',
      timeout : 10000,
      crossDomain: true, // 如果用到跨域，需要后台开启CORS
      processData: false,  // 注意：不要 process data
      contentType: false,  // 注意：不设置 contentType
      success: function (data) {
        logger('register', data);
        successCallback(data);
        loader.hide();
      },
      complete : function(XMLHttpRequest,status){
        if(status=='timeout'){
          alert("请求超时");
          loader.hide();
        }
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
      // 清空所有数据
      window.localStorage.clear();
      window.top.location.href = WEB_ROOT + '/index.html';
      return false;
    }
    return true;
  },

  listIdAndName: function (objType, searchParams, successCallback, format) {
    searchParams['objType'] = objType;
    searchParams['weChatFlag'] = 1;
    ajax(api.hostname + 'listIdAndName', {
      token: api.token,
      weChatFlag: 1,
      params: JSON.stringify(searchParams)
    }, 'get', function (data) {
      if (api.filterToken(data)) {
        logger('listIdAndName', data);
        if (data.retMsg == 'OK') {
          if(format == undefined || format == true){
            var itemElem = '<option value="">请选择</option>';
            $.each(data.retVal.list, function (index, item) {
              itemElem += '<option value="' + item.uuid + '">' + item.name + '</option>';
            });
            successCallback(itemElem);
          }else{
            successCallback(data.retVal.list);
          }
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
  getSelfData: function (successCallback) {
    ajax(api.hostname + 'getSelfData', {
      token: api.token,
      weChatFlag: 1,
      openid: api.openid,
      seq: 0
    }, 'get', function (data) {
      if (api.filterToken(data)) {
        logger('getSelfData', data);
        successCallback(data);
      }
    });
  },
  returnWorkUser: function (workCenterId, successCallback) {
    ajax(api.hostname + 'returnWorkUser', {
      token: api.token,
      weChatFlag: 1,
      workcenter_id: workCenterId
    }, 'get', function (data) {
      if (api.filterToken(data)) {
        logger('returnWorkUser', data);
        if (data.retMsg == 'OK') {
          var itemElem = '<option value="">请选择</option>';
          $.each(data.retVal, function (index, item) {
            itemElem += '<option value="' + index + '">' + item + '</option>';
          });
          successCallback(itemElem);
        } else {
          alert(data.retMsg);
        }
      }
    });
  },
  getOperationUserAndStatus: function(uuid, successCallback){
    ajax(api.hostname + 'getOperationUserAndStatus', {
      token: api.token,
      weChatFlag: 1,
      uuid: uuid,
    }, 'get', function (data) {
      if (api.filterToken(data)) {
        logger('getOperationUserAndStatus', data);
        if (data.retMsg == 'OK') {
          successCallback(data.retVal);
        } else {
          alert(data.retMsg);
        }
      }
    });
  },
  delMsg: function(seq, successCallback){
    ajax(api.hostname + 'delMsg', {
      token: api.token,
      weChatFlag: 1,
      seq: seq,
    }, 'get', function (data) {
      if (api.filterToken(data)) {
        logger('delMsg', data);
        if (data.retMsg == 'OK') {
          successCallback();
        } else {
          alert(data.retMsg);
        }
      }
    });
  },

  // 获取状态名称
  getStatusName: function (statusCode, validFlag) {
    var msg = '';
    statusCode = parseInt(statusCode);
    switch (statusCode) {
      case 1: msg = '客资新增，待确认'; break;
      case 2: msg = '客资已接收，待报备'; break;
      case 3: msg = '客资已报备，待追踪'; break;
      case 4: 
        if(validFlag == 2){
          msg = '退回，无效';
        }else{
          msg = '退回，等待处理';
        }
        break;
      case 5: msg = '下发到门店，等门市接受'; break;
      case 6: msg = '门市接收，等待到店'; break;
      case 7: msg = '客人未到店，已经改期'; break;
      case 8: msg = '客人未到店，退回再邀约'; break;
      case 9: msg = '客人到店，已经订单'; break;
      case 10: msg = '客人到店，未订单'; break;
      case 11: msg = '客人网络预付，下发到店'; break;
      case 12: msg = '客人预付，门市追踪到店'; break;
      case 13: msg = '客人网络预付订单'; break;
      case 14: msg = '退回，申诉中'; break;
      default: msg = '状态未知'; break;
    }
    return msg;
  },
  getCustomerStatusOptions: function(ids){
    var options = '';
    $.each(ids, function(index, item){
      if(item == -1){
        options += '<option value="'+ item +'">全部</option>'
      }else{
        options += '<option value="'+ item +'">'+ api.getStatusName(item) +'</option>'
      }
    });
    return options;
  },
  // 获取客资标志名称
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
  // 获取格式化的时间
  getFormatDate: function(timestamp, format){
    if(timestamp && timestamp > 0){
      return new Date(timestamp).format(format);
    }
    return '';
  },
  // 将textarea中的\n转<br>进行存储
  getTextAreaShow: function(val){
    if(val){
      return val.replace(/\n/g, '<br />');
    }
    return '';
  },

  goBack: function(){
    //解决Safari中后退功能的兼容问题
    if (navigator.userAgent && /(iPhone|iPad|iPod|Safari)/i.test(navigator.userAgent)) {
      window.location.href = window.document.referrer;
    } else {
      window.history.back(-1);  //根据需要可使用history.go(-1);
    }
  }

}
// api.login(); // 登录

var iframe = {
  init: function () {
    iframe.lastChange();
  },
  changeHeight: function () {
    iframe.lastChange();
  },
  lastChange: function () {
    // 此方法在所有iframe的最里层调用
    var doc = document,
      p = window;
    while (p = p.parent) {
      var frames = p.frames,
        frame,
        i = 0;
        
      while (frame = frames[i++]) {
        // 去除之前设定的高度，解决只能扩增，不能缩减的问题
        frame.frameElement.style.height = 0;
        if (frame.document == doc) {
          frame.frameElement.style.minHeight = '300px';
          frame.frameElement.style.height = doc.body.scrollHeight + 'px'; // 这里一定要注意 火狐必须要加'px' 否则火狐无效 
          doc = p.document;
          break;
        }
      }
      if (p == top) {
        break;
      }
    }
  }
}

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
