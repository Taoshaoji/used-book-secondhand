import http from 'http'
import { generateTracingInfo } from './tracing'
import * as utils from './utils'
import { ICloudBaseConfig, IRequestInfo, ICustomParam, IReqOpts, IReqHooks } from '../type/index'
import { ERROR } from '../const/code'
import { SYMBOL_CURRENT_ENV } from '../const/symbol'
import { CloudBase } from '../cloudbase'

import { extraRequest } from './request'
import { handleWxOpenApiData } from './requestHook'
import { getWxCloudApiToken } from './getWxCloudApiToken'
import { sign } from '@cloudbase/signature-nodejs'
import URL from 'url'
import { version } from '../../package.json'

const { E, second, processReturn, getServerInjectUrl } = utils

export class Request {
    private args: IRequestInfo
    private config: ICloudBaseConfig
    private defaultEndPoint = 'tcb-admin.tencentcloudapi.com'
    private inScfHost = 'tcb-admin.tencentyun.com'
    // private openApiHost: string = 'tcb-open.tencentcloudapi.com'
    private urlPath = '/admin'
    private defaultTimeout = 15000
    private timestamp: number = new Date().valueOf()
    private tracingInfo: {
        eventId: string
        seqId: string
    } = generateTracingInfo()

    private slowWarnTimer: NodeJS.Timer = null

    // 请求参数
    private params: {[key: string]: any} = {}

    private hooks: IReqHooks = {}

    public constructor(args: IRequestInfo) {
        this.args = args
        this.config = args.config
        this.params = this.makeParams()
    }

    /**
     * 最终发送请求
     */
    public request(): Promise<any> {
        const action = this.getAction()
        const key = {
            functions: 'function_name',
            database: 'collectionName',
            wx: 'apiName',
          }[action.split('.')[0]]

        const argopts: any = this.args.opts || {}
        const config = this.args.config
        const opts = this.makeReqOpts()

        // 注意：必须初始化为 null
        let retryOptions: any = null
        if (argopts.retryOptions) {
            retryOptions = argopts.retryOptions
        }
        else if (config.retries && typeof config.retries === 'number') {
            retryOptions = {retries: config.retries}
        }

        return extraRequest(opts, {
            debug: config.debug,
            op: `${action}:${this.args.params[key]}@${this.params.envName}`,
            seqId: this.getSeqId(),
            retryOptions: retryOptions,
            timingsMeasurerOptions: config.timingsMeasurerOptions || {}
          }).then((response: any) => {
            this.slowWarnTimer && clearTimeout(this.slowWarnTimer)
            const { body } = response
            if (response.statusCode === 200) {
                let res
                try {
                    res = typeof body === 'string' ? JSON.parse(body) : body
                    if (this.hooks && this.hooks.handleData) {
                        res = this.hooks.handleData(res, null, response, body)
                    }
                } catch (e) {
                    res = body
                }
                return res
            } else {
                const e = E({
                    code: response.statusCode,
                    message: ` ${response.statusCode} ${
                        http.STATUS_CODES[response.statusCode]
                    } | [${opts.url}]`
                })
                throw e
            }
        })
    }

    public setHooks(hooks: IReqHooks) {
        Object.assign(this.hooks, hooks)
    }

    public getSeqId(): string {
        return this.tracingInfo.seqId
    }

    /**
     * 接口action
     */
    public getAction(): string {
        const { params } = this.args
        const { action } = params
        return action
    }

    /**
     * 设置超时warning
     */
    public setSlowWarning(timeout: number) {
        const action = this.getAction()
        const { seqId } = this.tracingInfo
        this.slowWarnTimer = setTimeout(() => {
            const msg = `Your current request ${action ||
                ''} is longer than 3s, it may be due to the network or your query performance | [${seqId}]`
            console.warn(msg)
        }, timeout)
    }

    /**
     * 构造params
     */
    public makeParams(): any {
        const args = this.args

        const config = this.config

        const { eventId } = this.tracingInfo

        const params: ICustomParam = {
            ...args.params,
            envName: config.envName,
            eventId,
            // wxCloudApiToken: process.env.WX_API_TOKEN || '',
            wxCloudApiToken: getWxCloudApiToken(),
            // 对应服务端 wxCloudSessionToken
            tcb_sessionToken: process.env.TCB_SESSIONTOKEN || '',
            sessionToken: config.sessionToken,
            sdk_version: version // todo 可去掉该参数
        }

        // 取当前云函数环境时，替换为云函数下环境变量
        if (params.envName === SYMBOL_CURRENT_ENV) {
            params.envName = process.env.TCB_ENV || process.env.SCF_NAMESPACE
        }

        // 过滤value undefined
        utils.filterUndefined(params)

        return params
    }

    /**
     *  构造请求项
     */
    public makeReqOpts(): IReqOpts {
        // 校验密钥是否存在
        this.validateSecretIdAndKey()

        const config = this.config
        const args = this.args
        const url = this.getUrl()
        const method = this.getMethod()
        const params = this.params

        const opts: IReqOpts = {
            url,
            method,
            // 先取模块的timeout，没有则取sdk的timeout，还没有就使用默认值
            // timeout: args.timeout || config.timeout || 15000,
            timeout: this.getTimeout(), // todo 细化到api维度 timeout
            // 优先取config，其次取模块，最后取默认
            headers: this.getHeaders(),
            proxy: config.proxy
        }

        if (config.forever === true) {
            opts.forever = true
        }

        if (args.method === 'post') {
            if (args.isFormData) {
                opts.formData = params
                opts.encoding = null
            } else {
                opts.body = params
                opts.json = true
            }
        } else {
            opts.qs = params
        }

        return opts
    }

    /**
     * 协议
     */
    private getProtocol(): string {
        return this.config.isHttp === true ? 'http' : 'https'
    }

    /**
     * 请求方法
     */
    private getMethod(): string {
        return this.args.method || 'get'
    }

    /**
     * 超时时间
     */
    private getTimeout(): number {
        const { opts = {} } = this.args
        // timeout优先级 自定义接口timeout > config配置timeout > 默认timeout
        return opts.timeout || this.config.timeout || this.defaultTimeout
    }

    /**
     * 校验密钥和token是否存在
     */
    private validateSecretIdAndKey(): void {
        const isInSCF = utils.checkIsInScf()
        const { secretId, secretKey } = this.config
        if (!secretId || !secretKey) {
            // 用户init未传入密钥对，读process.env
            const envSecretId = process.env.TENCENTCLOUD_SECRETID
            const envSecretKey = process.env.TENCENTCLOUD_SECRETKEY
            const sessionToken = process.env.TENCENTCLOUD_SESSIONTOKEN
            if (!envSecretId || !envSecretKey) {
                if (isInSCF) {
                    throw E({
                        ...ERROR.INVALID_PARAM,
                        message: 'missing authoration key, redeploy the function'
                    })
                } else {
                    throw E({
                        ...ERROR.INVALID_PARAM,
                        message: 'missing secretId or secretKey of tencent cloud'
                    })
                }
            } else {
                this.config = {
                    ...this.config,
                    secretId: envSecretId,
                    secretKey: envSecretKey,
                    sessionToken: sessionToken
                }
                return
            }
        }
    }

    /**
     *
     * 获取headers 此函数中设置authorization
     */
    private getHeaders(): any {
        const config = this.config
        const { secretId, secretKey } = config
        const args = this.args
        const method = this.getMethod()
        const isInSCF = utils.checkIsInScf()
        // Note: 云函数被调用时可能调用端未传递 SOURCE，TCB_SOURCE 可能为空
        const TCB_SOURCE = process.env.TCB_SOURCE || ''
        const SOURCE = isInSCF ? `${TCB_SOURCE},scf` : ',not_scf'
        const url = this.getUrl()
        // 默认
        let requiredHeaders = {
            'User-Agent': `tcb-node-sdk/${version}`,
            'x-tcb-source': SOURCE,
            'x-client-timestamp': this.timestamp,
            'X-SDK-Version': `tcb-node-sdk/${version}`,
            Host: URL.parse(url).host
        }

        if (config.version) {
            requiredHeaders['X-SDK-Version'] = config.version
        }

        requiredHeaders = { ...config.headers, ...args.headers, ...requiredHeaders }

        const { authorization, timestamp } = sign({
            secretId: secretId,
            secretKey: secretKey,
            method: method,
            url: url,
            params: this.params,
            headers: requiredHeaders,
            withSignedParams: true,
            timestamp: second() - 1
        })

        requiredHeaders['Authorization'] = authorization
        requiredHeaders['X-Signature-Expires'] = 600
        requiredHeaders['X-Timestamp'] = timestamp

        return { ...requiredHeaders }
    }

    /**
     * 获取url
     * @param action
     */
    private getUrl(): string {
        const protocol = this.getProtocol()
        const isInSCF = utils.checkIsInScf()
        const { eventId, seqId } = this.tracingInfo
        const { customApiUrl } = this.args
        const { serviceUrl } = this.config
        const serverInjectUrl = getServerInjectUrl()

        const defaultUrl = isInSCF
            ? `http://${this.inScfHost}${this.urlPath}`
            : `${protocol}://${this.defaultEndPoint}${this.urlPath}`

        let url = serviceUrl || serverInjectUrl || customApiUrl || defaultUrl

        let urlQueryStr = `&eventId=${eventId}&seqId=${seqId}`
        const scfContext = CloudBase.scfContext
        if (scfContext) {
            urlQueryStr = `&eventId=${eventId}&seqId=${seqId}&scfRequestId=${scfContext.request_id}`
        }

        if (url.includes('?')) {
            url = `${url}${urlQueryStr}`
        } else {
            url = `${url}?${urlQueryStr}`
        }

        return url
    }
}

// 业务逻辑都放在这里处理
export default async (args: IRequestInfo): Promise<any> => {
    const req = new Request(args)
    const config = args.config
    const { action } = args.params

    if (action === 'wx.openApi' || action === 'wx.wxPayApi') {
        req.setHooks({handleData: handleWxOpenApiData})
    }

    if (action.startsWith('database')) {
        req.setSlowWarning(3000)
    }

    try {
        const res = await req.request()
        // 检查res是否为return {code, message}回包
        if (res && res.code) {
            // 判断是否设置config._returnCodeByThrow = false
            return processReturn(config.throwOnCode, res)
        }
        return res
    } finally {
        // 
    }
}
