/**
 * In-memory order queue with concurrency control.
 * Prevents DB connection exhaustion under traffic spikes by limiting
 * how many orders are processed simultaneously.
 * Each caller still gets a synchronous success/error response.
 */

const MAX_CONCURRENT = 3;
const MAX_WAITING = 200;

let running = 0;
const waiting: Array<{ resolve: () => void; reject: (err: Error) => void }> = [];

function acquire(): Promise<void> {
    if (running < MAX_CONCURRENT) {
        running++;
        return Promise.resolve();
    }
    if (waiting.length >= MAX_WAITING) {
        return Promise.reject(new Error("Server is busy. Please try again in a moment."));
    }
    return new Promise<void>((resolve, reject) => {
        waiting.push({ resolve, reject });
    });
}

function release(): void {
    const next = waiting.shift();
    if (next) {
        next.resolve();
    } else {
        running--;
    }
}

/**
 * Run an async task through the order queue.
 * At most MAX_CONCURRENT tasks execute at once; extras wait in line.
 * Returns the task's result or throws its error — callers see no difference
 * except that spike traffic is smoothed out.
 */
export async function enqueue<T>(task: () => Promise<T>): Promise<T> {
    await acquire();
    try {
        return await task();
    } finally {
        release();
    }
}
