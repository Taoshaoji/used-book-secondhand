const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async(event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: event.openid, //要推送给那个用户
      page: 'pages/index/index', //要跳转到那个小程序页面
      data: {//推送的内容
        thing1: {
          value: event.nickName
        },
        phrase2: {
          value: event.phrase,
        },
        thing3: {
          value: event.tip
        }
      },
      templateId: 'XXmEjf37meLWQaEsOX6qkkufcVH-YKAL3cHyY9Lru0Q' //模板id
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}