import { confirmIcon, successIcon, errorIcon } from './icons.js'

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
    }

    this.modal = null
    this.resolve = null
    this.reject = null
    this.handleKeydown = this.handleKeydown.bind(this)
  }

  createModal() {
    const modal = document.createElement('div')
    modal.className = 'native-confirm-modal'
    modal.innerHTML = this.getModalHTML()
    this.addModalStyles()
    return modal
  }

  getModalHTML() {
    const icons = {
      info: confirmIcon,
      success: successIcon,
      error: errorIcon,
      warning: confirmIcon
    }

    return `
      <div class="native-confirm-mask"></div>
      <div class="native-confirm-wrapper">
        <div class="native-confirm-container ${this.options.customClass}">
          <div class="native-confirm-header">
            <div class="native-confirm-icon-wrapper">${icons[this.options.type] || icons.info}</div>
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
    `
  }

  addModalStyles() {
    if (document.getElementById('native-confirm-styles')) return

    const style = document.createElement('style')
    style.id = 'native-confirm-styles'
    style.textContent = `
      .native-confirm-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Segoe UI", Roboto, sans-serif; }
      .native-confirm-mask { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px); animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      .native-confirm-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; pointer-events: none; }
      .native-confirm-container { pointer-events: auto; background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.08); max-width: 420px; width: 100%; animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); overflow: hidden; display: flex; flex-direction: column; }

      .native-confirm-header { padding: 32px 24px 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
      .native-confirm-icon-wrapper { display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; margin-bottom: 4px; }
      .native-confirm-icon-wrapper svg { width: 100%; height: 100%; }
      .native-confirm-title { font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0; line-height: 1.4; }

      .native-confirm-body { padding: 0 32px 24px; text-align: center; flex: 1; }
      .native-confirm-message { font-size: 15px; color: #595959; line-height: 1.6; margin: 0; }

      .native-confirm-footer { padding: 0 24px 32px; text-align: center; display: flex; justify-content: center; gap: 12px; }
      .native-confirm-btn { min-width: 100px; padding: 10px 24px; border: none; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); outline: none; user-select: none; }

      .native-confirm-cancel { background: #f0f2f5; color: #595959; border: 1px solid transparent; }
      .native-confirm-cancel:hover { background: #e6e8eb; color: #262626; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
      .native-confirm-cancel:active { transform: translateY(1px); background: #d9dce0; }

      .native-confirm-confirm { background: #1677ff; color: white; box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045); }
      .native-confirm-confirm:hover { background: #4096ff; box-shadow: 0 4px 12px rgba(22, 119, 255, 0.2); }
      .native-confirm-confirm:active { transform: translateY(1px); background: #0958d9; }

      @media (max-width: 768px) {
        .native-confirm-container { max-width: 85vw; border-radius: 16px; }
        .native-confirm-footer { flex-direction: column-reverse; padding: 0 20px 24px; }
        .native-confirm-btn { width: 100%; padding: 12px 0; border-radius: 10px; }
        .native-confirm-cancel { background: transparent; color: #8c8c8c; margin-top: 4px; }
        .native-confirm-cancel:hover { background: #f5f5f5; }
      }

      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes popIn {
        0% { opacity: 0; transform: scale(0.9) translateY(10px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
    `
    document.head.appendChild(style)
  }

  bindEvents() {
    const confirmBtn = this.modal.querySelector('.native-confirm-confirm')
    const cancelBtn = this.modal.querySelector('.native-confirm-cancel')
    const mask = this.modal.querySelector('.native-confirm-mask')

    confirmBtn.addEventListener('click', () => { this.close(true) })
    if (cancelBtn) { cancelBtn.addEventListener('click', () => { this.close(false) }) }
    mask.addEventListener('click', () => { if (this.options.showCancel) { this.close(false) } })
    document.addEventListener('keydown', this.handleKeydown)
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      if (this.options.showCancel) { this.close(false) }
    }
  }

  show() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
      this.modal = this.createModal()
      document.body.appendChild(this.modal)
      this.bindEvents()
      document.body.style.overflow = 'hidden'
    })
  }

  close(result) {
    if (!this.modal) return
    document.body.style.overflow = ''
    document.removeEventListener('keydown', this.handleKeydown)
    this.modal.classList.add('closing')
    setTimeout(() => {
      if (this.modal && this.modal.parentNode) { this.modal.parentNode.removeChild(this.modal) }
      this.modal = null
      if (result) { this.resolve && this.resolve('confirm') } else { this.reject && this.reject('cancel') }
    }, 300)
  }
}
