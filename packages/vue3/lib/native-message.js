/**
 * 原生消息提示组件 - 替代ElementUI的$message
 * 支持PC和H5端，多种消息类型
 */

import { successIcon, errorIcon, confirmIcon } from './icons.js';

class NativeMessage {
  constructor(options = {}) {
    this.options = {
      message: '',
      type: 'info', // info, success, error, warning
      duration: 3000,
      showClose: true,
      center: false,
      offset: 20,
      customClass: '',
      ...options
    };
    
    this.messageEl = null;
    this.timer = null;
  }

  /**
   * 创建消息元素
   */
  createMessage() {
    const messageEl = document.createElement('div');
    messageEl.className = `native-message native-message--${this.options.type} ${this.options.customClass}`;
    messageEl.innerHTML = this.getMessageHTML();
    
    // 设置位置
    this.setMessagePosition(messageEl);
    
    return messageEl;
  }

  /**
   * 获取消息HTML
   */
  getMessageHTML() {
    const icons = {
      info: confirmIcon,
      success: successIcon,
      error: errorIcon,
      warning: confirmIcon
    };

    const icon = icons[this.options.type] || icons.info;
    
    return `
      <div class="native-message-content">
        <div class="native-message-icon">${icon}</div>
        <div class="native-message-text">${this.options.message}</div>
        ${this.options.showClose ? 
          '<button class="native-message-close" type="button">×</button>' : 
          ''
        }
      </div>
    `;
  }

  /**
   * 设置消息位置
   */
  setMessagePosition(messageEl) {
    const messages = document.querySelectorAll('.native-message');
    const offset = this.options.offset;
    const lastMessage = messages[messages.length - 1];
    
    let top = offset;
    if (lastMessage) {
      const lastMessageRect = lastMessage.getBoundingClientRect();
      top = lastMessageRect.bottom + 16;
    }
    
    messageEl.style.top = `${top}px`;
    
    // 水平居中
    if (this.options.center) {
      messageEl.style.left = '50%';
      messageEl.style.transform = 'translateX(-50%)';
    } else {
      messageEl.style.left = 'auto';
      messageEl.style.right = '20px';
    }
  }

  /**
   * 添加消息样式
   */
  addMessageStyles() {
    if (document.getElementById('native-message-styles')) return;

    const style = document.createElement('style');
    style.id = 'native-message-styles';
    style.textContent = `
      .native-message {
        position: fixed;
        z-index: 9999;
        min-width: 280px;
        max-width: 400px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        transition: all 0.3s ease;
        animation: slideInRight 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .native-message-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .native-message-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }

      .native-message-icon svg {
        width: 100%;
        height: 100%;
      }

      .native-message-text {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        margin: 0;
      }

      .native-message-close {
        flex-shrink: 0;
        background: none;
        border: none;
        font-size: 20px;
        color: #999;
        cursor: pointer;
        padding: 0;
        margin: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.3s ease;
      }

      .native-message-close:hover {
        color: #666;
      }

      /* 消息类型样式 */
      .native-message--info {
        border-left: 4px solid #409eff;
      }

      .native-message--success {
        border-left: 4px solid #67c23a;
      }

      .native-message--warning {
        border-left: 4px solid #e6a23c;
      }

      .native-message--error {
        border-left: 4px solid #f56c6c;
      }

      /* H5端适配 */
      @media (max-width: 768px) {
        .native-message {
          min-width: auto;
          max-width: calc(100vw - 32px);
          left: 16px !important;
          right: 16px !important;
          transform: none !important;
          margin: 0 auto;
        }
      }

      /* 动画 */
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const closeBtn = this.messageEl.querySelector('.native-message-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // 点击消息内容不关闭
    const content = this.messageEl.querySelector('.native-message-content');
    if (content) {
      content.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  /**
   * 显示消息
   */
  show() {
    this.addMessageStyles();
    this.messageEl = this.createMessage();
    document.body.appendChild(this.messageEl);
    this.bindEvents();

    // 自动关闭
    if (this.options.duration > 0) {
      this.timer = setTimeout(() => {
        this.close();
      }, this.options.duration);
    }

    return this;
  }

  /**
   * 关闭消息
   */
  close() {
    if (!this.messageEl) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 添加关闭动画
    this.messageEl.style.animation = 'fadeOut 0.3s ease';
    
    setTimeout(() => {
      if (this.messageEl && this.messageEl.parentNode) {
        this.messageEl.parentNode.removeChild(this.messageEl);
      }
      this.messageEl = null;
    }, 300);
  }
}

/**
 * 消息函数 - 替代this.$message
 * @param {string|Object} message - 消息内容或配置对象
 * @param {Object} options - 配置选项
 * @returns {NativeMessage} 消息实例
 */
export function $message(message, options = {}) {
  // 支持多种参数格式
  if (typeof message === 'object') {
    options = message;
    message = options.message || '';
  } else {
    options.message = message;
  }

  const nativeMessage = new NativeMessage(options);
  return nativeMessage.show();
}

// 快捷方法
$message.success = (message, options = {}) => {
  return $message(message, { ...options, type: 'success' });
};

$message.error = (message, options = {}) => {
  return $message(message, { ...options, type: 'error' });
};

$message.warning = (message, options = {}) => {
  return $message(message, { ...options, type: 'warning' });
};

$message.info = (message, options = {}) => {
  return $message(message, { ...options, type: 'info' });
};

/**
 * Vue插件安装函数
 */
export default {
  install(Vue) {
    // 添加到Vue原型
    Vue.prototype.$message = $message;
    
    // 也作为全局函数提供
    Vue.$message = $message;
  }
};