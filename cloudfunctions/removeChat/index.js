// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    await db.collection('rooms').doc(event.id).update({
      data: {
        deleted: 1
      }
    })
    .then(console.log)
    .catch(console.error)
    
  } catch(e) {
    console.error(e)
  }
}