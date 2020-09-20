const app = getApp();
const config = require("../../config.js");
Page({

      /**
       * 页面的初始数据
       */
      data: {
            showShare: false,
            poster: JSON.parse(config.data).share_poster,
            username: '',
            openid: '',
            roomlist: []
      },
      onShow() {
            this.setData({
                  userinfo: app.userinfo
            })
      },
      onLoad: function (options) {
            this.setData({
                  openid: app.openid
            })
        
      },
      goo() {
            console.log(app.roomlist);
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
            }else{
                  wx.navigateTo({
                        url: '../message/message',
                  })
            }

      },
      go(e) {
            if (e.currentTarget.dataset.status == '1') {
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
            }
            wx.navigateTo({
                  url: e.currentTarget.dataset.go
            })
      },
      //展示分享弹窗
      showShare() {
            this.setData({
                  showShare: true
            });
      },
      //关闭弹窗
      closePop() {
            this.setData({
                  showShare: false,
            });
      },
      //预览图片
      preview(e) {
            
            wx.previewImage({
                  urls: e.currentTarget.dataset.link.split(",")
            });
      },
      onShareAppMessage() {
            return {
                  title: JSON.parse(config.data).share_title,
                  imageUrl: JSON.parse(config.data).share_img,
                  path: '/pages/start/start'
            }

      },
      // 用户点击右上角分享给好友,要先在分享好友这里设置menus的两个参数,才可以分享朋友圈
	onShareAppMessage: function() {
		wx.showShareMenu({
	      withShareTicket: true,
	      menus: ['shareAppMessage', 'shareTimeline']
	    })
	},
	//用户点击右上角分享朋友圈
	onShareTimeline: function () {
		return {
	      title: '',
	      query: {
	        key: value
	      },
	      imageUrl: ''
	    }
	},
      //获取授权的点击事件
      shouquan() {
            wx.requestSubscribeMessage({
                  tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0'], //这里填入我们生成的模板id
                  success(res) {          
                        console.log('授权成功', res)
                  },
                  fail(res) {
                        console.log('授权失败', res)
                  }
            })
      },
})