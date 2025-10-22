// 测试文件示例
// src/example.js

/**
 * 示例函数，用于测试覆盖率收集
 * @param {number} a - 第一个数字
 * @param {number} b - 第二个数字
 * @returns {number} 两数之和
 */
export function add(a, b) {
  return a + b;
}

/**
 * 示例函数，用于测试分支覆盖率
 * @param {number} num - 输入数字
 * @returns {string} 描述文本
 */
export function describeNumber(num) {
  if (num > 0) {
    return '正数';
  } else if (num < 0) {
    return '负数';
  } else {
    return '零';
  }
}

/**
 * 示例函数，用于测试循环覆盖率
 * @param {Array} arr - 输入数组
 * @returns {Array} 处理后的数组
 */
export function processArray(arr) {
  const result = [];
  
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== null && arr[i] !== undefined) {
      result.push(arr[i] * 2);
    }
  }
  
  return result;
}

/**
 * 示例异步函数，用于测试异步代码覆盖率
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise<string>} 延迟后的消息
 */
export async function delayMessage(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`延迟了 ${ms} 毫秒`);
    }, ms);
  });
}