import axios from 'axios'

// 后端API基础URL，优先使用环境变量
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'}/api/v1`

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 只有在浏览器环境中才尝试从localStorage获取token
    if (typeof window !== 'undefined') {
      try {
        // 直接从localStorage获取auth状态，不依赖persist:root
        const authState = localStorage.getItem('auth')
        if (authState) {
          const parsedAuth = JSON.parse(authState)
          if (parsedAuth.token) {
            config.headers.Authorization = `Bearer ${parsedAuth.token}`
          }
        } else {
          // 尝试从persist:root获取
          const persistedState = localStorage.getItem('persist:root')
          if (persistedState) {
            const parsedState = JSON.parse(persistedState)
            const authStateFromPersist = JSON.parse(parsedState.auth)
            if (authStateFromPersist.token) {
              config.headers.Authorization = `Bearer ${authStateFromPersist.token}`
            }
          }
        }
      } catch (error) {
        // 静默处理令牌获取失败
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('[apiClient] 请求错误:', error.config?.url, 'status:', error.response?.status, error.response?.data)
    
    // 处理401未授权错误和403权限不足错误
    // 但不在登录请求上执行跳转逻辑
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (!isLoginRequest && error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('[apiClient] 401/403 错误，Token可能已过期，请重新登录')
      // 清除本地存储的认证状态
      if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:root')
        localStorage.removeItem('auth')
        // 延迟重定向，让用户看到错误信息
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient