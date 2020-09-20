import { Db } from '@cloudbase/database'
import { callFunction } from './functions'
import { auth } from './auth'
import { callWxOpenApi, callCompatibleWxOpenApi, callWxPayApi } from './wx'
import { uploadFile, deleteFile, getTempFileURL, downloadFile, getUploadMetadata } from './storage'

import {
    ICloudBaseConfig,
    ICustomReqOpts,
    ICustomErrRes,
    IDeleteFileRes,
    IGetFileUrlRes,
    IDownloadFileRes,
    IUploadFileRes,
    IContext
} from './type'
import { DBRequest } from './utils/dbRequest'
import { Log, logger } from './log'
import { ERROR } from './const/code'
import { E } from './utils/utils'

export class CloudBase {
    public static scfContext: IContext
    public static parseContext(context: IContext): IContext {
        if (typeof context !== 'object') {
            throw E({ ...ERROR.INVALID_CONTEXT, message: 'context 必须为对象类型' })
        }
        let {
            memory_limit_in_mb,
            time_limit_in_ms,
            request_id,
            environ,
            function_version,
            namespace,
            function_name,
            environment
        } = context
        let parseResult: any = {}

        try {
            parseResult.memoryLimitInMb = memory_limit_in_mb
            parseResult.timeLimitIns = time_limit_in_ms
            parseResult.requestId = request_id
            parseResult.functionVersion = function_version
            parseResult.namespace = namespace
            parseResult.functionName = function_name

            // 存在environment 为新架构 上新字段 JSON序列化字符串
            if (environment) {
                parseResult.environment = JSON.parse(environment)
                return parseResult
            }

            // 不存在environment 则为老字段，老架构上存在bug，无法识别value含特殊字符(若允许特殊字符，影响解析，这里特殊处理)

            const parseEnviron = environ.split(';')
            let parseEnvironObj = {}
            for (let i in parseEnviron) {
                // value含分号影响切割，未找到= 均忽略
                if (parseEnviron[i].indexOf('=') >= 0) {
                    const equalIndex = parseEnviron[i].indexOf('=')
                    const key = parseEnviron[i].slice(0, equalIndex)
                    let value: any = parseEnviron[i].slice(equalIndex + 1)

                    // value 含, 为数组
                    if (value.indexOf(',') >= 0) {
                        value = value.split(',')
                    }
                    parseEnvironObj[key] = value
                }
            }

            parseResult.environ = parseEnvironObj
        } catch (err) {
            throw E({ ...ERROR.INVALID_CONTEXT })
        }

        CloudBase.scfContext = parseResult
        return parseResult
    }

    public config: ICloudBaseConfig

    private clsLogger: Log

    public constructor(config?: ICloudBaseConfig) {
        this.init(config)
    }

    public init(config: ICloudBaseConfig = {}): void {
        let {
            debug,
            secretId,
            secretKey,
            sessionToken,
            env,
            proxy,
            timeout,
            serviceUrl,
            version,
            headers = {},
            credentials,
            isHttp,
            throwOnCode,

            forever,
            timingsMeasurerOptions,
            retries
        } = config

        if ((secretId && !secretKey) || (!secretId && secretKey)) {
            throw E({
                ...ERROR.INVALID_PARAM,
                message: 'secretId and secretKey must be a pair'
            })
        }

        const newConfig: ICloudBaseConfig = {
            debug: !!debug,
            secretId: secretId,
            secretKey: secretKey,
            sessionToken: sessionToken,
            envName: env,
            proxy,
            isHttp,
            headers: { ...headers },
            timeout: timeout || 15000,
            serviceUrl,
            credentials,
            version,
            throwOnCode: throwOnCode !== undefined ? throwOnCode : true,

            forever,
            timingsMeasurerOptions,
            retries
        }

        this.config = newConfig
    }

    public database(dbConfig: any = {}): Db {
        Db.reqClass = DBRequest
        // 兼容方法预处理

        if (Object.prototype.toString.call(dbConfig).slice(8, -1) !== 'Object') {
            throw E({ ...ERROR.INVALID_PARAM, message: 'dbConfig must be an object' })
        }

        if (dbConfig && dbConfig.env) {
            // env变量名转换
            dbConfig.envName = dbConfig.env
            delete dbConfig.env
        }
        return new Db({
            ...this.config,
            ...dbConfig
        })
    }

    /**
     * 调用云函数
     *
     * @param param0
     * @param opts
     */
    public callFunction({ name, data }, opts?: ICustomReqOpts): Promise<any> {
        return callFunction(this, { name, data }, opts)
    }

    public auth(): any {
        return auth(this)
    }

    /**
     * openapi调用
     *
     * @param param0
     * @param opts
     */
    public callWxOpenApi({ apiName, requestData }, opts?: ICustomReqOpts): Promise<any> {
        return callWxOpenApi(this, { apiName, requestData }, opts)
    }

    /**
     * wxpayapi调用
     *
     * @param param0
     * @param opts
     */
    public callWxPayApi({ apiName, requestData }, opts?: ICustomReqOpts): Promise<any> {
        return callWxPayApi(this, { apiName, requestData }, opts)
    }

    /**
     * 微信云调用
     *
     * @param param0
     * @param opts
     */
    public callCompatibleWxOpenApi({ apiName, requestData }, opts?: ICustomReqOpts): Promise<any> {
        return callCompatibleWxOpenApi(this, { apiName, requestData }, opts)
    }

    /**
     * 上传文件
     *
     * @param param0
     * @param opts
     */
    public uploadFile({ cloudPath, fileContent }, opts?: ICustomReqOpts): Promise<IUploadFileRes> {
        return uploadFile(this, { cloudPath, fileContent }, opts)
    }

    /**
     * 删除文件
     *
     * @param param0
     * @param opts
     */
    public deleteFile(
        { fileList },
        opts?: ICustomReqOpts
    ): Promise<ICustomErrRes | IDeleteFileRes> {
        return deleteFile(this, { fileList }, opts)
    }

    /**
     * 获取临时连接
     *
     * @param param0
     * @param opts
     */
    public getTempFileURL(
        { fileList },
        opts?: ICustomReqOpts
    ): Promise<ICustomErrRes | IGetFileUrlRes> {
        return getTempFileURL(this, { fileList }, opts)
    }

    /**
     * 下载文件
     *
     * @param params
     * @param opts
     */
    public downloadFile(
        params: { fileID: string; tempFilePath?: string },
        opts?: ICustomReqOpts
    ): Promise<ICustomErrRes | IDownloadFileRes> {
        return downloadFile(this, params, opts)
    }

    /**
     * 获取上传元数据
     *
     * @param param0
     * @param opts
     */
    public getUploadMetadata({ cloudPath }, opts?: ICustomReqOpts): Promise<any> {
        return getUploadMetadata(this, { cloudPath }, opts)
    }

    /**
     * 获取logger
     *
     */
    public logger(): Log {
        if (!this.clsLogger) {
            this.clsLogger = logger()
        }
        return this.clsLogger
    }
}
