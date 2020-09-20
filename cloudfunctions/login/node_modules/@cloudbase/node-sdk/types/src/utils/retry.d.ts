export interface IRetryOptions {
    retries?: number;
    factor?: number;
    minTimeout?: number;
    maxTimeout?: number;
    randomize?: boolean;
    forever?: boolean;
    unref?: boolean;
    maxRetryTime?: number;
    timeoutOps?: any;
    timeouts?: [number];
    shouldRetry?: (e: any, result: any, operation: any) => {
        retryAble: boolean;
        message: string;
    };
}
/**
 * withRetry 重试封装函数
 * @param fn
 * @param retryOptions
 */
export declare function withRetry<T>(fn: (attempts?: number) => Promise<T>, retryOptions: IRetryOptions): Promise<T>;
