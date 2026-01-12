import apiClient from '../utils/apiClient'

// 日志管理API服务
export const logService = {
  // 获取日志列表
  getLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs', { params })
      return response
    } catch (error) {
      console.error('获取日志列表失败:', error)
      throw error
    }
  },

  // 获取日志详情
  getLog: async (id) => {
    try {
      const response = await apiClient.get(`/logs/${id}`)
      return response
    } catch (error) {
      console.error('获取日志详情失败:', error)
      throw error
    }
  },

  // 获取用户活动日志列表
  getUserActivities: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/user-activities', { params })
      return response
    } catch (error) {
      console.error('获取用户活动日志失败:', error)
      throw error
    }
  },

  // 根据用户ID获取日志
  getLogsByUser: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/logs/user/${userId}`, { params })
      return response
    } catch (error) {
      console.error('获取用户日志失败:', error)
      throw error
    }
  },

  // 根据操作类型获取日志
  getLogsByAction: async (action, params = {}) => {
    try {
      const response = await apiClient.get(`/logs/action/${action}`, { params })
      return response
    } catch (error) {
      console.error('获取操作日志失败:', error)
      throw error
    }
  },

  // 获取系统操作日志
  getSystemLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/system', { params })
      return response
    } catch (error) {
      console.error('获取系统日志失败:', error)
      throw error
    }
  },

  // 获取用户操作日志
  getUserActionLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/user-actions', { params })
      return response
    } catch (error) {
      console.error('获取用户操作日志失败:', error)
      throw error
    }
  },

  // 获取安全相关日志
  getSecurityLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/security', { params })
      return response
    } catch (error) {
      console.error('获取安全日志失败:', error)
      throw error
    }
  },

  // 获取错误日志
  getErrorLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/errors', { params })
      return response
    } catch (error) {
      console.error('获取错误日志失败:', error)
      throw error
    }
  },

  // 根据日期范围获取日志
  getLogsByDateRange: async (startDate, endDate, params = {}) => {
    try {
      const response = await apiClient.get('/logs/date-range', {
        params: {
          start_date: startDate,
          end_date: endDate,
          ...params
        }
      })
      return response
    } catch (error) {
      console.error('获取日期范围日志失败:', error)
      throw error
    }
  },

  // 搜索日志
  searchLogs: async (searchParams) => {
    try {
      const response = await apiClient.post('/logs/search', searchParams)
      return response
    } catch (error) {
      console.error('搜索日志失败:', error)
      throw error
    }
  },

  // 获取日志统计信息
  getLogStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/statistics', { params })
      return response
    } catch (error) {
      console.error('获取日志统计失败:', error)
      throw error
    }
  },

  // 获取日志级别分布
  getLogLevelDistribution: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/level-distribution', { params })
      return response
    } catch (error) {
      console.error('获取日志级别分布失败:', error)
      throw error
    }
  },

  // 获取操作类型分布
  getActionTypeDistribution: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/action-type-distribution', { params })
      return response
    } catch (error) {
      console.error('获取操作类型分布失败:', error)
      throw error
    }
  },

  // 获取数据变更日志
  getDataChangeLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/logs/data-changes', { params })
      return response
    } catch (error) {
      console.error('获取数据变更日志失败:', error)
      throw error
    }
  }
}

export default logService
