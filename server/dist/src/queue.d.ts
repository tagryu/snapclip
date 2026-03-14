import type { PipelineInput } from '../pipeline/types';
export declare const jobStatus: Map<string, {
    status: "pending" | "processing" | "done" | "failed";
    progress: number;
    stage: string;
    result?: any;
    error?: string;
}>;
export declare const videoQueue: {
    add(_name: string, data: PipelineInput, opts?: {
        jobId?: string;
        [key: string]: any;
    }): Promise<{
        id: string;
    }>;
};
export declare function startWorker(): void;
//# sourceMappingURL=queue.d.ts.map