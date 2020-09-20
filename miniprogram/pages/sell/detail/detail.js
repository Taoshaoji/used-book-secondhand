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
      //获取订单详情,差一个获取买家昵称
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
      },

      //确认收货
      confirm() {
            let that = this;
            wx.showModal({
                  title: '温馨提示',
                  content: '您确定要此条订单完成了吗？',
                  success(res) {
                        if (res.confirm) {
                              wx.showLoading({
                                    title: '正在处理',
                              })
                              wx.cloud.callFunction({
                                    name: 'pay',
                                    data: {
                                          $url: "changeP", //云函数路由参数
                                          _id: that.data.detail.sellid,
                                          status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                    },
                                    success: res => {
                                          console.log('修改订单状态成功')
                                          wx.cloud.callFunction({
                                                name: 'pay',
                                                data: {
                                                      $url: "changeO", //云函数路由参数
                                                      _id: that.data.detail._id,
                                                      status: 2 //0在售；1买家已付款，但卖家未发货；2买家确认收获，交易完成；3、交易作废，退还买家钱款
                                                },
                                                success: res => {
                                                      wx.showToast({
                                                            title: '交易成功！',
                                                            icon: 'none'
                                                      })
                                                      that.getdetail(that.data.detail._id);
                                                      wx.showModal({
                                                            title: '打赏小程序',
                                                            content: '请开发者喝阔落？',
                                                            showCancel: true, 
                                                            cancelText:'下次一定',
                                                            confirmText:'现在就去',
                                                            confirmColor: '#fbbd08', 
                                                            success(res) {
                                                                  if (res.confirm) {
                                                                        wx.previewImage({
                                                                              urls: ['https://7461-taoshaoji-46f0r-1302243411.tcb.qcloud.la/appreciate-code/appreciateimg.jpg?sign=b6789b4ae3b6c830689f41ddca8f183e&t=1597523262'],
                                                                        })
                                                                  }
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
                              db.collection('publish').doc(that.data.detail._id).remove({
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
            var myid = this.data.detail.buyerInfo._openid;
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

})