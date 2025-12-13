/**
 * 原生图标集合 - 替代ElementUI图标
 * 使用SVG实现，支持PC和H5端
 */

// 视频暂停图标
// 视频暂停图标 (停止覆盖率 - 显示器+电源)
export const videoPauseIcon = `
<svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 10C4 6.68629 6.68629 4 10 4H38C41.3137 4 44 6.68629 44 10V30C44 33.3137 41.3137 36 38 36H10C6.68629 36 4 33.3137 4 30V10Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
  <path d="M4 30H44V31C44 33.7614 41.7614 36 39 36H9C6.23858 36 4 33.7614 4 31V30Z" fill="#1677FF" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
  <path d="M14 44H34" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24 36V44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24 13V19" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M30 17C31.1046 17.8954 32 19.3333 32 21C32 25.4183 28.4183 29 24 29C19.5817 29 16 25.4183 16 21C16 19.3333 16.8954 17.8954 18 17" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

// 数据分析图标
// 数据分析图标 (开启覆盖率 - 显示器+播放)
export const dataAnalysisIcon = `
<svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 10C4 6.68629 6.68629 4 10 4H38C41.3137 4 44 6.68629 44 10V30C44 33.3137 41.3137 36 38 36H10C6.68629 36 4 33.3137 4 30V10Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
  <path d="M4 30H44V31C44 33.7614 41.7614 36 39 36H9C6.23858 36 4 33.7614 4 31V30Z" fill="#1677FF" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
  <path d="M14 44H34" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24 36V44" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 15L32 21L20 27V15Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
</svg>
`

// 确认图标
export const confirmIcon = `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="#FFC107" opacity="0.1"/>
    <circle cx="24" cy="24" r="16" fill="#FFC107" opacity="0.2"/>
    <path d="M24 12V24M24 32V34" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
    <circle cx="24" cy="34" r="1" fill="#FFC107"/>
  </svg>
`

// 成功图标
export const successIcon = `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="#4CAF50" opacity="0.1"/>
    <circle cx="24" cy="24" r="16" fill="#4CAF50" opacity="0.2"/>
    <path d="M18 24L22 28L30 20" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

// 错误图标
export const errorIcon = `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="#F44336" opacity="0.1"/>
    <circle cx="24" cy="24" r="16" fill="#F44336" opacity="0.2"/>
    <path d="M18 18L30 30M30 18L18 30" stroke="#F44336" stroke-width="3" stroke-linecap="round"/>
  </svg>
`

/**
 * 图标组件工厂函数
 * @param {string} iconSvg - SVG字符串
 * @param {Object} options - 配置选项
 * @returns {Object} 图标组件
 */
export function createIconComponent(iconSvg, options = {}) {
  return {
    name: options.name || 'CustomIcon',
    props: {
      size: {
        type: [Number, String],
        default: 16
      },
      color: {
        type: String,
        default: 'currentColor'
      }
    },
    computed: {
      iconStyle() {
        return {
          width: typeof this.size === 'number' ? `${this.size}px` : this.size,
          height: typeof this.size === 'number' ? `${this.size}px` : this.size,
          color: this.color,
          display: 'inline-block',
          verticalAlign: 'middle'
        }
      }
    },
    render(h) {
      return h('span', {
        style: this.iconStyle,
        domProps: {
          innerHTML: iconSvg
        }
      })
    }
  }
}

// 导出常用图标组件
export const VideoPause = createIconComponent(videoPauseIcon, { name: 'VideoPauseIcon' })
export const DataAnalysis = createIconComponent(dataAnalysisIcon, { name: 'DataAnalysisIcon' })
