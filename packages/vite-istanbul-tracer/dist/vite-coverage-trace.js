/**
 * Vite Coverage Trace Plugin
 * 模仿 coverage-source-map-trace-plugin 的实现
 * 在构建时修正覆盖率数据的行号
 */

import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

/**
 * Vite 覆盖率追踪插件
 */
export function viteCoverageTracePlugin(options = {}) {
  const {
    debug = false,
    include = /\.(vue|js|jsx|ts|tsx)$/,
    exclude = /node_modules/
  } = options

  // 缓存每个文件的 sourceMap
  const sourceMapCache = new Map()

  return {
    name: 'vite-coverage-trace',
    enforce: 'post', // 在 vite-plugin-istanbul 之后执行

    /**
     * transform 钩子：收集 sourceMap
     */
    async transform(code, id, options) {
      // 过滤文件
      if (!include.test(id) || exclude.test(id)) {
        return null
      }

      // 检查是否有插桩代码
      if (!/var cov_\w+\s*=|function cov_\w+\(\)|__coverage__/.test(code)) {
        return null
      }

      try {
        // 获取 Vite 生成的 sourceMap
        const map = this.getCombinedSourcemap()

        if (map) {
          sourceMapCache.set(id, map)

          if (debug) {
            console.log(`[vite-coverage-trace] 收集 sourceMap: ${id}`)
          }

          // 修正代码中的覆盖率数据
          const fixedCode = await fixCoverageDataInCode(code, map, debug)

          if (fixedCode !== code) {
            if (debug) {
              console.log(`[vite-coverage-trace] 已修正覆盖率数据: ${id}`)
            }

            return {
              code: fixedCode,
              map: null // 让 Vite 重新生成 sourceMap
            }
          }
        }
      } catch (error) {
        if (debug) {
          console.error(`[vite-coverage-trace] 处理失败: ${id}`, error)
        }
      }

      return null
    }
  }
}

/**
 * 修正代码中的覆盖率数据
 * 模仿 coverageSourceMapTraceBabelPlugin 的实现
 */
async function fixCoverageDataInCode(code, sourceMap, debug) {
  try {
    // 1. 解析代码为 AST
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    })

    // 2. 创建 TraceMap
    const tracer = new TraceMap(sourceMap)

    // 3. 遍历 AST，找到覆盖率数据
    let modified = false

    traverse(ast, {
      VariableDeclarator(path) {
        const { node } = path

        // 查找 coverageData 变量
        if (
          node.id.name === 'coverageData' &&
          node.init &&
          node.init.type === 'ObjectExpression'
        ) {
          // 检查是否是真的覆盖率数据
          const hasRequiredProps = node.init.properties.some(prop =>
            ['statementMap', 'fnMap', 'branchMap'].includes(prop.key.name)
          )

          if (!hasRequiredProps) return

          if (debug) {
            console.log('[vite-coverage-trace] 找到 coverageData')
          }

          // 修正所有位置信息
          modifyPositions(node.init, tracer, debug)
          modified = true
        }
      }
    })

    // 4. 如果修改了，重新生成代码
    if (modified) {
      const output = generate(ast, {
        sourceMaps: false,
        retainLines: true
      })
      return output.code
    }

    return code
  } catch (error) {
    if (debug) {
      console.error('[vite-coverage-trace] AST 处理失败:', error)
    }
    return code
  }
}

/**
 * 修正位置信息
 * 递归遍历对象，修正所有 start 和 end 属性
 */
function modifyPositions(node, tracer, debug) {
  if (node.type === 'ObjectExpression') {
    node.properties.forEach(prop => {
      // 检查是否是 start 或 end 属性
      if (
        prop.key.name === 'start' ||
        prop.key.name === 'end'
      ) {
        if (prop.value.type === 'ObjectExpression') {
          // 获取 line 和 column
          const lineNode = prop.value.properties.find(p => p.key.name === 'line')
          const columnNode = prop.value.properties.find(p => p.key.name === 'column')

          if (lineNode && columnNode) {
            const currentLine = lineNode.value.value
            const currentColumn = columnNode.value.value

            // 使用 sourceMap 映射回原始位置
            const original = originalPositionFor(tracer, {
              line: currentLine,
              column: currentColumn
            })

            if (original && original.line !== null) {
              if (debug && (original.line !== currentLine)) {
                console.log(`[vite-coverage-trace] 映射: ${currentLine}:${currentColumn} -> ${original.line}:${original.column}`)
              }

              // 修改 AST 节点的值
              lineNode.value.value = original.line
              columnNode.value.value = original.column || 0
            }
          }
        }
      }

      // 递归处理嵌套对象和数组
      if (prop.value.type === 'ObjectExpression') {
        modifyPositions(prop.value, tracer, debug)
      } else if (prop.value.type === 'ArrayExpression') {
        prop.value.elements.forEach(element => {
          if (element && element.type === 'ObjectExpression') {
            modifyPositions(element, tracer, debug)
          }
        })
      }
    })
  }
}

/**
 * 工厂函数
 */
export function createViteCoverageTracePlugin(options) {
  return viteCoverageTracePlugin(options)
}

export default viteCoverageTracePlugin
