import { QueryOption, UpdateOption } from '../query'
import { EJSON } from 'bson'
// import { isObject, isArray, isInternalObject } from './type'
// import { ServerDate } from '../serverDate'
// import { RegExp } from '../regexp'
// import * as Geo from '../geo'
// import { QueryCommand } from '../commands/query'
// import { LogicCommand } from '../commands/logic'
// import { UpdateCommand } from '../commands/update'
// import {
//   SYMBOL_GEO_POINT,
//   SYMBOL_GEO_LINE_STRING,
//   SYMBOL_GEO_POLYGON,
//   SYMBOL_GEO_MULTI_POINT,
//   SYMBOL_GEO_MULTI_LINE_STRING,
//   SYMBOL_GEO_MULTI_POLYGON,
//   SYMBOL_UPDATE_COMMAND,
//   SYMBOL_QUERY_COMMAND,
//   SYMBOL_LOGIC_COMMAND,
//   SYMBOL_SERVER_DATE,
//   SYMBOL_REGEXP
// } from '../helper/symbol'

export const sleep = (ms: number = 0) => new Promise(r => setTimeout(r, ms))

const counters: Record<string, number> = {}

export const autoCount = (domain: string = 'any'): number => {
  if (!counters[domain]) {
    counters[domain] = 0
  }
  return counters[domain]++
}

export const getReqOpts = (apiOptions: QueryOption | UpdateOption): any => {
  // 影响底层request的暂时只有timeout
  if (apiOptions.timeout !== undefined) {
    return {
      timeout: apiOptions.timeout
    }
  }

  return {}
}

export const stringifyByEJSON = params => {
  return EJSON.stringify(params, { relaxed: false })
}

export const parseByEJSON = params => {
  return EJSON.parse(params)
}

export class TcbError extends Error {
  readonly code: string
  readonly message: string
  constructor(error: IErrorInfo) {
    super(error.message)
    this.code = error.code
    this.message = error.message
  }
}

export const E = (errObj: IErrorInfo) => {
  return new TcbError(errObj)
}

export function processReturn(throwOnCode: boolean, res: any) {
  if (throwOnCode === false) {
    // 不抛报错，正常return，兼容旧逻辑
    return res
  }

  throw E({ ...res })
}

interface IErrorInfo {
  code?: string
  message?: string
}
