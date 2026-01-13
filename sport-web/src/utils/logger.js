/**
 * 统一日志工具
 * 生产环境自动禁用调试日志
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

/**
 * 开发环境日志
 * 仅在开发模式下输出
 */
export const devLog = (...args) => {
  if (isDevelopment) {
    console.log('[DEV]', ...args)
  }
}

/**
 * 开发环境调试日志
 */
export const devDebug = (...args) => {
  if (isDevelopment) {
    console.debug('[DEBUG]', ...args)
  }
}

/**
 * 开发环境警告日志
 */
export const devWarn = (...args) => {
  if (isDevelopment) {
    console.warn('[WARN]', ...args)
  }
}

/**
 * 错误日志 - 始终输出
 * 用于记录运行时错误
 */
export const errorLog = (...args) => {
  console.error('[ERROR]', ...args)
}

/**
 * 生产环境日志
 * 用于关键操作的审计日志，始终输出
 */
export const auditLog = (action, details) => {
  console.log('[AUDIT]', action, details)
}

export default {
  dev: devLog,
  debug: devDebug,
  warn: devWarn,
  error: errorLog,
  audit: auditLog
}
