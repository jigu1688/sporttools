import apiClient from '../utils/apiClient'

// 学年管理API服务
export const schoolYearService = {
  // 获取学年列表
  getSchoolYears: async (params = {}) => {
    try {
      const response = await apiClient.get('/school-years', { params })
      return response
    } catch (error) {
      console.error('获取学年列表失败:', error)
      throw error
    }
  },

  // 获取学年详情
  getSchoolYear: async (id) => {
    try {
      const response = await apiClient.get(`/school-years/${id}`)
      return response
    } catch (error) {
      console.error('获取学年详情失败:', error)
      throw error
    }
  },

  // 创建学年
  createSchoolYear: async (schoolYearData) => {
    try {
      const response = await apiClient.post('/school-years', schoolYearData)
      return response
    } catch (error) {
      console.error('创建学年失败:', error)
      throw error
    }
  },

  // 更新学年信息
  updateSchoolYear: async (id, schoolYearData) => {
    try {
      const response = await apiClient.put(`/school-years/${id}`, schoolYearData)
      return response
    } catch (error) {
      console.error('更新学年信息失败:', error)
      throw error
    }
  },

  // 删除学年
  deleteSchoolYear: async (id) => {
    try {
      const response = await apiClient.delete(`/school-years/${id}`)
      return response
    } catch (error) {
      console.error('删除学年失败:', error)
      throw error
    }
  },

  // 激活学年
  activateSchoolYear: async (id) => {
    try {
      const response = await apiClient.put(`/school-years/${id}/set-active`)
      return response
    } catch (error) {
      console.error('激活学年失败:', error)
      throw error
    }
  },

  // 完成学年
  completeSchoolYear: async (id, completedBy) => {
    try {
      const response = await apiClient.put(`/school-years/${id}/complete`, {
        completed_by: completedBy
      })
      return response
    } catch (error) {
      console.error('完成学年失败:', error)
      throw error
    }
  },

  // 升级学年 - 升级班级和学生年级
  promoteSchoolYear: async (id) => {
    try {
      const response = await apiClient.post(`/school-years/${id}/promote`)
      return response
    } catch (error) {
      console.error('升级学年失败:', error)
      throw error
    }
  },

  // 获取当前激活的学年
  getActiveSchoolYear: async (schoolId) => {
    try {
      const params = schoolId ? { school_id: schoolId } : {}
      const response = await apiClient.get('/school-years/active/current', { params })
      return response
    } catch (error) {
      console.error('获取当前激活学年失败:', error)
      throw error
    }
  },

  // 获取学年统计信息
  getSchoolYearStatistics: async (id) => {
    try {
      const response = await apiClient.get(`/school-years/${id}/statistics`)
      return response
    } catch (error) {
      console.error('获取学年统计信息失败:', error)
      throw error
    }
  },

  // 获取学年班级列表
  getSchoolYearClasses: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/school-years/${id}/classes`, { params })
      return response
    } catch (error) {
      console.error('获取学年班级列表失败:', error)
      throw error
    }
  },

  // 获取学年学生列表
  getSchoolYearStudents: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/school-years/${id}/students`, { params })
      return response
    } catch (error) {
      console.error('获取学年学生列表失败:', error)
      throw error
    }
  },

  // 获取学年体测数据
  getSchoolYearPhysicalTests: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/school-years/${id}/physical-tests`, { params })
      return response
    } catch (error) {
      console.error('获取学年体测数据失败:', error)
      throw error
    }
  },

  // 获取学年运动会数据
  getSchoolYearSportsMeets: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/school-years/${id}/sports-meets`, { params })
      return response
    } catch (error) {
      console.error('获取学年运动会数据失败:', error)
      throw error
    }
  }
}

export default schoolYearService