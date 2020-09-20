"use strict";
const cloudbase_1 = require("./cloudbase");
const symbol_1 = require("./const/symbol");
module.exports = {
    init: (config) => {
        return new cloudbase_1.CloudBase(config);
    },
    parseContext: (context) => {
        // 校验context 是否正确
        return cloudbase_1.CloudBase.parseContext(context);
    },
    /**
     * 云函数下获取当前env
     */
    SYMBOL_CURRENT_ENV: symbol_1.SYMBOL_CURRENT_ENV
};
