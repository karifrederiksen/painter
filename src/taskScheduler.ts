import { T3, T2 } from "./core"

// Type definition for requestIdleCallback

interface RequestIdleCallbackHandle {}
type RequestIdleCallbackOptions = {
    timeout: number
}
type RequestIdleCallbackDeadline = {
    readonly didTimeout: boolean
    timeRemaining(): number
}

declare global {
    interface Window {
        requestIdleCallback: ((
            callback: ((deadline: RequestIdleCallbackDeadline) => void),
            opts?: RequestIdleCallbackOptions
        ) => RequestIdleCallbackHandle)
        cancelIdleCallback: ((handle: RequestIdleCallbackHandle) => void)
    }
}

// Shim for requestIdleCallback

window.requestIdleCallback =
    window.requestIdleCallback ||
    ((cb: (opts: RequestIdleCallbackDeadline) => void) => {
        const start = Date.now()
        return setTimeout(() => {
            cb({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 20 - (Date.now() - start)),
            })
        }, 1)
    })

window.cancelIdleCallback =
    window.cancelIdleCallback ||
    (id => {
        clearTimeout(id as any)
    })

// ============================================================= //
// ============================================================= //
// ============================================================= //

export const enum Priority {
    Low,
    Medium,
    High,
}
export interface Task {
    readonly priority: Priority
    readonly work: () => void
}

interface MutableCancellationToken {
    isCancellable: boolean
}
export interface CancellationToken {
    readonly isCancellable: boolean
}
type ScheduledTask = T2<MutableCancellationToken, Task>
type TaskQueue = T3<Array<ScheduledTask>, Array<ScheduledTask>, Array<ScheduledTask>>

// === Module state ===

const taskQueues: TaskQueue = [[], [], []]
const unprioritizedTasks: Array<ScheduledTask> = []
let workHandle: RequestIdleCallbackHandle | null = null
let isWorking = false

// ====================

export function scheduleTask(task: Task): CancellationToken {
    const token: MutableCancellationToken = { isCancellable: true }
    const scheduledTask: ScheduledTask = [token, task]

    /*
     * a task can schedule more tasks
     * but we can't add those tasks directly to the task queue, since the task queue might get emptied after the work is complete
     */
    if (isWorking) {
        unprioritizedTasks.push(scheduledTask)
        return token
    }

    prioritizeTask(scheduledTask)

    scheduleTasks()
    return token
}

function prioritizeTask(scheduledTask: ScheduledTask): void {
    switch (scheduledTask[1].priority) {
        case Priority.High:
            taskQueues[0].push(scheduledTask)
            break
        case Priority.Medium:
            taskQueues[1].push(scheduledTask)
            break
        case Priority.Low:
            taskQueues[2].push(scheduledTask)
            break
    }
}

export function cancelTask(token: CancellationToken): { readonly wasCancelled: boolean } {
    for (let queueType = 0; queueType < 3; queueType++) {
        const queue = taskQueues[queueType as 0 | 1 | 2]
        for (let i = 0; i < queue.length; i++) {
            if (queue[i][0] !== token) continue

            queue[i][0].isCancellable = false
            queue.splice(i, 1)
            return { wasCancelled: true }
        }
    }
    return { wasCancelled: false }
}

function scheduleTasks() {
    if (workHandle === null) workHandle = window.requestIdleCallback(runTasks)
}

function runTasks(deadline: RequestIdleCallbackDeadline) {
    let tasksLeftOver = false

    isWorking = true
    workLoop: for (let queueType = 0; queueType < 3; queueType++) {
        const queue = taskQueues[queueType as 0 | 1 | 2]
        for (let i = 0; i < queue.length; i++) {
            queue[i][1].work()
            queue[i][0].isCancellable = false

            if (deadline.timeRemaining() > 0) {
                queue.splice(0, i)
                tasksLeftOver = true
                break workLoop
            }
        }
        queue.length = 0
    }
    isWorking = false

    if (unprioritizedTasks.length > 0) {
        for (let i = 0; i < unprioritizedTasks.length; i++) {
            prioritizeTask(unprioritizedTasks[i])
        }

        unprioritizedTasks.length = 0
        tasksLeftOver = true
    }

    if (tasksLeftOver) scheduleTasks()
}
