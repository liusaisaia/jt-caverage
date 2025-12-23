/**
 * Vue SFC 文件解析器
 * 用于获取 script 标签的准确位置，以便修正 SourceMap 映射
 */

export class VueSFCParser {
  /**
   * 解析 Vue 文件，返回 script 位置信息
   * @param {string} source - Vue 文件源码
   * @returns {Object|null} 解析结果
   */
  static parse(source) {
    const lines = source.split('\n')
    let scriptTagLine = -1
    let scriptEndLine = -1
    let isScriptSetup = false
    let scriptAttrs = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // 找到 <script> 或 <script setup> 标签
      if (line.startsWith('<script')) {
        scriptTagLine = i + 1  // 转换为 1-based 行号
        isScriptSetup = line.includes('setup')
        scriptAttrs = line
      }

      // 找到 </script> 结束标签
      if (line.includes('</script>') && scriptTagLine > 0) {
        scriptEndLine = i + 1  // 转换为 1-based 行号
        break
      }
    }

    if (scriptTagLine === -1) {
      return null  // 没有 script 标签
    }

    return {
      scriptTagLine,                              // <script> 标签所在行（如第 31 行）
      scriptContentStart: scriptTagLine + 1,      // 实际代码开始行（如第 32 行）
      scriptEnd: scriptEndLine,                   // </script> 所在行（如第 45 行）
      isScriptSetup,                              // 是否是 <script setup>
      scriptAttrs,                                // script 标签属性
      scriptLines: scriptEndLine - scriptTagLine - 1  // script 内容行数
    }
  }

  /**
   * 修正 Vue 文件的行号映射
   * @param {number} mappedLine - SourceMap 映射的行号
   * @param {number} compiledLine - 编译后代码的行号
   * @param {Object} vueStructure - parse() 返回的结构
   * @param {boolean} verbose - 是否输出详细日志
   * @returns {number|null} 修正后的行号，null 表示无效映射
   */
  static correctMapping(mappedLine, compiledLine, vueStructure, verbose = false) {
    if (!vueStructure) {
      return mappedLine  // 非 Vue 文件，不处理
    }

    // 情况 1: 映射到了 script 标签之前（template、注释等）
    if (mappedLine < vueStructure.scriptTagLine) {
      // SourceMap 映射错误，需要重新计算
      // 编译后的代码应该对应 script 内容
      const correctedLine = vueStructure.scriptContentStart + (compiledLine - 1)

      if (verbose) {
        console.warn(
          `[vue-mapper] 🔧 修正映射：编译后第 ${compiledLine} 行\n` +
          `  错误：SourceMap 映射到第 ${mappedLine} 行（script 之前）\n` +
          `  修正：重新计算为第 ${correctedLine} 行（script 内）`
        )
      }

      return correctedLine
    }

    // 情况 2: 映射在 script 范围内（正确）
    if (mappedLine >= vueStructure.scriptContentStart &&
      mappedLine < vueStructure.scriptEnd) {
      // 已经正确，不需要修正
      return mappedLine
    }

    // 情况 3: 映射到了 script 结束标签或之后（style 等）
    if (mappedLine >= vueStructure.scriptEnd) {
      if (verbose) {
        console.warn(
          `[vue-mapper] ⚠️ 无效映射：第 ${mappedLine} 行在 script 之后，标记为无效`
        )
      }
      return null  // 无效映射
    }

    // 默认返回映射结果
    return mappedLine
  }

  /**
   * 获取 script 块的描述信息（用于日志）
   * @param {Object} vueStructure - parse() 返回的结构
   * @returns {string}
   */
  static getScriptInfo(vueStructure) {
    if (!vueStructure) {
      return '无 script 块'
    }

    const type = vueStructure.isScriptSetup ? '<script setup>' : '<script>'
    return `${type} 第 ${vueStructure.scriptContentStart}-${vueStructure.scriptEnd - 1} 行（${vueStructure.scriptLines} 行代码）`
  }
}
