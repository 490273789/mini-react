export type Heap<T extends Node> = Array<T>;
export type Node = {
  id: number; // 任务的唯一标识
  sortIndex: number; // 排序的依据
};

/**
 * 获取堆顶元素
 */
export function peek<T extends Node>(heap: Heap<T>): T | null {
  return heap.length === 0 ? null : heap[0];
}

/**
 * 给堆添加元素
 */
export function push<T extends Node>(heap: Heap<T>, node: T): void {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}

/**
 * 删除堆顶元素
 */
export function pop<T extends Node>(heap: Heap<T>): T | null {
  if (heap.length === 0) return null;
  const first = heap[0];
  const last = heap.pop()!;
  if (first !== last) {
    heap[0] = last;
    siftDown(heap, last, 0);
  }
  return first;
}

function compare(a: Node, b: Node): number {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

/**
 * 自下而上堆化
 * @param heap
 * @param node
 * @param i
 * @returns
 */
function siftUp<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i;
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    if (compare(parent, node) > 0) {
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

/**
 * 自上而下的堆化
 * @param heap
 * @param node
 * @param i
 * @returns
 */
function siftDown<T extends Node>(heap: Heap<T>, node: T, i: number): void {
  let index = i;
  const length = heap.length;
  const halfLength = length >>> 1;
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];

    if (compare(left, node) < 0) {
      if (rightIndex < length && compare(right, left) < 0) {
        // 来到这里说明right 是最小的
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        // 来到这里说明left 是最小的
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      // 来到这里说明right 是最小的
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // 来到这里说明父节点最小，堆化结束
      return;
    }
  }
}
