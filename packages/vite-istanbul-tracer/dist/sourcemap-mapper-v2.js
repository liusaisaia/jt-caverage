/**
 * SourceMap 映射工具 V2
 * 优先使用 inputSourceMap（内置在覆盖率数据中）
 */

import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'
import { VueSFCParser } from './vue-sfc-parser.js'

/**
 * 映射所有覆盖率数据（V2 - 使用 inputSourceMap）
 * @param {string} coverageKey - 覆盖率变量名
 * @param {Object} options - 配置选项
 * @param {boolean} [options.verbose=true] - 是否显示详细日志
 * @param {boolean} [options.useFallbackMapping=true] - 是否使用备选映射策略
 * @param {boolean} [options.skipUnmappable=true] - 是否跳过无法映射的位置
 * @param {number} [options.maxRetries=2] - 映射失败后的最大重试次数
 * @returns {Promise<object>} 映射后的覆盖率数据
 */
export async function mapAllCoverageV2(coverageKey = '__coverage__', options = {}) {
  // 解构选项，提供默认值
  const {
    verbose = true,
    useFallbackMapping = true,
    skipUnmappable = true,
    maxRetries = 2
  } = options

  const coverage = typeof window !== 'undefined' ? window[coverageKey] : null

  if (!coverage) {
    console.warn('[sourcemap-mapper-v2] 未找到覆盖率数据:', coverageKey)
    return null
  }

  console.log('[sourcemap-mapper-v2] 🔍 开始映射覆盖率数据...')
  let successCount = 0
  let failCount = 0

  for (const filePath of Object.keys(coverage)) {
    const data = coverage[filePath]

    try {
      let sourceMap = null

      // 优先使用 inputSourceMap（内置在覆盖率数据中）
      if (data.inputSourceMap) {
        sourceMap = data.inputSourceMap
        console.log(`[sourcemap-mapper-v2] 📝 ${filePath} - 使用 inputSourceMap`)
      } else {
        // 如果没有 inputSourceMap，尝试加载外部 .map 文件
        try {
          const mapUrl = `${filePath}.map`
          const response = await fetch(mapUrl)
          if (response.ok) {
            sourceMap = await response.json()
            console.log(`[sourcemap-mapper-v2] 📝 ${filePath} - 使用外部 .map 文件`)
          }
        } catch (e) {
          // 忽略错误
        }
      }

      if (!sourceMap) {
        console.warn(`[sourcemap-mapper-v2] ⚠️  无 sourcemap: ${filePath}`)
        failCount++
        continue
      }

      // 创建 TraceMap
      const tracer = new TraceMap(sourceMap)

      // 映射函数
      const mapPos = (line, column) => {
        // 使用配置的备选映射策略
        if (useFallbackMapping) {
          // 向上和向下搜索的行数
          const searchRange = maxRetries

          // 首先尝试直接映射
          const original = originalPositionFor(tracer, { line, column })
          if (original && original.line !== null) {
            return { line: original.line, column: original.column || 0 }
          }

          // 尝试向上搜索相邻行
          for (let i = 1; i <= searchRange; i++) {
            const searchLine = line - i
            if (searchLine > 0) {
              const pos = originalPositionFor(tracer, { line: searchLine, column: 0 })
              if (pos && pos.line !== null) {
                if (verbose) {
                  console.log(`[sourcemap-mapper-v2] ⚡ 备选映射成功：${line}:${column} -> ${pos.line}:${pos.column || 0} (向上${i}行)`)
                }
                return { line: pos.line, column: pos.column || 0 }
              }
            }
          }

          // 尝试向下搜索相邻行
          for (let i = 1; i <= searchRange; i++) {
            const searchLine = line + i
            const pos = originalPositionFor(tracer, { line: searchLine, column: 0 })
            if (pos && pos.line !== null) {
              if (verbose) {
                console.log(`[sourcemap-mapper-v2] ⚡ 备选映射成功：${line}:${column} -> ${pos.line}:${pos.column || 0} (向下${i}行)`)
              }
              return { line: pos.line, column: pos.column || 0 }
            }
          }
        } else {
          // 不使用备选映射，只尝试直接映射
          const original = originalPositionFor(tracer, { line, column })
          if (original && original.line !== null) {
            return { line: original.line, column: original.column || 0 }
          }
        }

        // 如果映射失败且配置了跳过未映射的位置，则返回默认位置
        if (skipUnmappable) {
          return { line: 1, column: 0 }
        }

        return { line, column }
      }
    }

      // 映射 statementMap
      Object.values(data.statementMap || {}).forEach(stmt => {
      if (stmt.start) {
        Object.assign(stmt.start, mapPos(stmt.start.line, stmt.start.column))
      }
      if (stmt.end) {
        Object.assign(stmt.end, mapPos(stmt.end.line, stmt.end.column))
      }
    })

    // 映射 fnMap
    Object.values(data.fnMap || {}).forEach(fn => {
      if (fn.decl?.start) {
        Object.assign(fn.decl.start, mapPos(fn.decl.start.line, fn.decl.start.column))
      }
      if (fn.decl?.end) {
        Object.assign(fn.decl.end, mapPos(fn.decl.end.line, fn.decl.end.column))
      }
      if (fn.loc?.start) {
        Object.assign(fn.loc.start, mapPos(fn.loc.start.line, fn.loc.start.column))
      }
      if (fn.loc?.end) {
        Object.assign(fn.loc.end, mapPos(fn.loc.end.line, fn.loc.end.column))
      }
    })

    // 映射 branchMap
    Object.values(data.branchMap || {}).forEach(branch => {
      if (branch.loc?.start) {
        Object.assign(branch.loc.start, mapPos(branch.loc.start.line, branch.loc.start.column))
      }
      if (branch.loc?.end) {
        Object.assign(branch.loc.end, mapPos(branch.loc.end.line, branch.loc.end.column))
      }
      branch.locations?.forEach(loc => {
        if (loc.start) {
          Object.assign(loc.start, mapPos(loc.start.line, loc.start.column))
        }
        if (loc.end) {
          Object.assign(loc.end, mapPos(loc.end.line, loc.end.column))
        }
      })
    })

    successCount++
    console.log(`[sourcemap-mapper-v2] ✅ ${filePath}`)

  } catch (error) {
    console.error(`[sourcemap-mapper-v2] ❌ ${filePath}`, error)
    failCount++
  }
}

console.log(`[sourcemap-mapper-v2] 🎉 映射完成！成功: ${successCount}, 失败: ${failCount}`)

return coverage
}

/**
 * 自动映射覆盖率数据
 * 同时支持浏览器和Node.js环境
 * @param {Object|Object} coverageOrOptions - 覆盖率数据或配置选项
 * @param {Object} [options] - 配置选项（当第一个参数是coverage数据时）
 * @param {number} options.delay - 延迟时间（毫秒）
 * @param {boolean} options.verbose - 是否显示详细日志
 * @param {boolean} options.showStats - 是否显示统计信息
 * @param {boolean} [options.useCache=true] - 是否使用缓存机制
 * @param {number} [options.cacheExpiry=3600000] - 缓存过期时间（毫秒）
 * @param {boolean} [options.useFallbackMapping=true] - 是否使用备选映射策略
 * @param {boolean} [options.skipUnmappable=true] - 是否跳过无法映射的位置
 * @param {number} [options.maxRetries=2] - 映射失败后的最大重试次数
 * @returns {Promise<Object>} - 包含映射结果的对象
 */
export async function autoMapV2(coverageOrOptions, optionsArg) {
  // 处理参数重载
  let coverage
  let options = {}

  if (typeof coverageOrOptions === 'object' && coverageOrOptions !== null &&
    !('delay' in coverageOrOptions) && !('verbose' in coverageOrOptions)) {
    // 第一个参数是coverage数据
    coverage = coverageOrOptions
    options = optionsArg || {}
  } else {
    // 第一个参数是options
    options = coverageOrOptions || {}
    // 在浏览器环境中尝试获取全局覆盖率数据
    if (typeof window !== 'undefined') {
      coverage = window.__coverage__
    }
  }

  const {
    delay = 5000,
    verbose = true,
    showStats = true,
    useCache = true,
    cacheExpiry = 3600000, // 1小时
    useFallbackMapping = true,
    skipUnmappable = true,
    maxRetries = 2
  } = options

  if (verbose) {
    console.log('[sourcemap-mapper-v2] 🔍 覆盖率修正工具已加载，等待覆盖率数据...')
  }

  // 如果在浏览器环境中且没有提供coverage数据，等待延迟
  if (!coverage && typeof window !== 'undefined') {
    await new Promise(resolve => setTimeout(resolve, delay))
    coverage = window.__coverage__
  }

  if (!coverage) {
    if (verbose) {
      console.warn('[sourcemap-mapper-v2] ⚠️ 未找到覆盖率数据')
    }
    return { fixed: 0, totalMapped: 0, totalUnmapped: 0 }
  }

  if (verbose) {
    console.log('[sourcemap-mapper-v2] 📊 找到覆盖率数据，文件数:', Object.keys(coverage).length)
  }

  let totalMapped = 0
  let totalUnmapped = 0
  let fixed = 0
  let cacheHits = 0
  let cacheExpirations = 0

  // 缓存对象，避免重复映射相同的位置
  // 格式: { 'line:column': { line, column, timestamp } }
  const positionCache = useCache ? new Map() : null

  for (const filePath of Object.keys(coverage)) {
    const data = coverage[filePath]

    if (!data.inputSourceMap) {
      if (verbose) {
        console.log('[sourcemap-mapper-v2] ⚠️ 跳过（无 SourceMap）:', filePath.split('/').pop())
      }
      continue
    }

    try {
      // ===== 新增：Vue SFC 文件结构解析 =====
      let vueStructure = null
      if (filePath.endsWith('.vue')) {
        try {
          // 获取源文件内容
          const sourceContent = await fetchSourceContent(filePath)

          if (sourceContent) {
            // 解析 Vue 文件结构
            vueStructure = VueSFCParser.parse(sourceContent)

            if (vueStructure && verbose) {
              console.log(
                `[vue-mapper] 📄 ${filePath.split('/').pop()}\n` +
                `  ${VueSFCParser.getScriptInfo(vueStructure)}`
              )
            }
          }
        } catch (parseError) {
          if (verbose) {
            console.warn('[vue-mapper] ⚠️ Vue 文件解析失败:', filePath.split('/').pop(), parseError.message)
          }
        }
      }
      // ===== 结束新增 =====
      // 验证sourcemap数据的有效性
      if (!data.inputSourceMap || typeof data.inputSourceMap !== 'object') {
        if (verbose) {
          console.warn('[sourcemap-mapper-v2] ⚠️ 无效的SourceMap数据:', filePath.split('/').pop())
        }
        continue
      }

      // 创建TraceMap，处理可能的解析错误
      let tracer
      try {
        tracer = new TraceMap(data.inputSourceMap)
      } catch (traceMapError) {
        if (verbose) {
          console.error('[sourcemap-mapper-v2] ❌ SourceMap解析失败:', filePath.split('/').pop(),
            '错误类型:', traceMapError.name,
            '错误消息:', traceMapError.message)
        }
        continue
      }

      let fileMapped = 0
      let fileUnmapped = 0

      /**
       * 优化的列处理函数
       * @param {number|null|undefined} originalColumn - 原始列号
       * @param {number} sourceColumn - 源列号
       * @param {string} strategy - 映射策略
       * @returns {number} 优化后的列号
       */
      const optimizeColumn = (originalColumn, sourceColumn, strategy = 'direct') => {
        // 确保列号有效
        if (originalColumn === null || originalColumn === undefined) {
          // 根据不同策略采用不同的默认值
          switch (strategy) {
            case 'column-correction':
              // 列修正时，保持一定的缩进
              return Math.floor(sourceColumn * 0.7) || 0
            case 'line-fallback':
              // 行回退时，使用保守的列值
              return 0
            default:
              // 直接映射失败时，尝试使用源列的比例
              return Math.floor(sourceColumn * 0.5) || 0
          }
        }

        // 确保列号不会是负数或过大
        let column = Math.max(0, originalColumn)

        // 对于备选策略，避免极端的列值
        if (strategy !== 'direct') {
          // 更智能的列限制，基于源代码的可能结构
          if (column > 200) {
            return 200 // 限制最大值，但允许合理的长行
          }
          // 对于较短的源行，使用更小的列值
          if (sourceColumn < 50 && column > 100) {
            return 100
          }
        }

        return column
      }

      /**
       * 映射位置，当直接映射失败时尝试附近行的映射
       * @param {number} line - 行号
       * @param {number} column - 列号
       * @returns {Object} 映射后的位置
       */
      const mapPos = (line, column) => {
        // 有效性检查：确保行号和列号是有效数字
        if (typeof line !== 'number' || line < 1 || isNaN(line)) {
          if (verbose) {
            console.warn(`[sourcemap-mapper-v2] ⚠️ 无效的行号: ${line} (${typeof line})`)
          }
          return { line: 1, column: 0 }
        }

        if (typeof column !== 'number' || column < 0 || isNaN(column)) {
          if (verbose && column !== undefined) {
            console.warn(`[sourcemap-mapper-v2] ⚠️ 无效的列号: ${column} (${typeof column})，已重置为0`)
          }
          column = 0
        }

        // 生成缓存键
        const cacheKey = `${line}:${column}`

        // 1. 先检查缓存（如果启用）
        if (useCache && positionCache.has(cacheKey)) {
          const cachedItem = positionCache.get(cacheKey)
          // 检查缓存是否过期
          if (Date.now() - cachedItem.timestamp < cacheExpiry) {
            cacheHits++
            if (verbose && cacheHits % 100 === 0) {
              console.log(`[sourcemap-mapper-v2] 💾 缓存命中：${cacheHits}次`)
            }
            return cachedItem.position
          } else {
            // 缓存过期，删除
            positionCache.delete(cacheKey)
            cacheExpirations++
          }
        }

        // 2. 尝试直接映射
        try {
          if (!tracer) {
            if (verbose) {
              console.warn(`[sourcemap-mapper-v2] ⚠️ 无效的Tracer实例`)
            }
            throw new Error('无效的Tracer实例')
          }

          const pos = originalPositionFor(tracer, { line, column })
          if (pos && pos.line !== null && pos.line > 0) {
            // ===== 新增：Vue 映射修正 =====
            let finalLine = pos.line
            if (vueStructure) {
              const corrected = VueSFCParser.correctMapping(pos.line, line, vueStructure, verbose)
              if (corrected === null) {
                // 无效映射，跳过
                fileUnmapped++
                if (skipUnmappable) {
                  const result = { line: 1, column: 0 }
                  if (useCache) {
                    positionCache.set(cacheKey, { position: result, timestamp: Date.now() })
                  }
                  return result
                } else {
                  const result = { line, column }
                  if (useCache) {
                    positionCache.set(cacheKey, { position: result, timestamp: Date.now() })
                  }
                  return result
                }
              }
              finalLine = corrected
            }
            // ===== 结束新增 =====

            fileMapped++
            const optimizedColumn = optimizeColumn(pos.column, column, 'direct')
            const result = { line: finalLine, column: optimizedColumn }

            // 保存到缓存（如果启用）
            if (useCache) {
              positionCache.set(cacheKey, {
                position: result,
                timestamp: Date.now()
              })
            }
            return result
          }
        } catch (err) {
          // 直接映射失败，继续尝试备选策略
        }

        // 3. 尝试备选映射策略 - 水平搜索
        // 向上和向下搜索的行数
        const searchRange = maxRetries

        // 先尝试当前行的不同列位置 - 水平搜索策略
        // 测试几个关键列位置：0（行首）、目标列的50%、目标列、目标列的150%
        const horizontalPositions = [0, Math.floor(column * 0.5), column, Math.floor(column * 1.5)]
        for (const testColumn of horizontalPositions) {
          if (testColumn >= 0) {
            try {
              const pos = originalPositionFor(tracer, { line, column: testColumn })
              if (pos && pos.line !== null && pos.line > 0) {
                fileMapped++
                const optimizedColumn = optimizeColumn(pos.column, column, 'column-correction')
                if (verbose) {
                  console.log(`[sourcemap-mapper-v2] ⚡ 备选映射成功：${line}:${column} -> ${pos.line}:${optimizedColumn} (列修正，尝试列:${testColumn})`)
                }
                const result = { line: pos.line, column: optimizedColumn }

                // 保存到缓存（如果启用）
                if (useCache) {
                  positionCache.set(cacheKey, {
                    position: result,
                    timestamp: Date.now()
                  })
                }
                return result
              }
            } catch (err) { }
          }
        }

        // 4. 尝试向上搜索相邻行，对每行测试多个列位置
        for (let i = 1; i <= searchRange; i++) {
          const searchLine = line - i
          if (searchLine > 0) {
            // 对每一行测试多个列位置
            for (const testColumn of [0, column]) {
              try {
                const pos = originalPositionFor(tracer, { line: searchLine, column: testColumn })
                if (pos && pos.line !== null && pos.line > 0) {
                  fileMapped++
                  const optimizedColumn = optimizeColumn(pos.column, column, 'line-fallback')
                  if (verbose) {
                    console.log(`[sourcemap-mapper-v2] ⚡ 备选映射成功：${line}:${column} -> ${pos.line}:${optimizedColumn} (向上${i}行，列:${testColumn})`)
                  }
                  const result = { line: pos.line, column: optimizedColumn }

                  // 保存到缓存（如果启用）
                  if (useCache) {
                    positionCache.set(cacheKey, {
                      position: result,
                      timestamp: Date.now()
                    })
                  }
                  return result
                }
              } catch (err) { }
            }
          }
        }

        // 5. 尝试向下搜索相邻行，对每行测试多个列位置
        for (let i = 1; i <= searchRange; i++) {
          const searchLine = line + i
          // 对每一行测试多个列位置
          for (const testColumn of [0, column]) {
            try {
              const pos = originalPositionFor(tracer, { line: searchLine, column: testColumn })
              if (pos && pos.line !== null && pos.line > 0) {
                fileMapped++
                const optimizedColumn = optimizeColumn(pos.column, column, 'line-fallback')
                if (verbose) {
                  console.log(`[sourcemap-mapper-v2] ⚡ 备选映射成功：${line}:${column} -> ${pos.line}:${optimizedColumn} (向下${i}行，列:${testColumn})`)
                }
                const result = { line: pos.line, column: optimizedColumn }

                // 保存到缓存（如果启用）
                if (useCache) {
                  positionCache.set(cacheKey, {
                    position: result,
                    timestamp: Date.now()
                  })
                }
                return result
              }
            } catch (err) { }
          }
        }

        // 6. 尝试更激进的搜索策略 - 对角线搜索
        if (maxRetries > 2) { // 只在重试次数较多时启用
          // 尝试斜向搜索（上一行+列偏移）
          for (let i = 1; i <= Math.min(2, maxRetries); i++) {
            const searchLine = line - i
            if (searchLine > 0) {
              try {
                const testColumn = Math.max(0, column - i * 10)
                const pos = originalPositionFor(tracer, { line: searchLine, column: testColumn })
                if (pos && pos.line !== null && pos.line > 0) {
                  fileMapped++
                  const optimizedColumn = optimizeColumn(pos.column, column, 'line-fallback')
                  if (verbose) {
                    console.log(`[sourcemap-mapper-v2] ⚡ 备选映射成功：${line}:${column} -> ${pos.line}:${optimizedColumn} (斜向搜索向上${i}行，列偏移${-i * 10})`)
                  }
                  const result = { line: pos.line, column: optimizedColumn }

                  // 保存到缓存（如果启用）
                  if (useCache) {
                    positionCache.set(cacheKey, {
                      position: result,
                      timestamp: Date.now()
                    })
                  }
                  return result
                }
              } catch (err) { }
            }
          }
        }

        // 所有映射策略都失败
        fileUnmapped++

        // 根据配置决定是否返回原始位置或跳过
        if (skipUnmappable) {
          const result = { line: 1, column: 0 }
          if (verbose) {
            console.log(`[sourcemap-mapper-v2] ⚠️ 映射失败，跳转到默认位置：${line}:${column} -> ${result.line}:${result.column}`)
          }

          // 保存到缓存（如果启用）
          if (useCache) {
            positionCache.set(cacheKey, {
              position: result,
              timestamp: Date.now()
            })
          }
          return result
        } else {
          const result = { line, column }

          // 保存到缓存（如果启用）
          if (useCache) {
            positionCache.set(cacheKey, {
              position: result,
              timestamp: Date.now()
            })
          }
          return result
        }
      }

      // 安全地处理 statementMap
      try {
        if (data.statementMap && typeof data.statementMap === 'object') {
          try {
            const statements = Object.values(data.statementMap)
            // 检查是否为数组或可迭代对象
            if (Array.isArray(statements) || statements && typeof statements === 'object') {
              statements.forEach(s => {
                try {
                  if (s?.start && typeof s.start === 'object') {
                    const newStart = mapPos(s.start.line, s.start.column)
                    s.start.line = newStart.line
                    s.start.column = newStart.column
                  }
                  if (s?.end && typeof s.end === 'object') {
                    const newEnd = mapPos(s.end.line, s.end.column)
                    s.end.line = newEnd.line
                    s.end.column = newEnd.column
                  }
                } catch (stmtError) {
                  if (verbose) {
                    console.warn('[sourcemap-mapper-v2] ⚠️ 语句映射失败:', stmtError.message)
                  }
                }
              })
            }
          } catch (valuesError) {
            if (verbose) {
              console.error('[sourcemap-mapper-v2] ⚠️ 获取statementMap值失败:', valuesError.message)
            }
          }
        }
      }
      } catch (error) {
      if (verbose) {
        console.error('[sourcemap-mapper-v2] ❌ statementMap处理失败:', error.message)
      }
    }

    // 安全地处理 fnMap
    try {
      if (data.fnMap && typeof data.fnMap === 'object') {
        const functions = Object.values(data.fnMap)
        if (Array.isArray(functions)) {
          functions.forEach(f => {
            try {
              if (f?.decl?.start && typeof f.decl.start === 'object') {
                const newStart = mapPos(f.decl.start.line, f.decl.start.column)
                f.decl.start.line = newStart.line
                f.decl.start.column = newStart.column
              }
              if (f?.decl?.end && typeof f.decl.end === 'object') {
                const newEnd = mapPos(f.decl.end.line, f.decl.end.column)
                f.decl.end.line = newEnd.line
                f.decl.end.column = newEnd.column
              }
              if (f?.loc?.start && typeof f.loc.start === 'object') {
                const newStart = mapPos(f.loc.start.line, f.loc.start.column)
                f.loc.start.line = newStart.line
                f.loc.start.column = newStart.column
              }
              if (f?.loc?.end && typeof f.loc.end === 'object') {
                const newEnd = mapPos(f.loc.end.line, f.loc.end.column)
                f.loc.end.line = newEnd.line
                f.loc.end.column = newEnd.column
              }
            } catch (fnError) {
              if (verbose) {
                console.warn('[sourcemap-mapper-v2] ⚠️ 函数映射失败:', fnError.message)
              }
            }
          })
        }
      }
    } catch (error) {
      if (verbose) {
        console.error('[sourcemap-mapper-v2] ❌ fnMap处理失败:', error.message)
      }
    }

    // 安全地处理 branchMap
    try {
      if (data.branchMap && typeof data.branchMap === 'object') {
        const branches = Object.values(data.branchMap)
        if (Array.isArray(branches)) {
          branches.forEach(b => {
            try {
              if (b?.loc?.start && typeof b.loc.start === 'object') {
                const newStart = mapPos(b.loc.start.line, b.loc.start.column)
                b.loc.start.line = newStart.line
                b.loc.start.column = newStart.column
              }
              if (b?.loc?.end && typeof b.loc.end === 'object') {
                const newEnd = mapPos(b.loc.end.line, b.loc.end.column)
                b.loc.end.line = newEnd.line
                b.loc.end.column = newEnd.column
              }
              if (b.locations && Array.isArray(b.locations)) {
                b.locations.forEach(l => {
                  try {
                    if (l?.start && typeof l.start === 'object') {
                      const newStart = mapPos(l.start.line, l.start.column)
                      l.start.line = newStart.line
                      l.start.column = newStart.column
                    }
                    if (l?.end && typeof l.end === 'object') {
                      const newEnd = mapPos(l.end.line, l.end.column)
                      l.end.line = newEnd.line
                      l.end.column = newEnd.column
                    }
                  } catch (locError) {
                    if (verbose) {
                      console.warn('[sourcemap-mapper-v2] ⚠️ 分支位置映射失败:', locError.message)
                    }
                  }
                })
              }
            } catch (branchError) {
              if (verbose) {
                console.warn('[sourcemap-mapper-v2] ⚠️ 分支映射失败:', branchError.message)
              }
            }
          })
        }
      }
    } catch (error) {
      if (verbose) {
        console.error('[sourcemap-mapper-v2] ❌ branchMap处理失败:', error.message)
      }
    }

    totalMapped += fileMapped
    totalUnmapped += fileUnmapped
    fixed++

    if (verbose) {
      console.log(`[sourcemap-mapper-v2] ✅ 已修正: ${filePath.split('/').pop()} (映射成功: ${fileMapped}, 失败: ${fileUnmapped})`)
    }
  } catch (error) {
    console.error('[sourcemap-mapper-v2] ❌ 修正失败:', filePath.split('/').pop(), error)
  }
}

if (verbose) {
  console.log(`[sourcemap-mapper-v2] 🎉 完成！已修正 ${fixed}/${Object.keys(coverage).length} 个文件`)
  console.log(`[sourcemap-mapper-v2] 📊 总计：映射成功 ${totalMapped} 个位置，失败 ${totalUnmapped} 个位置`)

  if (useCache) {
    console.log(`[sourcemap-mapper-v2] 💾 缓存统计：命中 ${cacheHits} 次, 过期 ${cacheExpirations} 次, 缓存项数 ${positionCache.size}`)
  }

  // 显示配置信息
  console.log(`[sourcemap-mapper-v2] ⚙️  配置信息：`)
  console.log(`[sourcemap-mapper-v2]   - 缓存启用: ${useCache}`)
  console.log(`[sourcemap-mapper-v2]   - 备选映射: ${useFallbackMapping}`)
  console.log(`[sourcemap-mapper-v2]   - 跳过未映射: ${skipUnmappable}`)
  console.log(`[sourcemap-mapper-v2]   - 最大重试: ${maxRetries}`)
}

// 显示统计信息
if (showStats && verbose) {
  const successRate = ((totalMapped / (totalMapped + totalUnmapped)) * 100).toFixed(1)
  console.log(`[sourcemap-mapper-v2] 📈 映射成功率: ${successRate}%`)
}

return { fixed, totalMapped, totalUnmapped }
}

// 如果在浏览器环境中，自动执行
if (typeof window !== 'undefined') {
  // 延迟 5 秒自动执行
  setTimeout(() => {
    autoMapV2({
      delay: 0,
      verbose: true,
      showStats: true,
      useCache: true,
      useFallbackMapping: true
    })
  }, 5000)

  // 暴露到全局，方便手动调用
  window.__mapCoverageV2 = mapAllCoverageV2
  window.__fixCoverage = (customOptions = {}) => autoMapV2({
    delay: 0,
    verbose: true,
    showStats: true,
    ...customOptions
  })

  console.log('[sourcemap-mapper-v2] 💡 提示：可以手动调用 window.__fixCoverage() 重新修正')
  console.log('[sourcemap-mapper-v2] 💡 提示：可以传入选项进行自定义配置，例如：window.__fixCoverage({ useCache: false, verbose: false })')
}

/**
 * 获取源文件内容
 * @param {string} filePath - 文件路径
 * @returns {Promise<string|null>}
 */
async function fetchSourceContent(filePath) {
  if (typeof window === 'undefined') {
    // Node.js 环境
    try {
      const fs = await import('fs')
      return fs.readFileSync(filePath, 'utf-8')
    } catch (e) {
      return null
    }
  } else {
    // 浏览器环境
    try {
      let fetchPath = filePath

      // 处理绝对路径：转换为相对路径
      // 例如：C:/work/project/src/App.vue → /src/App.vue
      if (filePath.startsWith('C:/') || filePath.startsWith('/')) {
        // 查找 src/ 的位置
        const srcIndex = filePath.indexOf('/src/')
        if (srcIndex !== -1) {
          // 提取 /src/ 之后的部分
          fetchPath = filePath.substring(srcIndex)
        } else {
          // 如果没有 src/，尝试查找项目根目录的其他标志
          const componentsIndex = filePath.indexOf('/components/')
          const layoutsIndex = filePath.indexOf('/layouts/')
          const pagesIndex = filePath.indexOf('/pages/')

          if (componentsIndex !== -1) {
            fetchPath = '/src' + filePath.substring(componentsIndex)
          } else if (layoutsIndex !== -1) {
            fetchPath = '/src' + filePath.substring(layoutsIndex)
          } else if (pagesIndex !== -1) {
            fetchPath = '/src' + filePath.substring(pagesIndex)
          }
        }
      }

      if (window.__VUE_MAPPER_DEBUG__) {
        console.log(`[vue-mapper] 尝试访问: ${filePath} → ${fetchPath}`)
      }

      const response = await fetch(fetchPath)
      if (response.ok) {
        return await response.text()
      } else {
        if (window.__VUE_MAPPER_DEBUG__) {
          console.warn(`[vue-mapper] HTTP ${response.status}: ${fetchPath}`)
        }
      }
    } catch (e) {
      if (window.__VUE_MAPPER_DEBUG__) {
        console.warn('[vue-mapper] 获取文件失败:', filePath, e.message)
      }
      return null
    }
  }
  return null
}

// 默认导出，保持向后兼容性
export default {
  mapAllCoverageV2,
  autoMapV2
}
