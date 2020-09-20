var app = getApp();
const config = require("../../config.js");

Page({

      /**
       * 页面的初始数据
       */
      data: {
            weixin: JSON.parse(config.data).kefu.weixin,
            qq: JSON.parse(config.data).kefu.qq,
            gzh: JSON.parse(config.data).kefu.gzh,
            phone: JSON.parse(config.data).kefu.phone,
            banner: "/images/kefu.jpg",
           img:['https://7461-taoshaoji-46f0r-1302243411.tcb.qcloud.la/gzh/%E6%89%AB%E7%A0%81_%E6%90%9C%E7%B4%A2%E8%81%94%E5%90%88%E4%BC%A0%E6%92%AD%E6%A0%B7%E5%BC%8F-%E7%99%BD%E8%89%B2%E7%89%88.png?sign=4419b51be1d0c768dbbc95273f956fec&t=1597217797',]
      },
      onLoad() {

      },

      //复制
      copy(e) {
            wx.setClipboardData({
                  data: e.currentTarget.dataset.copy,
                  success: res => {
                        wx.showToast({
                              title: '复制' + e.currentTarget.dataset.name+'成功',
                              icon: 'success',
                              duration: 1000,
                        })
                  }
            })
      },
      //预览图片
      preview(e) {
            wx.previewImage({
                  current: 'current', // 当前显示图片的http链接
                  urls:this.data.img// 需要预览的图片http链接列表
                })
      },
})