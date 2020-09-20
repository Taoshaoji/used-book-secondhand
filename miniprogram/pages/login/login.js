const db = wx.cloud.database();
const app = getApp();
const config = require("../../config.js");
Page({

      /**
       * 页面的初始数据
       */
      data: {
            ids: -1,
            wxnum: '',
            qqnum: '',
            email: '',
            checked:false,
            campus: JSON.parse(config.data).campus,
      },

      onChange(event) {
            if(event.detail==true){
                  wx.requestSubscribeMessage({
                        tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0','XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
                        success(res) {          
                              console.log('授权成功', res)
                        },
                        fail(res) {
                              console.log('授权失败', res)
                        }
                  })
            }
            this.setData({
              checked: event.detail,
            });
          },

      choose(e) {
            let that = this;
            that.setData({
                  ids: e.detail.value
            })
            //下面这种办法无法修改页面数据
            /* this.data.ids = e.detail.value;*/
      },
      wxInput(e) {
            this.data.wxnum = e.detail.value;
      },
      qqInput(e) {
            this.data.qqnum = e.detail.value;
      },
      emInput(e) {
            this.data.email = e.detail.value;
      },
      getUserInfo(e) {
            let that = this;
            console.log(e);
            let test = e.detail.errMsg.indexOf("ok");
            if (test == '-1') {
                  wx.showToast({
                        title: '请授权后方可使用',
                        icon: 'none',
                        duration: 2000
                  });
            } else {
                  that.setData({
                        userInfo: e.detail.userInfo
                  })
                  that.check();
            }
         
      },
      //校检
      check() {
            let that = this;
           
            //校检校区
            let ids = that.data.ids;
            let campus = that.data.campus;
            if (ids == -1) {
                  wx.showToast({
                        title: '请先获取您的园区',
                        icon: 'none',
                        duration: 2000
                  });
            }
             // 检验授权选项
            let event =that.data.checked;
            if(event==false){
                  wx.showToast({
                        title: '请授权订单提醒',
                        icon: 'none',
                        duration: 2000
                  });
                  return false;
            }
            //校检邮箱
            let email = that.data.email;
            if (!(/^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/.test(email))) {
                  wx.showToast({
                        title: '请输入常用邮箱',
                        icon: 'none',
                        duration: 2000
                  });
                  return false;
            }
            //校检QQ号
            let qqnum = that.data.qqnum;
            if (qqnum !== '') {
                  if (!(/^\s*[.0-9]{5,11}\s*$/.test(qqnum))) {
                        wx.showToast({
                              title: '请输入正确QQ号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            //校检微信号
            let wxnum = that.data.wxnum;
            if (wxnum !== '') {
                  if (!(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(wxnum))) {
                        wx.showToast({
                              title: '请输入正确微信号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
          
            wx.showLoading({
                  title: '正在提交',
            })
            db.collection('user').add({
                  data: {
                        phone: that.data.phone,
                        campus: that.data.campus[that.data.ids],
                        qqnum: that.data.qqnum,
                        email: that.data.email,
                        wxnum: that.data.wxnum,
                        stamp: new Date().getTime(),
                        info: that.data.userInfo,
                        useful: true,
                        parse: 0,
                  },
                  success: function(res) {
                        console.log(res)
                        db.collection('user').doc(res._id).get({
                              success: function(res) {
                                    app.userinfo = res.data;
                                    app.openid = res.data._openid;
                                    wx.navigateBack({})
                              },
                        })
                  },
                  fail() {
                        wx.hideLoading();
                        wx.showToast({
                              title: '注册失败，请重新提交',
                              icon: 'none',
                        })
                  }
            })
      },
        //获取授权的点击事件
        shouquan() {
            wx.requestSubscribeMessage({
                  tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0','XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
                  success(res) {          
                        console.log('授权成功', res)
                  },
                  fail(res) {
                        console.log('授权失败', res)
                  }
            })
      },
})