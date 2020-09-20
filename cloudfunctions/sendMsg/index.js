//编程小石头微信：2501902696
const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async(event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: event.openid, //要推送给那个用户
      page: 'pages/index/index', //要跳转到那个小程序页面
      data: {//推送的内容
        thing3: {
          value: event.good
        },
        thing1: {
          value: event.status,
          color: event.color
        },
        thing2: {
          value: event.address
        },
        name4: {
          value: event.nickName
        },
        thing6: {
          value: event.describe
        }
      },
      templateId: '6DGzsKqipoPxClnbkvwnxY9GqdXoLordLRdWTjJN1F0' //模板id
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}