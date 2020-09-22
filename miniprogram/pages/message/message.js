const app = getApp()
var time = require('../../utils/util.js');
const db = wx.cloud.database();
Page({

  data: {
    roomlist: [],
    openid: '',
    myNickName: '',

  },

  onLoad: function (_options) {
    wx.stopPullDownRefresh({
      success: (res) => {
        console.log(res)
      },
    })
    this.init_charList()
    this.setData({
      openid: app.openid,
      roomlist: app.roomlist
    })
    if (!app.openid) {
      wx.showModal({
        title: '温馨提示',
        content: '该功能需要注册方可使用，是否马上去注册',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
      return false
    }
    console.log("输出列表用户信息")
    wx.cloud.init({
      env: 'taoshaoji-46f0r',
      traceUser: true
    });
    //初始化数据库
    const db = wx.cloud.database();
    var list = this.data.roomlist;
    var that = this;
    console.log(list);
    for (var i = 0; i < list.length; i++) {
      (function (i) {
        db.collection('user').where({
          _openid: list[i].openid
        }).get().then(res => {
          console.log(res.data[0]);
          list[i].image = res.data[0].info.avatarUrl;
          list[i].name = res.data[0].info.nickName;
          //list[i].name = res.data[0]._id;
          that.setData({
            roomlist: list
          })
          console.log(list);
        })
      })(i);
    }
  },
  /*
  页面初始化
  */
  init_charList() {

    var myid = this.data.openid;
    var list = []
    wx.cloud.init({
      env: 'taoshaoji-46f0r',
      traceUser: true
    });
    //初始化数据库
    const db = wx.cloud.database();

    console.log("enter A");
    db.collection('rooms').where({
      p_s: myid,
      deleted: 0
    }).get().then(res => {
      console.log(res.data);
      console.log("1111111111111111111");
      if (res.data.length > 0) {
        for (var i = 0; i < res.data.length; i++) {
          var dia = new Object();
          dia.roomid = res.data[i]._id;
          dia.openid = res.data[i].p_b;
          dia.time = "";
          dia.cha = "买家:";
          dia.name = "";
          dia.image = "";
          list.push(dia);
          console.log(list);
          console.log("list111111111111");
        }
        app.roomlist = list;
      }
    })

    db.collection('rooms').where({
      p_b: myid,
      deleted: 0
    }).get().then(res => {
      console.log(res.data);
      if (res.data.length > 0) {
        for (var i = 0; i < res.data.length; i++) {
          var dia = new Object();
          dia.roomid = res.data[i]._id;
          dia.openid = res.data[i].p_s;
          dia.time = "";
          dia.cha = "卖家:";
          dia.name = "";
          dia.image = "";
          list.push(dia);
        }
        app.roomlist = list;
      }
    })
  },

  /**
   * 删除按钮事件
   */
  slideButtonTap(e) {
    var that = this
    console.log('slide button tap', e)
    wx.showModal({
      title: '提示',
      content: '是否确认删除',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中..',
          })
          console.log('用户点击确定')
          wx.cloud.callFunction({
            name: 'removeChat',
            data: {
              id: e.currentTarget.dataset.delid
            },
            success: res => {
              console.log('[云函数] [removeChat] 调用成功: ', res)

              wx.showToast({
                title: '删除成功',
              })
              wx.startPullDownRefresh()

            },
            fail: err => {
              console.error('[云函数] [removeChat] 调用失败', err)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  findtime() {
    console.log("111111111111111111111111111");
    wx.cloud.init({
      env: 'taoshaoji-46f0r',
      traceUser: true
    });
    //初始化数据库
    const db = wx.cloud.database();
    var list = this.data.roomlist;
    var that = this;
    console.log(list);
    for (var i = 0; i < list.length; i++) {
      (function (i) {
        db.collection('chatroom').where({
          groupId: list[i].roomid,
          deleted: 0
        }).get().then(res => {
          console.log("输出聊天数据" + res.data.length);
          console.log(res.data);
          // list[i].time = time.formatTime(res.data[res.data.length - 1].sendTime);
          list[i].time = res.data[res.data.length - 1].sendTimeTS;
          that.setData({
            roomlist: list
          })
          console.log(list);
        })

      })(i);
    }
  },
  timesort() {
    this.data.roomlist.sort(function (a, b) {
      if (a.time > b.time) {
        console.log("");
        return -1;
      } else if (a.time == b.time) {
        console.log("不变变");
        return 0;
      } else {
        console.log("我也不变变");
        return 1;
      }

    });
    var test1 = setTimeout(this.changetime, "1000");

  },
  changetime() {
    var list = this.data.roomlist
    for (var i = 0; i < list.length; i++) {
      console.log("改格式" + time.formatTime(list[i].time, 'Y/M/D h:m:s'));
      list[i].time = time.formatTime(list[i].time, 'Y/M/D h:m:s');
    }
    this.setData({
      roomlist: list
    })
  },
  go(e) {
    wx.navigateTo({
      url: '../detail/room/room?id=' + e.currentTarget.dataset.id,
    })
  },
  onShow() {
    this.init_charList()
  },
  //下拉刷新
  onPullDownRefresh() {
    this.onLoad();
  },


  getMyNickName() {
    console.log("调用了getMyNickName")
    let that = this;
    var myopenid = app.openid
    db.collection('user').where({
      _openid: myopenid
    }).get().then(res => {
      that.setData({
        myNickName: res.data[0]
      })
      console.log("res.data.info.nickName:" + res.data[0])
    })
  },


  sendTip(e) {
    let that = this;
    that.onChange()
    that.getMyNickName()
    wx.showModal({
      title: '温馨提示',
      content: '您确定要发送消息通知提醒对方和你聊天吗？',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "sendTip",
            data: {
              openid: e.currentTarget.dataset.opid,
              nickName: that.data.myNickName.info.nickName,
              tip: "快去消息中心看看吧！"
            }
          }).then(res => {
            wx.showToast({
              title: '提醒成功',
              icon: 'success',
              duration: 2000
            })
            console.log("推送消息成功", res)
            console.log(e.currentTarget.dataset.id)
          }).catch(res => {
            console.log("推送消息失败", res)
          })
        }
      }
    })
  },


  onChange() {
    wx.requestSubscribeMessage({
      tmplIds: ['XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
      success(res) {
        console.log('授权成功', res)
      },
      fail(res) {
        console.log('授权失败', res)
      }
    })
  },
})