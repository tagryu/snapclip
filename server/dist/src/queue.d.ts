import { Queue, Worker } from 'bullmq';
export declare const videoQueue: Queue<any, any, string, any, any, string>;
export declare const jobStatus: Map<string, {
    status: "pending" | "processing" | "done" | "failed";
    progress: number;
    stage: string;
    result?: any;
    error?: string;
}>;
export declare function startWorker(): Worker<any, any, string>;
//# sourceMappingURL=queue.d.ts.map