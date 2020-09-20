"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudBase = void 0;
const database_1 = require("@cloudbase/database");
const functions_1 = require("./functions");
const auth_1 = require("./auth");
const wx_1 = require("./wx");
const storage_1 = require("./storage");
const dbRequest_1 = require("./utils/dbRequest");
const log_1 = require("./log");
const code_1 = require("./const/code");
const utils_1 = require("./utils/utils");
class CloudBase {
    constructor(config) {
        this.init(config);
    }
    static parseContext(context) {
        if (typeof context !== 'object') {
            throw utils_1.E(Object.assign(Object.assign({}, code_1.ERROR.INVALID_CONTEXT), { message: 'context 必须为对象类型' }));
        }
        let { memory_limit_in_mb, time_limit_in_ms, request_id, environ, function_version, namespace, function_name, environment } = context;
        let parseResult = {};
        try {
            parseResult.memoryLimitInMb = memory_limit_in_mb;
            parseResult.timeLimitIns = time_limit_in_ms;
            parseResult.requestId = request_id;
            parseResult.functionVersion = function_version;
            parseResult.namespace = namespace;
            parseResult.functionName = function_name;
            // 存在environment 为新架构 上新字段 JSON序列化字符串
            if (environment) {
                parseResult.environment = JSON.parse(environment);
                return parseResult;
            }
            // 不存在environment 则为老字段，老架构上存在bug，无法识别value含特殊字符(若允许特殊字符，影响解析，这里特殊处理)
            const parseEnviron = environ.split(';');
            let parseEnvironObj = {};
            for (let i in parseEnviron) {
                // value含分号影响切割，未找到= 均忽略
                if (parseEnviron[i].indexOf('=') >= 0) {
                    const equalIndex = parseEnviron[i].indexOf('=');
                    const key = parseEnviron[i].slice(0, equalIndex);
                    let value = parseEnviron[i].slice(equalIndex + 1);
                    // value 含, 为数组
                    if (value.indexOf(',') >= 0) {
                        value = value.split(',');
                    }
                    parseEnvironObj[key] = value;
                }
            }
            parseResult.environ = parseEnvironObj;
        }
        catch (err) {
            throw utils_1.E(Object.assign({}, code_1.ERROR.INVALID_CONTEXT));
        }
        CloudBase.scfContext = parseResult;
        return parseResult;
    }
    init(config = {}) {
        let { secretId, secretKey, sessionToken, env, proxy, timeout, serviceUrl, version, headers = {}, credentials, isHttp, throwOnCode } = config;
        if ((secretId && !secretKey) || (!secretId && secretKey)) {
            throw utils_1.E(Object.assign(Object.assign({}, code_1.ERROR.INVALID_PARAM), { message: 'secretId and secretKey must be a pair' }));
        }
        const newConfig = {
            secretId: secretId,
            secretKey: secretKey,
            sessionToken: sessionToken,
            envName: env,
            proxy,
            isHttp,
            headers: Object.assign({}, headers),
            timeout: timeout || 15000,
            serviceUrl,
            credentials,
            version,
            throwOnCode: throwOnCode !== undefined ? throwOnCode : true
        };
        this.config = newConfig;
    }
    database(dbConfig = {}) {
        database_1.Db.reqClass = dbRequest_1.DBRequest;
        // 兼容方法预处理
        if (Object.prototype.toString.call(dbConfig).slice(8, -1) !== 'Object') {
            throw utils_1.E(Object.assign(Object.assign({}, code_1.ERROR.INVALID_PARAM), { message: 'dbConfig must be an object' }));
        }
        if (dbConfig && dbConfig.env) {
            // env变量名转换
            dbConfig.envName = dbConfig.env;
            delete dbConfig.env;
        }
        return new database_1.Db(Object.assign(Object.assign({}, this.config), dbConfig));
    }
    /**
     * 调用云函数
     *
     * @param param0
     * @param opts
     */
    callFunction({ name, data }, opts) {
        return functions_1.callFunction(this, { name, data }, opts);
    }
    auth() {
        return auth_1.auth(this);
    }
    /**
     * openapi调用
     *
     * @param param0
     * @param opts
     */
    callWxOpenApi({ apiName, requestData }, opts) {
        return wx_1.callWxOpenApi(this, { apiName, requestData }, opts);
    }
    /**
     * wxpayapi调用
     *
     * @param param0
     * @param opts
     */
    callWxPayApi({ apiName, requestData }, opts) {
        return wx_1.callWxPayApi(this, { apiName, requestData }, opts);
    }
    /**
     * 微信云调用
     *
     * @param param0
     * @param opts
     */
    callCompatibleWxOpenApi({ apiName, requestData }, opts) {
        return wx_1.callCompatibleWxOpenApi(this, { apiName, requestData }, opts);
    }
    /**
     * 上传文件
     *
     * @param param0
     * @param opts
     */
    uploadFile({ cloudPath, fileContent }, opts) {
        return storage_1.uploadFile(this, { cloudPath, fileContent }, opts);
    }
    /**
     * 删除文件
     *
     * @param param0
     * @param opts
     */
    deleteFile({ fileList }, opts) {
        return storage_1.deleteFile(this, { fileList }, opts);
    }
    /**
     * 获取临时连接
     *
     * @param param0
     * @param opts
     */
    getTempFileURL({ fileList }, opts) {
        return storage_1.getTempFileURL(this, { fileList }, opts);
    }
    /**
     * 下载文件
     *
     * @param params
     * @param opts
     */
    downloadFile(params, opts) {
        return storage_1.downloadFile(this, params, opts);
    }
    /**
     * 获取上传元数据
     *
     * @param param0
     * @param opts
     */
    getUploadMetadata({ cloudPath }, opts) {
        return storage_1.getUploadMetadata(this, { cloudPath }, opts);
    }
    /**
     * 获取logger
     *
     */
    logger() {
        if (!this.clsLogger) {
            this.clsLogger = log_1.logger();
        }
        return this.clsLogger;
    }
}
exports.CloudBase = CloudBase;
