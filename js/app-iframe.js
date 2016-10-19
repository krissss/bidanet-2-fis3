var api = {
  hostname: 'http://183.240.86.109/wxy/inf/',
  token: window.localStorage.getItem('token'),
  userInfo: JSON.parse(window.localStorage.getItem('userInfo')),
  login: function () {
    $.ajax({
      url: api.hostname + 'login',
      method: 'get',
      data: {
        userName: '抓客用户B',
        passwd: '111111',
        companyName: '测试公司'
      },
      dataType: 'JSON',
      success: function (data) {
        if (data.retMsg == 'OK') {
          window.localStorage.setItem('token', data.retVal.token);
          console.log(data.retVal);
          window.localStorage.setItem('userInfo', JSON.stringify(data.retVal));
        } else {
          alert(data.retMsg);
        }
      }
    });
  },
  
  filterToken: function (data) {
    if (data.retMsg == 'Token is invalid') {
      window.location.href = '/'
    }
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
        api.filterToken(data);
        var itemElem = '<option value="">请选择</option>';
        $.each(data.retVal.list, function (key, value) {
          itemElem += '<option value="' + value.uuid + '">' + value.name + '</option>';
        });
        successCallback(itemElem);
      }
    });
  },
  listObject: function (objType, searchParams, pageIndex, pageSize, successCallback) {
    var params = {
      objType: objType,
      pageIndex: pageIndex,
      pageSize: pageSize
    };
    $.each(searchParams, function(key, value){
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
        api.filterToken(data);
        // console.log(data);
        successCallback(data.retVal);
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
        api.filterToken(data);
        successCallback(data);
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
        api.filterToken(data);
        successCallback(data);
      }
    });
  },
}
//api.login();

var iframe = {
  init: function () {
    $(window.parent.document).find("#iframe").load(function(){
      $(this).height($('body').height());
    });
  },
  changeHeight: function () {
    $(window.parent.document).find("#iframe").height($('body').height());
  },
}
iframe.init();

var request = {
  getParam: function getUrlParam(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r!=null) return unescape(r[2]); return null; //返回参数值
  } 
}

/** 
 * 时间对象的格式化; 
 */  
Date.prototype.format = function(format) {  
    /* 
     * eg:format="yyyy-MM-dd hh:mm:ss"; 
     */  
    var o = {  
        "M+" : this.getMonth() + 1, // month  
        "d+" : this.getDate(), // day  
        "h+" : this.getHours(), // hour  
        "m+" : this.getMinutes(), // minute  
        "s+" : this.getSeconds(), // second  
        "q+" : Math.floor((this.getMonth() + 3) / 3), // quarter  
        "S" : this.getMilliseconds()  
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
function dash2Hump(str){
  return str.replace(/\-(\w)/g, function(x){return x.slice(1).toUpperCase();});
}
