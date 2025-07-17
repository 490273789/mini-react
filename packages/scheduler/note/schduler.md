# 任务调度器

> 就是一个 javascript 的单线程任务调度器，是一个 js 包，与 react 无关
> Scheduler 的主要目标是实现时间切片（time slicing）和异步可中断更新（async and interruptible rendering），它是 React 实现并发模式（Concurrent Mode）的关键。

react 运行中，有一些任务要执行，这些任务分别有不同的优先级，从高到底分别为：

1. 立即执行
2. 用户阻塞级别
3. 普通优先级
4. 低优先级
5. 闲置

- ​ 任务优先级 ​：Scheduler 根据任务的优先级来调度。React 内部定义了多种优先级（如 ImmediatePriority、UserBlockingPriority、NormalPriority、LowPriority、IdlePriority）。
- ​ 时间切片 ​：将长时间运行的任务拆分成多个小任务（时间片），在每个小任务后检查是否还有剩余时间，如果没有，则让出主线程，避免阻塞用户交互和渲染。
- ​ 任务队列 ​：维护多个优先级的任务队列（通常是一个最小堆，因为我们要快速获取优先级最高的任务）。
- ​ 调度机制 ​：
  使用 requestIdleCallback 的 polyfill（在支持的情况下，用 requestIdleCallback）来在浏览器空闲时期执行任务。但 React 自己实现了一个更可控的版本（使用 MessageChannel 或 setTimeout）。
  通过持续检查当前帧的剩余时间，来决定是否继续执行任务，还是暂停并让出主线程。
- ​ 任务中断与恢复 ​：在执行任务的过程中，如果当前时间片用完了（通过检查 performance.now()来判断），就会中断当前任务的执行，并安排一个回调（如 requestIdleCallback）在下次空闲时恢复任务。
- ​ 任务饥饿问题 ​：为了避免低优先级任务一直得不到执行，Scheduler 会随着时间推移，提升这些任务的优先级。

## 实现时间切片

就是一个时间段， 比如 5ms

### 时间切片解决的问题

高优先级任务迟迟得不到处理

### callback

任务的初始值

### work

一个时间切片内的工作单元，一个工作单元包括一个或者多个 task
