"use strict";

var api = {
  hostname: 'http://139.224.66.175/wxy/inf/',
  token: window.localStorage.getItem('token'),
  userInfo: JSON.parse(window.localStorage.getItem('userInfo'))
}