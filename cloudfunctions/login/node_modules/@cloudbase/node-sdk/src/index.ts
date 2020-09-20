import { CloudBase } from './cloudbase'
import { ICloudBaseConfig, IContext } from './type'
import { SYMBOL_CURRENT_ENV } from './const/symbol'

export = {
    init: (config?: ICloudBaseConfig): CloudBase => {
        return new CloudBase(config)
    },
    parseContext: (context: IContext) => {
        // 校验context 是否正确
        return CloudBase.parseContext(context)
    },
    /**
     * 云函数下获取当前env
     */
    SYMBOL_CURRENT_ENV: SYMBOL_CURRENT_ENV
}
