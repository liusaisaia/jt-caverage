// 测试文件示例
// tests/example.spec.js

import { describe, it, expect } from 'vitest';
import { add, describeNumber, processArray, delayMessage } from '../src/example.js';

describe('示例函数测试', () => {
  // 测试 add 函数
  it('应该正确计算两个数的和', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  // 测试 describeNumber 函数
  it('应该正确描述数字', () => {
    expect(describeNumber(5)).toBe('正数');
    expect(describeNumber(-3)).toBe('负数');
    expect(describeNumber(0)).toBe('零');
  });

  // 测试 processArray 函数
  it('应该正确处理数组', () => {
    expect(processArray([1, 2, 3])).toEqual([2, 4, 6]);
    expect(processArray([0, null, undefined, 4])).toEqual([0, 8]);
    expect(processArray([])).toEqual([]);
  });

  // 测试 delayMessage 异步函数
  it('应该返回延迟后的消息', async () => {
    const message = await delayMessage(100);
    expect(message).toBe('延迟了 100 毫秒');
  });
});