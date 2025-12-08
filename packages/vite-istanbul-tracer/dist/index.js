/**
 * Vite Plugin Istanbul SourceMap Trace Plugin
 * 专为vite-plugin-istanbul设计的sourcemap偏移修正插件
 * 解决vite-plugin-istanbul在transform阶段插桩导致的sourcemap偏移问题
 */

import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'
import { SourceMapConsumer, SourceMapGenerator } from 'source-map'

/**
 * 专为vite-plugin-istanbul设计的sourcemap偏移修正插件
 * 解决Vite transform阶段插桩导致的sourcemap偏移问题
 */
class ViteIstanbulSourceMapTracePlugin {
  constructor(options = {}) {
    // 合并默认选项和用户选项
    this.options = {
      // 默认启用调试模式
      debug: options.debug !== false,
      // 自动修正偏移
      autoFix: options.autoFix !== false,
      // 处理Vite插件常见的文件类型
      include: options.include || /\.(vue|js|jsx|ts|tsx|mjs)$/,
      // 排除node_modules和测试文件
      exclude: options.exclude || /node_modules|\.test\.|\.spec\./,
      // 专门针对vite-plugin-istanbul的配置
      istanbulOptions: {
        // 检测插桩代码的特征模式
        instrumentCodePattern: /__cov_\w+|cov_\w+|__coverage__/,
        // 典型的插桩代码行数偏移
        expectedLineOffset: 2,
        // 是否处理Vue SFC文件
        handleVueSFC: true,
        ...options.istanbulOptions
      },
      ...options
    }
    
    // 应用类型转换和验证
    this.options = this._normalizeIncludeExclude(this.options)
    
    this.offsetCache = new Map()
    this.processedFiles = new Set()
  }
  
  /**
   * 类型转换和验证方法 - 将include/exclude选项转换为正确格式
   */
  _normalizeIncludeExclude(options) {
    const { include, exclude } = options
    
    // 处理include：如果是字符串，转换为正则表达式
    if (typeof include === 'string') {
      // 将glob模式转换为正则表达式
      const globPattern = include
        .replace(/\*\*/g, '.*')  // ** 转换为 .*
        .replace(/\*/g, '[^/]*')  // * 转换为 [^/]*
        .replace(/\?/g, '.')     // ? 转换为 .
      options.include = new RegExp(`^${globPattern}$`)
    } else if (include instanceof RegExp === false) {
      options.include = /\.(vue|js|jsx|ts|tsx|mjs)$/
    }
    
    // 处理exclude：如果是数组，转换为正则表达式
    if (Array.isArray(exclude)) {
      const pattern = exclude.map(item => {
        if (typeof item === 'string') {
          // 将glob模式转换为正则表达式
          return item
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '.')
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
        }
        return item
      }).join('|')
      options.exclude = new RegExp(`(${pattern})`)
    } else if (typeof exclude === 'string') {
      // 将glob模式转换为正则表达式
      const globPattern = exclude
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.')
      options.exclude = new RegExp(`^${globPattern}$`)
    } else if (exclude instanceof RegExp === false) {
      options.exclude = /node_modules|\.test\.|\.spec\./
    }
    
    return options
  }

  /**
   * Vite插件接口 - 专为vite-plugin-istanbul优化
   */
  vite() {
    const plugin = this
    
    return {
      name: 'vite-istanbul-sourcemap-trace',
      enforce: 'post', // 确保在vite-plugin-istanbul之后执行
      
      transform(code, id, options) {
        // 跳过已处理的文件，避免循环处理
        if (plugin.processedFiles.has(id)) {
          return null
        }

        // 检查文件类型
        if (!plugin.options.include.test(id) || plugin.options.exclude.test(id)) {
          return null
        }

        // 获取当前处理后的sourcemap
        const sourceMap = this.getCombinedSourcemap()
        if (!sourceMap) {
          return null
        }

        // 检查是否已经包含vite-plugin-istanbul的插桩代码
        if (!plugin.hasIstanbulInstrumentation(code)) {
          return null
        }

        try {
          plugin.processedFiles.add(id)
          
          // 检测和修正vite-plugin-istanbul导致的偏移
          const fixedSourceMap = plugin.fixViteIstanbulOffset(sourceMap, id, code)
          
          if (fixedSourceMap && fixedSourceMap !== sourceMap) {
            if (plugin.options.debug) {
              console.log(`[ViteIstanbulSourceMapTrace] 修正vite-plugin-istanbul偏移: ${id}`)
            }
            
            return {
              code,
              map: fixedSourceMap
            }
          }
        } catch (error) {
          if (plugin.options.debug) {
            console.warn(`[ViteIstanbulSourceMapTrace] 处理失败: ${id}`, error)
          }
        }
        
        return null
      }
    }
  }

  /**
   * Webpack插件接口
   */
  webpack() {
    const plugin = this
    
    return {
      apply(compiler) {
        compiler.hooks.compilation.tap('CoverageSourceMapTracePlugin', (compilation) => {
          compilation.hooks.processAssets.tapAsync(
            {
              name: 'CoverageSourceMapTracePlugin',
              stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER
            },
            async (assets, callback) => {
              try {
                await plugin.processAssets(assets)
                callback()
              } catch (error) {
                callback(error)
              }
            }
          )
        })
      }
    }
  }

  /**
   * 处理Webpack资源
   */
  async processAssets(assets) {
    for (const [fileName, asset] of Object.entries(assets)) {
      if (!fileName.endsWith('.map')) {
        continue
      }

      try {
        const sourceMap = JSON.parse(asset.source())
        const fixedSourceMap = await this.fixCoverageOffset(sourceMap, fileName)
        
        if (fixedSourceMap && fixedSourceMap !== sourceMap) {
          assets[fileName] = {
            source: () => JSON.stringify(fixedSourceMap, null, 2),
            size: () => JSON.stringify(fixedSourceMap, null, 2).length
          }
          
          if (this.options.debug) {
            console.log(`[CoverageSourceMapTrace] 修正覆盖率sourcemap: ${fileName}`)
          }
        }
      } catch (error) {
        if (this.options.debug) {
          console.warn(`[CoverageSourceMapTrace] 处理sourcemap失败: ${fileName}`, error)
        }
      }
    }
  }

  /**
   * 检查代码是否包含Istanbul插桩代码
   */
  _hasIstanbulInstrumentation(code) {
    return this.options.istanbulOptions.instrumentCodePattern.test(code)
  }
  
  /**
   * 检测是否包含Istanbul插桩代码 - 公共方法（向后兼容）
   */
  hasIstanbulInstrumentation(code) {
    return this._hasIstanbulInstrumentation(code);
  }

  /**
   * 修正vite-plugin-istanbul导致的偏移（核心方法）
   * 专门针对Vite transform阶段的插桩偏移
   */
  async fixViteIstanbulOffset(sourceMap, fileName, code = '') {
    try {
      // 创建TraceMap进行快速偏移检测 - 关键改进：更精确地初始化TraceMap
      const tracer = new TraceMap(sourceMap)
      
      // 检测是否存在vite-plugin-istanbul特定的偏移
      const hasOffset = this.detectViteIstanbulOffset(tracer, fileName, code)
      
      if (!hasOffset) {
        return sourceMap
      }

      if (this.options.debug) {
        console.log(`[ViteIstanbulSourceMapTrace] 检测到vite-plugin-istanbul偏移: ${fileName}`)
        // 增加更详细的调试信息，记录修复前的行号
        const originalLines = code ? code.split('\n').length : 0
        console.log(`[ViteIstanbulSourceMapTrace] 文件 ${fileName}: 原始行数 ${originalLines}`)
      }

      // 使用SourceMapConsumer进行精确修正
      const fixedMap = await this.correctViteIstanbulOffset(sourceMap, fileName, code)
      
      if (this.options.debug && fixedMap && fixedMap !== sourceMap) {
        console.log(`[ViteIstanbulSourceMapTrace] 成功修正vite-plugin-istanbul偏移: ${fileName}`)
      }
      
      return fixedMap
      
    } catch (error) {
      if (this.options.debug) {
        console.warn(`[ViteIstanbulSourceMapTrace] 偏移修正失败: ${fileName}`, error)
      }
      return sourceMap
    }
  }

  /**
   * 检测vite-plugin-istanbul导致的偏移
   * 专门针对Vite transform阶段的插桩特点
   */
  detectViteIstanbulOffset(tracer, fileName, code) {
    try {
      // 获取文件扩展名
      const ext = fileName.split('.').pop().toLowerCase()
      
      // Vue文件特殊处理（vite-plugin-istanbul的主要场景）
      if (ext === 'vue' && this.options.istanbulOptions.handleVueSFC) {
        return this.detectVueIstanbulOffset(tracer, code)
      }
      
      // JS/TS文件处理
      return this.detectJSIstanbulOffset(tracer, code)
      
    } catch (error) {
      if (this.options.debug) {
        console.warn(`[ViteIstanbulSourceMapTrace] 偏移检测失败: ${fileName}`, error)
      }
      return false
    }
  }

  /**
   * 检测Vue文件中vite-plugin-istanbul导致的偏移
   */
  detectVueIstanbulOffset(tracer, code) {
    // 检测vite-plugin-istanbul在Vue SFC中的插桩模式
    const lines = code.split('\n')
    let hasTemplateInstrumentation = false
    let hasScriptInstrumentation = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // 检测模板中的插桩代码
      if (line.includes('<template>')) {
        // 检查模板部分是否有插桩代码
        for (let j = i + 1; j < lines.length && !lines[j].includes('</template>'); j++) {
          if (this.options.istanbulOptions.instrumentCodePattern.test(lines[j])) {
            hasTemplateInstrumentation = true
            break
          }
        }
      }
      
      // 检测脚本中的插桩代码
      if (line.includes('<script') && !line.includes('</script>')) {
        // 检查脚本部分是否有插桩代码
        for (let j = i + 1; j < lines.length && !lines[j].includes('</script>'); j++) {
          if (this.options.istanbulOptions.instrumentCodePattern.test(lines[j])) {
            hasScriptInstrumentation = true
            break
          }
        }
      }
      
      // 如果检测到插桩，检查sourcemap是否有偏移
      if (hasTemplateInstrumentation || hasScriptInstrumentation) {
        const originalPos = originalPositionFor(tracer, { line: i + 1, column: 1 })
        if (originalPos.source && originalPos.line !== i + 1) {
          if (this.options.debug) {
            console.log(`[ViteIstanbulSourceMapTrace] Vue文件检测到vite-plugin-istanbul偏移: line ${i + 1} -> ${originalPos.line}`)
          }
          return true
        }
      }
    }
    
    return false
  }

  /**
   * 检测JS文件中vite-plugin-istanbul导致的偏移
   */
  detectJSIstanbulOffset(tracer, code) {
    // 检测JS文件中vite-plugin-istanbul的插桩模式
    const lines = code.split('\n')
    
    // 查找插桩代码的位置
    let instrumentStartLine = -1
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      if (this.options.istanbulOptions.instrumentCodePattern.test(lines[i])) {
        instrumentStartLine = i
        break
      }
    }
    
    if (instrumentStartLine === -1) {
      return false
    }
    
    // 检测插桩代码附近的sourcemap偏移
    for (let i = Math.max(0, instrumentStartLine - 2); i < Math.min(lines.length, instrumentStartLine + 5); i++) {
      const originalPos = originalPositionFor(tracer, { line: i + 1, column: 1 })
      
      // vite-plugin-istanbul通常在插桩时引入2-3行的偏移
      if (originalPos.source && Math.abs(originalPos.line - (i + 1)) >= this.options.istanbulOptions.expectedLineOffset) {
        if (this.options.debug) {
          console.log(`[ViteIstanbulSourceMapTrace] JS文件检测到vite-plugin-istanbul偏移: line ${i + 1} -> ${originalPos.line}`)
        }
        return true
      }
    }
    
    return false
  }

  /**
   * 修正vite-plugin-istanbul导致的偏移（核心修正逻辑）
   */
  async correctViteIstanbulOffset(sourceMap, fileName, code) {
    try {
      const consumer = await new SourceMapConsumer(sourceMap)
      const generator = new SourceMapGenerator()
      
      // 复制基础信息
      const sources = consumer.sources
      for (const source of sources) {
        const content = consumer.sourceContentFor(source, true)
        if (content) {
          generator.setSourceContent(source, content)
        }
      }
      
      // 根据文件类型应用不同的修正策略
      const ext = fileName.split('.').pop().toLowerCase()
      const isVue = ext === 'vue'
      
      // 修正映射
      consumer.eachMapping((mapping) => {
        // 应用vite-plugin-istanbul特定的偏移修正
        const correctedMapping = this.correctMappingForViteIstanbul(mapping, isVue)
        
        generator.addMapping({
          generated: {
            line: correctedMapping.generatedLine,
            column: correctedMapping.generatedColumn
          },
          original: {
            line: correctedMapping.originalLine,
            column: correctedMapping.originalColumn
          },
          source: correctedMapping.source || mapping.source,
          name: mapping.name
        })
      })
      
      // 清理资源
      consumer.destroy()
      
      return generator.toJSON()
      
    } catch (error) {
      if (this.options.debug) {
        console.warn(`[ViteIstanbulSourceMapTrace] Consumer修正失败: ${fileName}`, error)
      }
      return sourceMap
    }
  }

  /**
   * 修正映射位置（vite-plugin-istanbul专用）
   * 针对Vite transform阶段的插桩特点进行修正
   */
  correctMappingForViteIstanbul(mapping, isVue = false) {
    // vite-plugin-istanbul的插桩特点：
    // 1. 通常在文件开头插入2-3行覆盖率初始化代码
    // 2. 在每个可执行语句前插入计数代码
    // 3. Vue SFC文件可能在模板和脚本部分都有插桩
    
    let lineOffset = 0
    let columnOffset = 0
    
    // 重要修复：基于generatedLine而不是originalLine计算偏移量
    // 这样可以确保覆盖率数据正确映射到实际代码行而不是注释行
    if (isVue) {
      // Vue文件处理逻辑 - 基于generatedLine判断
      if (mapping.generatedLine <= 20) {
        // 文件开头的插桩通常影响前20行
        lineOffset = -this.options.istanbulOptions.expectedLineOffset
      }
      // 对于Vue组件，在脚本标签后的区域也需要特殊处理
      if (mapping.generatedLine > 20 && mapping.generatedLine <= 50) {
        lineOffset = -1
      }
    } else {
      // JS/TS文件处理逻辑 - 基于generatedLine判断
      if (mapping.generatedLine <= 10) {
        // 文件开头的插桩影响
        lineOffset = -this.options.istanbulOptions.expectedLineOffset
      } else if (mapping.generatedLine > 10 && mapping.generatedLine <= 30) {
        // 语句级别的插桩，影响相对较小
        lineOffset = -1
      }
    }
    
    // 确保不会产生无效的行号
    const correctedGeneratedLine = Math.max(1, mapping.generatedLine + lineOffset)
    
    return {
      generatedLine: correctedGeneratedLine,
      generatedColumn: mapping.generatedColumn,
      originalLine: mapping.originalLine,
      originalColumn: mapping.originalColumn,
      source: mapping.source
    }
  }
}

/**
 * 工厂函数 - 专为vite-plugin-istanbul设计
 */
function createViteIstanbulTracer(options) {
  return new ViteIstanbulSourceMapTracePlugin(options)
}

export { ViteIstanbulSourceMapTracePlugin, createViteIstanbulTracer }
// 确保默认导出是类构造函数
export default ViteIstanbulSourceMapTracePlugin