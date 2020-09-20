// pages/about/about.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs1: [{
        url: 'tao.jpg',
        name: '是芒果千层呀',
        id: "0"
      },
      {
        url: 'chen.jpg',
        name: '楚利略',
        id: "1"
      },
    ],
    des: '随着人们节约环保的消费意识的增强，在商品极丰富的大学校园里，二手物品交易市场迅速发展。大学生的消费金额限制、其节约意识以及每年大量的新生入学和毕业生离校，给予大学二手交易市场巨大的发展空间。然而我们观察发现，当前校园内的二手交易市场缺乏一个可靠实用的校园交易平台。考虑到微信小程序，方便快捷即用即走，速度快，安全性强等的优点，我们选择它作为交易平台。\n注意：\n本微信小程序只是提供物品交易的平台，不涉及金钱交易！主要服务于大学校园的学生与教师。'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 在页面中定义插屏广告
    let interstitialAd = null

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-dfbad1c323913ca2'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
  },
  
  //图片点击事件
  img: function (event) {
    let arr = [];
    arr.push('https://7461-taoshaoji-46f0r-1302243411.tcb.qcloud.la/appreciate-code/appreciateimg.jpg?sign=7a94d719f891a5b8838fae33a1b79d22&t=1597422871')
    wx.previewImage({
      current: 'current', // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    })
  },
  onReady: function () {

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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})