import * as config from '../config.local'

export async function safeCreateCollection(db, name) {
    return db.createCollection(name)
}

export async function safeCollection(db, name) {
    const collection = db.collection(name)
    let num = -1

    // 检查collection是否存在
    try {
        await collection.where({}).get()
    } catch (e) {
        if (e.code === 'DATABASE_COLLECTION_NOT_EXIST') {
            // 不存在
            await db.createCollection(name)
        }
    }

    return {
        async create(data) {
            // await db.createCollection(name)
            const datas = Array.isArray(data) ? data : [data]
            num = datas.length

            let result
            try {
                result = await collection.add(datas)
            } catch (e) {
                // throw e
            }

            // const getRes = await collection.doc(result.id).get()

            if (result.ids.length !== num) {
                throw Error('出现插入数据失败情况了！！')
            }

            return true
        },
        async remove() {
            const result = await collection
                .where({
                    _id: /.*/
                })
                .remove()
            return result.deleted > 0
        }
    }
}

// module.exports = {
//   safeCreateCollection,
//   safeCollection
// }
