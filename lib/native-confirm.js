/**
 * 原生确认对话框组件 - 替代ElementUI的$confirm
 * 支持PC和H5端，响应式设计
 */

import { confirmIcon, successIcon, errorIcon } from './icons.js';

export class NativeConfirm {
  constructor(options = {}) {
    this.options = {
      title: '提示',
      message: '',
      type: 'info', // info, success, error, warning
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showCancel: true,
      customClass: '',
      ...options
    };
    
    this.modal = null;
    this.resolve = null;
    this.reject = null;
    
    // 绑定this上下文
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  /**
   * 创建模态框DOM结构
   */
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'native-confirm-modal';
    modal.innerHTML = this.getModalHTML();
    
    // 添加样式
    this.addModalStyles();
    
    return modal;
  }

  /**
   * 获取模态框HTML
   */
  getModalHTML() {
    const icons = {
      info: confirmIcon,
      success: successIcon,
      error: errorIcon,
      warning: confirmIcon
    };

    return `
      <div class="native-confirm-mask"></div>
      <div class="native-confirm-wrapper">
        <div class="native-confirm-container ${this.options.customClass}">
          <div class="native-confirm-header">
            <div class="native-confirm-icon">${icons[this.options.type] || icons.info}</div>
            <div class="native-confirm-title">${this.options.title}</div>
          </div>
          <div class="native-confirm-body">
            <div class="native-confirm-message">${this.options.message}</div>
          </div>
          <div class="native-confirm-footer">
            ${this.options.showCancel ? 
              `<button class="native-confirm-btn native-confirm-cancel">${this.options.cancelButtonText}</button>` : 
              ''
            }
            <button class="native-confirm-btn native-confirm-confirm">${this.options.confirmButtonText}</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 添加模态框样式
   */
  addModalStyles() {
    if (document.getElementById('native-confirm-styles')) return;

    const style = document.createElement('style');
    style.id = 'native-confirm-styles';
    style.textContent = `
      .native-confirm-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .native-confirm-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s ease;
      }

      .native-confirm-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      }

      .native-confirm-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        max-width: 400px;
        width: 100%;
        animation: slideUp 0.3s ease;
        overflow: hidden;
      }

      .native-confirm-header {
        padding: 24px 24px 16px;
        text-align: center;
        border-bottom: 1px solid #f0f0f0;
      }

      .native-confirm-icon {
        margin-bottom: 12px;
      }

      .native-confirm-title {
        font-size: 18px;
        font-weight: 500;
        color: #333;
        margin: 0;
      }

      .native-confirm-body {
        padding: 16px 24px;
        text-align: center;
      }

      .native-confirm-message {
        font-size: 14px;
        color: #666;
        line-height: 1.5;
        margin: 0;
      }

      .native-confirm-footer {
        padding: 16px 24px 24px;
        text-align: right;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .native-confirm-btn {
        padding: 8px 20px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
      }

      .native-confirm-cancel {
        background: #f5f5f5;
        color: #666;
      }

      .native-confirm-cancel:hover {
        background: #e8e8e8;
      }

      .native-confirm-confirm {
        background: #409eff;
        color: white;
      }

      .native-confirm-confirm:hover {
        background: #66b1ff;
      }

      .native-confirm-btn:active {
        transform: scale(0.98);
      }

      /* H5端适配 */
      @media (max-width: 768px) {
        .native-confirm-container {
          max-width: 90%;
          margin: 0 auto;
        }
        
        .native-confirm-footer {
          flex-direction: column-reverse;
        }
        
        .native-confirm-btn {
          width: 100%;
          padding: 12px 20px;
        }
      }

      /* 动画 */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const confirmBtn = this.modal.querySelector('.native-confirm-confirm');
    const cancelBtn = this.modal.querySelector('.native-confirm-cancel');
    const mask = this.modal.querySelector('.native-confirm-mask');

    confirmBtn.addEventListener('click', () => {
      this.close(true);
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.close(false);
      });
    }

    mask.addEventListener('click', () => {
      if (this.options.showCancel) {
        this.close(false);
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * 键盘事件处理
   */
  handleKeydown(e) {
    if (e.key === 'Escape') {
      if (this.options.showCancel) {
        this.close(false);
      }
    }
  }

  /**
   * 显示确认框
   */
  show() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.modal = this.createModal();
      document.body.appendChild(this.modal);
      this.bindEvents();

      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    });
  }

  /**
   * 关闭确认框
   */
  close(result) {
    if (!this.modal) return;

    // 恢复背景滚动
    document.body.style.overflow = '';
    
    // 移除事件监听
    document.removeEventListener('keydown', this.handleKeydown);

    // 添加关闭动画
    this.modal.classList.add('closing');
    
    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      this.modal = null;

      if (result) {
        this.resolve && this.resolve('confirm');
      } else {
        this.reject && this.reject('cancel');
      }
    }, 300);
  }
}

/**
 * 全局确认函数 - 替代this.$confirm
 * @param {string|Object} message - 消息内容或配置对象
 * @param {string} title - 标题
 * @param {Object} options - 配置选项
 * @returns {Promise} Promise对象
 */
export function $confirm(message, title = '提示', options = {}) {
  // 支持多种参数格式
  if (typeof message === 'object') {
    options = message;
    message = options.message || '';
    title = options.title || '提示';
  }

  const confirmOptions = {
    message,
    title,
    ...options
  };

  const confirm = new NativeConfirm(confirmOptions);
  return confirm.show();
}

/**
 * Vue插件安装函数
 */
export default {
  install(Vue) {
    // 添加到Vue原型
    Vue.prototype.$confirm = $confirm;
    
    // 也作为全局函数提供
    Vue.$confirm = $confirm;
  }
};