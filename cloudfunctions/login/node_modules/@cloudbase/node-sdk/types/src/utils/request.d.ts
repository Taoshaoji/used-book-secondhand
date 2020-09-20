import { IReqOpts } from '../type/index';
import { IRetryOptions } from './retry';
interface ITimingsMeasurerOptions {
    waitingTime?: number;
    interval?: number;
    enable?: boolean;
}
interface IExtraRequestOptions {
    debug?: boolean;
    op?: string;
    seqId?: string;
    attempts?: number;
    timingsMeasurerOptions?: ITimingsMeasurerOptions;
    retryOptions?: IRetryOptions;
}
export declare function requestWithTimingsMeasure(opts: IReqOpts, extraOptions?: IExtraRequestOptions): Promise<unknown>;
export declare function extraRequest(opts: IReqOpts, extraOptions?: IExtraRequestOptions): Promise<unknown>;
export {};
