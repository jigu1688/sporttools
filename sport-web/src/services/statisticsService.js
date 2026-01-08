import axios from 'axios'

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 统计数据API服务
export const statisticsService = {
  // 获取统计数据
  getStatistics: async (filters) => {
    try {
      const response = await apiClient.get('/statistics', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  },
  
  // 获取总分分布数据
  getScoreDistribution: async (filters) => {
    try {
      const response = await apiClient.get('/statistics/score-distribution', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取总分分布数据失败:', error)
      throw error
    }
  },
  
  // 获取等级分布数据
  getGradeDistribution: async (filters) => {
    try {
      const response = await apiClient.get('/statistics/grade-distribution', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取等级分布数据失败:', error)
      throw error
    }
  },
  
  // 获取年级成绩对比数据
  getGradeComparison: async (filters) => {
    try {
      const response = await apiClient.get('/statistics/grade-comparison', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取年级成绩对比数据失败:', error)
      throw error
    }
  },
  
  // 获取性别成绩对比数据
  getGenderComparison: async (filters) => {
    try {
      const response = await apiClient.get('/statistics/gender-comparison', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取性别成绩对比数据失败:', error)
      throw error
    }
  },
  
  // 获取单项成绩分析数据
  getItemAnalysis: async (filters) => {
    try {
      const response = await apiClient.get('/statistics/item-analysis', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取单项成绩分析数据失败:', error)
      throw error
    }
  },
  
  // 导出统计结果
  exportStatistics: async (filters, format) => {
    try {
      const response = await apiClient.get('/statistics/export', {
        params: { ...filters, format },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('导出统计结果失败:', error)
      throw error
    }
  },
  
  // 导出图表
  exportChart: async (chartData, format) => {
    try {
      const response = await apiClient.post('/statistics/export-chart', {
        chartData,
        format
      }, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('导出图表失败:', error)
      throw error
    }
  },
  
  // 导出完整报告
  exportReport: async (filters, format) => {
    try {
      const response = await apiClient.get('/statistics/export-report', {
        params: { ...filters, format },
        responseType: 'blob'
      })
      return response
    } catch (error) {
      console.error('导出完整报告失败:', error)
      throw error
    }
  }
}