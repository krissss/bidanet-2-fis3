// 添加新客资消息
function addNewCustomer(info, number, id, seq){
  var newObj = $('.template>.new-customer-message-container').eq(0).clone();
  newObj.find('.info').html(info);
  newObj.find('.number').html(number);
  newObj.find('.accept-customer').attr('data-id', id).attr('data-seq', seq);
  $('.map-head').after(newObj);
  iframe.changeHeight();
}

// 添加新客消息
var info, number, id, seq;
api.getSelfData(function(data){
  $.each(data.msgs, function(index, item){
    if(item.msgTypeCode != 1 || item.customer_user_status != 1){ // msgTypeCode 1 为邀约新客待接收
      logger('非新客消息跳过', item);
      return true;
    }
    info = '<p>发送时间：' + new Date(item.countDowmTimeStart).format("yyyy-MM-dd hh:mm") 
    + '</p><p>来源：抓客客服-' + item.uzkName + '</p><p>渠道：' + item.channelName + '-' + item.channelWayName + '</p>';
    // 倒计时 = 倒计时开始时间+规定的接收处理时间-当前时间
    number = parseInt((item.countDowmTimeStart + api.userInfo.accept_delay * 1000 - new Date().getTime())/1000);
    if(number <= 0){
      logger('消息倒计时小于0', number);
      return true;
    }
    id = item.uuid;
    seq = item.seq;
    addNewCustomer(info, number, id, seq);
  });
});

// 接收新客资
function acceptCustomer(uuid, seq){
  api.saveObject('BusCustomer', {
    uuid: uuid,
    seq: seq, // 传递seq 用于删除该条消息
    customer_user_status: 2,
    yycreate_time: new Date().getTime(),
    yytime: new Date().getTime(),
  }, function(data){
    // 接收成功后跳转到详情界面
    window.location.href = 'detail.html?id=' + uuid;
  });
}

// 删除错误的消息
function deleteErrorMsg(seq, msg){
  api.delMsg(seq, function(){
    // 删除成功之后把界面上的隐藏
    msg.parents('.new-customer-message-container').remove();
    iframe.changeHeight();
  });
}

// 点击接收处理
$('body').on('click', '.accept-customer', function(){
  var $this = $(this),
      id = $(this).data('id'),
      seq = $(this).data('seq');
  // 接收前判断客资状态和客资所属人
  api.getOperationUserAndStatus(id, function(data){
    if(data.invite_id == api.userInfo.userUuid && data.customer_user_status == 1){ // 邀约是自己，并且状态是1才可以接收
      acceptCustomer(id, seq);
    }else{
      deleteErrorMsg(seq, $this);
      alert('该客资已被流转，接收失败');
    }
  });
});

// 定时时间处理
setInterval(function(){
  $('.count-down>.number').each(function(){
    var number = parseInt($(this).text());
    if(number == 0){
      $(this).parents('.new-customer-message-container').remove();
      iframe.changeHeight();
    }
    $(this).text(--number);
  });
}, 1000);