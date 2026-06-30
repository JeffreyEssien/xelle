import { describe, it, expect, beforeEach } from "vitest";

// We need to re-import a fresh module each test to reset the running/waiting state
let enqueue: typeof import("@/lib/orderQueue").enqueue;

beforeEach(async () => {
    // Vitest module cache reset
    const mod = await import("@/lib/orderQueue");
    enqueue = mod.enqueue;
});

describe("orderQueue", () => {
    it("executes a simple task and returns its result", async () => {
        const result = await enqueue(async () => 42);
        expect(result).toBe(42);
    });

    it("propagates task errors", async () => {
        await expect(
            enqueue(async () => {
                throw new Error("boom");
            })
        ).rejects.toThrow("boom");
    });

    it("runs multiple tasks concurrently", async () => {
        let concurrentCount = 0;
        let maxConcurrent = 0;

        const makeTask = () =>
            enqueue(async () => {
                concurrentCount++;
                maxConcurrent = Math.max(maxConcurrent, concurrentCount);
                await new Promise((r) => setTimeout(r, 50));
                concurrentCount--;
            });

        await Promise.all([makeTask(), makeTask(), makeTask()]);
        expect(maxConcurrent).toBe(3);
    });

    it("limits concurrency to 3", async () => {
        let concurrentCount = 0;
        let maxConcurrent = 0;

        const makeTask = () =>
            enqueue(async () => {
                concurrentCount++;
                maxConcurrent = Math.max(maxConcurrent, concurrentCount);
                await new Promise((r) => setTimeout(r, 50));
                concurrentCount--;
            });

        // Launch 5 tasks — only 3 should run at a time
        await Promise.all([makeTask(), makeTask(), makeTask(), makeTask(), makeTask()]);
        expect(maxConcurrent).toBeLessThanOrEqual(3);
        expect(maxConcurrent).toBe(3);
    });
});
