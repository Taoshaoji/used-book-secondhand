const db = wx.cloud.database();
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bigImg: '',
    isExist: Boolean, //如果存在的话就是真，不存在的话就是假
    openid: app.openid
  },
  onLoad() {
    this.getCodeFromSet()
  },

  getCodeFromSet() {
    let that = this;
    let openid = app.openid
    console.log(openid)
    db.collection('appreciatecode').where({
      _openid: openid,
    }).get().then(res => {
      if (res.data.length > 0) {
        that.setData({
          isExist: true,
          bigImg: res.data[0].bigImg
        })
        console.log(res.data[0].bigImg)
        console.log("isExist---->" + that.data.isExist)
      } else {
        that.setData({
          isExist: false,
        })
        console.log("isExist---->" + that.data.isExist)
      }
    })
  },


  changeBigImg() {
    let that = this;
    let openid = app.openid
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        });
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let filePath = res.tempFilePaths[0];
        const name = Math.random() * 1000000;
        const cloudPath = 'appreciate-code/' + app.openid + '/' + name + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath, //云存储图片名字
          filePath, //临时路径
          success: res => {
            console.log('[上传图片] 成功：', res)
            that.setData({
              bigImg: res.fileID, //云存储图片路径,可以把这个路径存到集合，要用的时候再取出来
            });
            let fileID = res.fileID;
            //把图片存到appreciatecode集合表
            const db = wx.cloud.database();
            if (that.data.isExist == false) {
              db.collection("appreciatecode").add({
                data: {
                  bigImg: fileID,
                },
                success: function () {
                  wx.showToast({
                    title: '赞赏码上传成功',
                    'icon': 'none',
                    duration: 3000
                  })
                  console.log("这里是第一次，用add")
                  that.setData({
                    isExist: true
                  })
                },
                fail: function () {
                  wx.showToast({
                    title: '赞赏码上传失败',
                    'icon': 'none',
                    duration: 3000
                  })
                }
              });
            } else {
              db.collection("appreciatecode").where({
                _openid: openid
              }).update({
                data: {
                  bigImg: fileID,
                },
                success: function () {
                  wx.showToast({
                    title: '赞赏码上传成功',
                    'icon': 'none',
                    duration: 3000
                  })
                  console.log("这里是第二次，用update")
                },
                fail: function () {
                  wx.showToast({
                    title: '赞赏码上传失败',
                    'icon': 'none',
                    duration: 3000
                  })
                }
              });
            }
          },
          fail: e => {
            console.error('[上传图片] 失败：', e)
          },
          complete: () => {
            wx.hideLoading()
          }
        });
      }
    })
  },
})