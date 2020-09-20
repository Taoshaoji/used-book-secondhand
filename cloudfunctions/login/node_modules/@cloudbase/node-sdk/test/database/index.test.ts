import * as assert from 'power-assert'
import * as Mock from './unit/mock'
import tcb from '../../src/index'
import * as config from '../config.local'
import * as common from '../common/index'
import { ERROR } from '../../src/const/code'

describe('test/index.test.ts', async () => {
    const app = tcb.init({
        ...config,
        // env: Mock.env,
        // mpAppId: Mock.appId,
        sessionToken: undefined,
        throwOnCode: false
    })

    let db = null

    try {
        db = app.database('env')
    } catch (err) {
        assert(err.code === ERROR.INVALID_PARAM.code)
    }

    const currEnv = tcb.SYMBOL_CURRENT_ENV
    // 线上跑，本地不用跑

    // if (currEnv) {
    //     if (checkIsGray()) {
    //         db = app.database({ env: currEnv })
    //     } else {
    //         db = app.database()
    //     }
    // } else {
    //     db = app.database()
    // }

    db = app.database()

    const _ = db.command

    const collName = 'coll-1'
    const collection = db.collection(collName)
    // const nameList = ['f', 'b', 'e', 'd', 'a', 'c']

    // it('Document - createCollection()', async () => {
    //     await common.safeCreateCollection(db, collName)
    // })

    const initialData = {
        name: 'aaa',
        array: [1, 2, 3, [4, 5, 6], { a: 1, b: { c: 'fjasklfljkas', d: false } }],
        data: {
            a: 'a',
            b: 'b',
            c: 'c'
        },
        null: null,
        date: new Date(),
        // regex: new db.RegExp({
        //     regexp: '.*',
        //     options: 'i'
        // }),
        deepObject: {
            'l-02-01': {
                'l-03-01': {
                    'l-04-01': {
                        level: 1,
                        name: 'l-01',
                        flag: '0'
                    }
                }
            }
        }
    }

    it('验证throwOnCode', async () => {
        const res = await collection.add({ $_key: 1 })
        console.log(res)
    })

    it('mock 插入多条', async () => {
        // 构建4W条数据
        let mockData = [],
            i = 0
        while (i++ < 10) {
            mockData.push({ string: 'a', int: -1 })
        }

        const addRes = await collection.add(mockData)
        assert(addRes.ids.length === 10)
        // console.log('addRes:', addRes)
    })

    it('清楚mock数据', async () => {
        const deleteRes = await collection.where({ int: -1 }).remove()
        console.log('deleteRes:', deleteRes)
    })

    it('验证 无 query count', async () => {
        const countRes = await collection.count()
        assert(countRes.total >= 0)
        console.log('countRes:', countRes)
    })

    it('验证 无 query update', async () => {
        const updateRes = await collection.update({ a: 1 })
        assert(updateRes.code === 'INVALID_PARAM')
    })

    it('document query custom timeout', async () => {
        const res = await collection
            .where({})
            // .options({ timeout: 3000 })
            .limit(1)
            .get()
        console.log(res)
    })

    it('Document - CRUD', async () => {
        // Create
        const initialData = {
            // $key: '1',
            'key.': '1'
        }
        const res = await collection.add(initialData)
        console.log('res:', res)
        console.log(res)
        // assert(res.ids.length > 0)
        assert(res.id)
        assert(res.requestId)

        // Read
        // const { ids } = res
        // const id = ids[0]
        const id = res.id
        // let result = await collection
        //   .where({
        //     _id: id
        //   })
        //   .get()
        // console.log(result)
        // assert.deepStrictEqual(result.data[0].name, initialData.name)
        // assert.deepStrictEqual(result.data[0].array, initialData.array)
        // assert.deepStrictEqual(result.data[0].deepObject, initialData.deepObject)

        // // 搜索某个字段为 null 时，应该复合下面条件的都应该返回：
        // // 1. 这个字段严格等于 null
        // // 2. 这个字段不存在
        // // docs: https://docs.mongodb.com/manual/tutorial/query-for-null-fields/
        // result = await collection
        //   .where({
        //     fakeFields: _.or(_.eq(null))
        //   })
        //   .get()
        // assert(result.data.length > 0)

        // const doc = await collection.doc(id).get()
        // assert.deepStrictEqual(doc.data[0].name, initialData.name)
        // assert.deepStrictEqual(doc.data[0].array, initialData.array)
        // assert.deepStrictEqual(doc.data[0].deepObject, initialData.deepObject)

        // // // Update(TODO)
        // result = await collection
        //   .where({
        //     _id: id
        //   })
        //   .update({
        //     name: 'bbb',
        //     array: [{ a: 1, b: 2, c: 3 }]
        //   })
        // console.log(result)
        // assert(result.updated > 0)

        let result = await collection
            .where({
                _id: id
            })
            .update({
                data: { a: null, b: null, c: null }
            })
        console.log(result)
        assert(result.updated > 0)

        result = await collection.where({ _id: id }).get()
        console.log(result.data)
        assert(result.data[0])
        assert.deepStrictEqual(result.data[0].data, { a: null, b: null, c: null })

        // 数组变为对象，mongo会报错
        // result = await collection
        //   .where({
        //     _id: id
        //   })
        //   .update({
        //     array: { foo: 'bar' }
        //   })
        // console.log(result)
        // assert.strictEqual(result.code, 'DATABASE_REQUEST_FAILED')

        // result = await collection
        //   .where({
        //     _id: id
        //   })
        //   .get()
        // console.log(result)
        // assert.deepStrictEqual(result.data[0].array, [{ a: 1, b: 2, c: 3 }])

        // Delete
        const deleteRes = await collection.doc(id).remove()
        assert.strictEqual(deleteRes.deleted, 1)
    })

    it('Document - query', async () => {
        assert((await collection.add({ a: 1, b: 100 })).id)
        assert((await collection.add({ a: 10, b: 1 })).id)
        const query = _.or({ b: _.and(_.gte(1), _.lte(10)) }, { b: _.and(_.gt(99), _.lte(101)) })
        const result = await collection.where(query).get()
        assert(result.data.length >= 2)

        // Delete
        const deleteRes = await collection.where(query).remove()
        assert(deleteRes.deleted, 2)
    })

    it('复合and', async () => {
        const result = await collection
            .where({
                date: _.gt(20190401).and(_.lte(20190430)),
                hour: _.gt(8).and(_.lte(12))
            })
            .get()

        console.log(result)
        assert(!result.code)
    })

    it('验证自定义超时', async () => {
        try {
            const result = await collection
                .where({
                    date: _.gt(20190401).and(_.lte(20190430)),
                    hour: _.gt(8).and(_.lte(12))
                })
                .options({ timeout: 10 })
                .get()
        } catch (err) {
            assert(err.code === 'ESOCKETTIMEDOUT')
        }
    })

    it('Document - doc().update()', async () => {})

    // option更新单个 or 多个
    it('Document - doc().option().update()', async () => {
        const addRes = await collection.add([{ testNum: 1 }, { testNum: 1 }, { testNum: 1 }])
        assert(addRes.ids.length === 3)
        const updateSingleRes = await collection
            .where({ testNum: 1 })
            .options({ multiple: false })
            .update({ testNum: _.inc(1) })
        console.log('updateSingleRes:', updateSingleRes)
        assert(updateSingleRes.updated === 1)

        const updateMultiRes = await collection
            .where({ testNum: _.gt(0) })
            .options({ multiple: true })
            .update({ testNum: _.inc(1) })
        console.log('updateMultiRes:', updateMultiRes)
        // assert(updateSingleRes.updated === 3)

        // 不传multiple字段
        const updateMultiRes1 = await collection
            .where({ testNum: _.gt(0) })
            .options({})
            .update({ testNum: _.inc(1) })
        console.log('updateMultiRes1:', updateMultiRes1)
        // assert(updateSingleRes.updated === 3)

        // 不设options
        const updateMultiRes2 = await collection
            .where({ testNum: _.gt(0) })
            .options({})
            .update({ testNum: _.inc(1) })
        console.log('updateMultiRes2:', updateMultiRes2)
        // assert(updateSingleRes.updated === 3)
    })

    // options 删除单个 or 多个
    it('Document - doc().option().delete()', async () => {
        const deleteSingleRes = await collection
            .where({ testNum: _.gt(0) })
            .options({ multiple: false })
            .remove()

        console.log('deleteSingleRes:', deleteSingleRes)
        assert(deleteSingleRes.deleted === 1)

        const deleteMultiRes = await collection
            .where({ testNum: _.gt(0) })
            // .options({ multiple: true })
            .options({})
            .remove()
        console.log('deleteMultiRes:', deleteMultiRes)
        assert(deleteMultiRes.deleted === 2)
    })
})
