import apiClient from '../utils/apiClient'

// 统计数据API服务
export const statisticsService = {
  // 获取统计数据
  getStatistics: async (filters = {}) => {
    try {
      const response = await apiClient.get('/physical-tests/statistics', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  },
  
  // 获取总分分布数据
  getScoreDistribution: async (filters = {}) => {
    try {
      const response = await apiClient.get('/physical-tests/score-distribution', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取总分分布数据失败:', error)
      throw error
    }
  },
  
  // 获取等级分布数据
  getGradeDistribution: async (filters = {}) => {
    try {
      const response = await apiClient.get('/physical-tests/grade-distribution', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取等级分布数据失败:', error)
      throw error
    }
  },
  
  // 获取年级成绩对比数据
  getGradeComparison: async (filters = {}) => {
    try {
      const response = await apiClient.get('/physical-tests/grade-comparison', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取年级成绩对比数据失败:', error)
      throw error
    }
  },
  
  // 获取性别成绩对比数据
  getGenderComparison: async (filters = {}) => {
    try {
      const response = await apiClient.get('/physical-tests/gender-comparison', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取性别成绩对比数据失败:', error)
      throw error
    }
  },
  
  // 获取单项成绩分析数据
  getItemAnalysis: async (filters = {}) => {
    try {
      const response = await apiClient.get('/physical-tests/item-analysis', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取单项成绩分析数据失败:', error)
      throw error
    }
  },
  
  // 获取体测历史数据
  getTestHistory: async (filters = {}) => {
    try {
      const response = await apiClient.get('/physical-tests/history', {
        params: filters
      })
      return response
    } catch (error) {
      console.error('获取体测历史数据失败:', error)
      throw error
    }
  },
  
  // 获取体测记录列表
  getTests: async (params = {}) => {
    try {
      const response = await apiClient.get('/physical-tests', { params })
      return response
    } catch (error) {
      console.error('获取体测记录列表失败:', error)
      throw error
    }
  }
}

export default statisticsService
