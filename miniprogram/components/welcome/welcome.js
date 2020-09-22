const STORAGE1_KEY = 'PLUG-WELCOME-MYAPP-KEY';

Component({
  /**
   * 组件的属性列表
   */
  // properties: {
  //   // 提示文字
  //   text: {
  //     type: String,
  //     value: '点击「添加小程序」，下次访问更便捷 >'
  //   },
  //   // 多少秒后关闭
  //   duration: {
  //     type: Number,
  //     value: 5
  //   }
  // },

  /**
   * 组件的初始数据
   */
  data: {
    SHOW_MODAL:false
  },

  ready: function () {
    // 判断是否已经显示过
    let cache = wx.getStorageSync(STORAGE1_KEY);
    if (cache) return;
    // 没显示过，则进行展示
    this.setData({
      SHOW_MODAL: true
    });
    this.showModal();
  
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 显示全屏添加说明
    showModal: function () {
      this.setData({
        SHOW_MODAL: true
      });
    },

    okHandler: function () {
      this.setData({
        SHOW_MODAL: false
      });
      wx.setStorage({
        key: STORAGE1_KEY,
        data: +new Date,
      });
      wx.requestSubscribeMessage({
        tmplIds: ['6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0','XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q'], //这里填入我们生成的模板id
        success(res) {          
              console.log('授权成功', res)
        },
        fail(res) {
              console.log('授权失败', res)
        }
  })
      wx.navigateTo({
        url: '/pages/help/help',
      })
    }
  },
  
})
