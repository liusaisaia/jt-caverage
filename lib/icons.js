/**
 * 原生图标集合 - 替代ElementUI图标
 * 使用SVG实现，支持PC和H5端
 */

// 视频暂停图标
export const videoPauseIcon = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="4" y="2" width="2" height="12" rx="0.5"/>
    <rect x="10" y="2" width="2" height="12" rx="0.5"/>
  </svg>
`;

// 数据分析图标
export const dataAnalysisIcon = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="10" width="2" height="4" rx="0.5"/>
    <rect x="7" y="6" width="2" height="8" rx="0.5"/>
    <rect x="12" y="2" width="2" height="12" rx="0.5"/>
    <path d="M4 10L9 6L14 2" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </svg>
`;

// 确认图标
export const confirmIcon = `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="#FFC107" opacity="0.1"/>
    <circle cx="24" cy="24" r="16" fill="#FFC107" opacity="0.2"/>
    <path d="M24 12V24M24 32V34" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/>
    <circle cx="24" cy="34" r="1" fill="#FFC107"/>
  </svg>
`;

// 成功图标
export const successIcon = `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="#4CAF50" opacity="0.1"/>
    <circle cx="24" cy="24" r="16" fill="#4CAF50" opacity="0.2"/>
    <path d="M18 24L22 28L30 20" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

// 错误图标
export const errorIcon = `
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="#F44336" opacity="0.1"/>
    <circle cx="24" cy="24" r="16" fill="#F44336" opacity="0.2"/>
    <path d="M18 18L30 30M30 18L18 30" stroke="#F44336" stroke-width="3" stroke-linecap="round"/>
  </svg>
`;

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
        };
      }
    },
    template: `
      <span :style="iconStyle" v-html="iconSvg"></span>
    `
  };
}

// 导出常用图标组件
export const VideoPause = createIconComponent(videoPauseIcon, { name: 'VideoPauseIcon' });
export const DataAnalysis = createIconComponent(dataAnalysisIcon, { name: 'DataAnalysisIcon' });