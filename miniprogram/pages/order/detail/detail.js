const app = getApp()
const db = wx.cloud.database();
const config = require("../../../config.js");
const _ = db.command;
Page({

      /**
       * 页面的初始数据
       */
      data: {
            userinfo: [],
            creatTime: '',
            detail: [],
            status: Number,
            openid: app.openid,
            appreciateCode: '',
            address:'',
            buyerInfo:[]
      },
      onLoad: function (e) {
            if (app.openid) {
                  this.setData({
                        openid: app.openid
                  })
            } else {
                  console.log("no openid");
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
            this.getdetail(e.id);
      },

      //回到首页
      home() {
            wx.switchTab({
                  url: '/pages/index/index',
            })
      },
      //获取订单详情
      getdetail(_id) {
            let that = this;
            db.collection('order').doc(_id).get({
                  success(e) {
                        that.setData({
                              creatTime: config.formTime(e.data.creat),
                              detail: e.data
                        })
                        that.getSeller(e.data.seller);
                  },
                  fail() {
                        wx.showToast({
                              title: '获取失败，请稍后到订单中心内查看',
                              icon: 'none'
                        })
                  }
            })
      },
      //获取卖家信息
      getSeller(m) {
            let that = this;
            db.collection('user').where({
                  _openid: m
            }).get({
                  success: function (res) {
                        wx.hideLoading();
                        that.setData({
                              userinfo: res.data[0]
                        })
                  }
            })

            db.collection('appreciatecode').where({
                  _openid: m
            }).get({
                  success: function (res) {
                        wx.hideLoading();
                        that.setData({
                              appreciateCode: res.data[0].bigImg
                        })
                        console.log(res.data[0].bigImg)
                  }
            })


      },
   
      /**
       * 获取地址
       */
      getAddress() {
            let that = this;
            if (that.data.detail.deliveryid == 0) {
                  that.setData({
                        address: that.data.detail.ztplace
                  })
            } else {
                  that.setData({
                        address: that.data.detail.psplace
                  })
            }
      },
      getBuyerInfo(){
            db.collection('user').where({
                  _openid:app.openid
            }).get().then(res => {
                  this.setData({
                        buyerInfo:res.data[0].info
                  })
            })
      },
      //发送模板消息到指定用户,推送之前要先获取用户的openid
      send() {
            let that = this;
            wx.cloud.callFunction({
                  name: "sendMsg",
                  data: {
                        openid: that.data.detail.seller,
                        status: '买家已确认收货，请确认是否收到钱款', //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；
                        address: that.data.address,
                        describe: that.data.detail.bookinfo.describe,
                        good: that.data.detail.bookinfo.good,
                        nickName: that.data.buyerInfo.nickName,
                  }
            }).then(res => {
                  console.log("推送消息成功", res)
            }).catch(res => {
                  console.log("推送消息失败", res)
            })
      },

      //确认收货
      confirm() {
            let that = this;
            that.getAddress()
            that.getBuyerInfo()
            wx.showModal({
                  title: '温馨提示',
                  content: '您确认已收货吗',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在处理',
                                    duration:1000
                              })
                              wx.cloud.callFunction({
                                    name: 'pay',
                                    data: {
                                          $url: "changeP", //云函数路由参数
                                          _id: that.data.detail.sellid,
                                          status: 5 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款；5、等待卖家确认交易
                                    },
                                    success: res => {
                                          wx.cloud.callFunction({
                                                name: 'pay',
                                                data: {
                                                      $url: "changeO", //云函数路由参数
                                                      _id: that.data.detail._id,
                                                      status: 5 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款；5、等待卖家确认交易
                                                },
                                                success: res => {
                                                      wx.showToast({
                                                            title: '确认收货成功',
                                                            icon:'success',
                                                            duration:1000
                                                          })
                                                      that.send()
                                                      that.getdetail(that.data.detail.sellid)
                                                },
                                                fail(e) {
                                                      wx.hideLoading();
                                                      wx.showToast({
                                                            title: '发生异常，请及时和管理人员联系处理',
                                                            icon: 'none'
                                                      })
                                                }
                                          })
                                    },
                                    fail(e) {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '发生异常，请及时和管理人员联系处理',
                                                icon: 'none'
                                          })
                                    }
                              })
                        }
                  }
            })
      },
      //删除订单
      delete() {
            let that = this;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确认要删除此订单吗',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在处理',
                              })
                              db.collection('order').doc(that.data.detail._id).remove({
                                    success() {
                                          //页面栈返回
                                          let i = getCurrentPages()
                                          wx.navigateBack({
                                                success: function () {
                                                      i[i.length - 2].getlist();
                                                }
                                          });
                                    },
                                    fail: console.error
                              })
                        }
                  }
            })
      },
      //复制
      copy(e) {
            wx.setClipboardData({
                  data: e.currentTarget.dataset.copy,
                  success: res => {
                        wx.showToast({
                              title: '复制' + e.currentTarget.dataset.name + '成功',
                              icon: 'success',
                              duration: 1000,
                        })
                  }
            })
      },
      //历史记录
      history(name, num, type) {
            let that = this;
            db.collection('history').add({
                  data: {
                        stamp: new Date().getTime(),
                        type: type, //1充值2支付
                        name: name,
                        num: num,
                        oid: app.openid
                  },
                  success: function (res) {
                        console.log(res)
                  },
                  fail: console.error
            })
      },

      goo(e) {
            var myid = this.data.openid;
            var sallerid = this.data.detail.seller;
            wx.cloud.init({
                  env: 'taoshaoji-46f0r',
                  traceUser: true
            });
            //初始化数据库
            const db = wx.cloud.database();
            if (myid != sallerid) {
                  db.collection('rooms').where({
                        p_b: myid,
                        p_s: sallerid,
                        deleted :0
                  }).get().then(res => {
                        console.log(res.data);
                        if (res.data.length > 0) {
                              this.setData({
                                    roomID: res.data[0]._id
                              })
                              wx.navigateTo({
                                    url: '/pages/detail/room/room?id=' + this.data.roomID,
                              })
                        } else {
                              db.collection('rooms').add({
                                    data: {
                                          p_b: myid,
                                          p_s: sallerid,
                                          deleted :0
                                    },
                              }).then(res => {
                                    console.log(res)
                                    this.setData({
                                          roomID: res._id
                                    })
                                    wx.navigateTo({
                                          url: '/pages/detail/room/room?id=' + this.data.roomID,
                                    })
                              })
                        }
                  })
            } else {
                  wx.showToast({
                        title: '无法和自己建立聊天',
                        icon: 'none',
                        duration: 1500
                  })
            }
      },

      //图片点击事件
      img: function (event) {
            let arr = [];
            arr.push(this.data.appreciateCode)
            wx.previewImage({
                  current: 'current', // 当前显示图片的http链接
                  urls: arr // 需要预览的图片http链接列表
            })
      },
})