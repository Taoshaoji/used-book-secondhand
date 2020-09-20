export interface IRetryOptions {
    retries?: number;
    timeouts?: [number];
    forever?: boolean;
    unref?: boolean;
    maxRetryTime?: number;
    shouldRetry?: (e: any, result: any, operation: any) => {
        retryAble: boolean;
        message: string;
    };
    timeoutOps: any;
}
/**
 * withRetry 重试封装函数
 * @param fn
 * @param retryOptions
 */
export declare function withRetry<T>(fn: (attempts?: number) => Promise<T>, retryOptions: IRetryOptions): Promise<T>;
