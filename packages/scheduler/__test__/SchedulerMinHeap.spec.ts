import { describe, it, expect, beforeEach } from "vitest";
import { Heap, Node, peek, push, pop } from "../src/SchedulerMinHeap";

// 测试用的 Node 类型
interface TestNode extends Node {
  id: number;
  sortIndex: number;
  value?: string;
}

describe("SchedulerMinHeap", () => {
  let heap: Heap<TestNode>;

  beforeEach(() => {
    heap = [];
  });

  // 辅助函数：创建测试节点
  const createNode = (
    id: number,
    sortIndex: number,
    value?: string
  ): TestNode => ({
    id,
    sortIndex,
    value,
  });

  describe("peek", () => {
    it("should return null for empty heap", () => {
      expect(peek(heap)).toBeNull();
    });

    it("should return the minimum element without removing it", () => {
      const node1 = createNode(1, 5);
      const node2 = createNode(2, 3);
      const node3 = createNode(3, 7);

      push(heap, node1);
      push(heap, node2);
      push(heap, node3);

      expect(peek(heap)).toBe(node2);
      expect(heap.length).toBe(3);
    });

    it("should return the same element on multiple calls", () => {
      const node = createNode(1, 5);
      push(heap, node);

      expect(peek(heap)).toBe(node);
      expect(peek(heap)).toBe(node);
      expect(heap.length).toBe(1);
    });
  });

  describe("push", () => {
    it("should add element to empty heap", () => {
      const node = createNode(1, 5);
      push(heap, node);

      expect(heap.length).toBe(1);
      expect(peek(heap)).toBe(node);
    });

    it("should maintain min heap property when adding elements", () => {
      const node1 = createNode(1, 10);
      const node2 = createNode(2, 5);
      const node3 = createNode(3, 15);
      const node4 = createNode(4, 3);

      push(heap, node1);
      push(heap, node2);
      push(heap, node3);
      push(heap, node4);

      expect(peek(heap)).toBe(node4); // sortIndex = 3
      expect(heap.length).toBe(4);
    });

    it("should handle elements with same sortIndex by id", () => {
      const node1 = createNode(3, 5);
      const node2 = createNode(1, 5);
      const node3 = createNode(2, 5);

      push(heap, node1);
      push(heap, node2);
      push(heap, node3);

      expect(peek(heap)).toBe(node2); // same sortIndex, but id = 1 is smallest
    });

    it("should handle large number of elements", () => {
      const nodes: TestNode[] = [];
      for (let i = 100; i >= 1; i--) {
        const node = createNode(i, i);
        nodes.push(node);
        push(heap, node);
      }

      expect(heap.length).toBe(100);
      expect(peek(heap)).toBe(nodes[99]); // node with id=1, sortIndex=1
    });
  });

  describe("pop", () => {
    it("should return null for empty heap", () => {
      expect(pop(heap)).toBeNull();
    });

    it("should remove and return the minimum element", () => {
      const node1 = createNode(1, 10);
      const node2 = createNode(2, 5);
      const node3 = createNode(3, 15);

      push(heap, node1);
      push(heap, node2);
      push(heap, node3);

      expect(pop(heap)).toBe(node2);
      expect(heap.length).toBe(2);
      expect(peek(heap)).toBe(node1);
    });

    it("should maintain min heap property after removal", () => {
      const nodes = [
        createNode(1, 10),
        createNode(2, 5),
        createNode(3, 15),
        createNode(4, 3),
        createNode(5, 8),
        createNode(6, 12),
      ];

      nodes.forEach((node) => push(heap, node));

      const popped = pop(heap);
      expect(popped).toBe(nodes[3]); // id=4, sortIndex=3

      const nextMin = peek(heap);
      expect(nextMin).toBe(nodes[1]); // id=2, sortIndex=5
    });

    it("should handle single element heap", () => {
      const node = createNode(1, 5);
      push(heap, node);

      expect(pop(heap)).toBe(node);
      expect(heap.length).toBe(0);
      expect(peek(heap)).toBeNull();
    });

    it("should return elements in sorted order", () => {
      const nodes = [
        createNode(1, 50),
        createNode(2, 30),
        createNode(3, 70),
        createNode(4, 20),
        createNode(5, 80),
        createNode(6, 10),
      ];

      nodes.forEach((node) => push(heap, node));

      const sortedNodes: TestNode[] = [];
      while (heap.length > 0) {
        const node = pop(heap);
        if (node) {
          sortedNodes.push(node);
        }
      }

      expect(sortedNodes.map((n) => n.sortIndex)).toEqual([
        10, 20, 30, 50, 70, 80,
      ]);
    });
  });

  describe("complex operations", () => {
    it("should handle mixed push and pop operations", () => {
      const node1 = createNode(1, 10);
      const node2 = createNode(2, 5);
      const node3 = createNode(3, 15);

      push(heap, node1);
      push(heap, node2);

      expect(pop(heap)).toBe(node2);

      push(heap, node3);

      expect(peek(heap)).toBe(node1);
      expect(heap.length).toBe(2);
    });

    it("should handle duplicate sortIndex values correctly", () => {
      const node1 = createNode(5, 10);
      const node2 = createNode(3, 10);
      const node3 = createNode(7, 10);
      const node4 = createNode(1, 10);

      push(heap, node1);
      push(heap, node2);
      push(heap, node3);
      push(heap, node4);

      // Should be ordered by id when sortIndex is the same
      const result: TestNode[] = [];
      while (heap.length > 0) {
        const node = pop(heap);
        if (node) {
          result.push(node);
        }
      }

      // All nodes have same sortIndex, so they should be ordered by id
      expect(result.map((n) => n.id)).toEqual([1, 3, 5, 7]);
    });

    it("should handle stress test with random operations", () => {
      const nodes: TestNode[] = [];

      // Add some initial elements
      for (let i = 0; i < 50; i++) {
        const node = createNode(i, Math.floor(Math.random() * 100));
        nodes.push(node);
        push(heap, node);
      }

      // Mix of operations
      for (let i = 0; i < 25; i++) {
        // Pop some elements
        const popped = pop(heap);
        expect(popped).not.toBeNull();

        // Add new elements
        const newNode = createNode(i + 50, Math.floor(Math.random() * 100));
        push(heap, newNode);
      }

      // Verify heap property is maintained
      const result: TestNode[] = [];
      while (heap.length > 0) {
        result.push(pop(heap)!);
      }

      // Check that result is sorted
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        expect(prev.sortIndex <= curr.sortIndex).toBe(true);
        if (prev.sortIndex === curr.sortIndex) {
          expect(prev.id <= curr.id).toBe(true);
        }
      }
    });
  });

  describe("edge cases", () => {
    it("should handle zero sortIndex", () => {
      const node1 = createNode(1, 0);
      const node2 = createNode(2, 5);

      push(heap, node2);
      push(heap, node1);

      expect(peek(heap)).toBe(node1);
    });

    it("should handle negative sortIndex", () => {
      const node1 = createNode(1, -10);
      const node2 = createNode(2, 5);
      const node3 = createNode(3, -5);

      push(heap, node2);
      push(heap, node1);
      push(heap, node3);

      expect(peek(heap)).toBe(node1); // sortIndex = -10
    });

    it("should handle large numbers", () => {
      const node1 = createNode(1, Number.MAX_SAFE_INTEGER);
      const node2 = createNode(2, Number.MAX_SAFE_INTEGER - 1);

      push(heap, node1);
      push(heap, node2);

      expect(peek(heap)).toBe(node2);
    });
  });
});
