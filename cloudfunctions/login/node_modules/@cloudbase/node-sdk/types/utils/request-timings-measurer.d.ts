declare const EventEmitter: any;
export declare class RequestTimgingsMeasurer extends EventEmitter {
    static new(options: any): RequestTimgingsMeasurer;
    private enable;
    private timings;
    private timerStarted;
    private interval;
    private waitingTime;
    private intervalId;
    private timeoutId;
    private e;
    constructor(options: any);
    measure(clientRequest: any): void;
    private startTimer;
    private stopTimer;
    private process;
}
export {};
