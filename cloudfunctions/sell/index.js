// 云函数入口文件
const cloud = require('wx-server-sdk')
  
cloud.init()
  
const db = cloud.database()
const _ = db.command
  
// 云函数入口函数
exports.main = async (event, _context) => {
 try {
  return await db.collection('order').doc(event._id).update({
   // data 传入需要局部更新的数据
   data: {
      status:event.status
   }
  })
 } catch (e) {
  console.error(e)
 }
}