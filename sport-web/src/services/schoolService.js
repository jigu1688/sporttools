import apiClient from '../utils/apiClient'

// 学校信息管理API服务
export const schoolService = {
  // 获取学校列表
  getSchools: async (params = {}) => {
    try {
      const response = await apiClient.get('/schools', { params })
      return response
    } catch (error) {
      console.error('获取学校列表失败:', error)
      throw error
    }
  },

  // 获取学校详情
  getSchool: async (id) => {
    try {
      const response = await apiClient.get(`/schools/${id}`)
      return response
    } catch (error) {
      console.error('获取学校详情失败:', error)
      throw error
    }
  },

  // 创建学校
  createSchool: async (schoolData) => {
    try {
      const response = await apiClient.post('/schools', schoolData)
      return response
    } catch (error) {
      console.error('创建学校失败:', error)
      throw error
    }
  },

  // 更新学校信息
  updateSchool: async (id, schoolData) => {
    try {
      const response = await apiClient.put(`/schools/${id}`, schoolData)
      return response
    } catch (error) {
      console.error('更新学校信息失败:', error)
      throw error
    }
  },

  // 删除学校
  deleteSchool: async (id) => {
    try {
      const response = await apiClient.delete(`/schools/${id}`)
      return response
    } catch (error) {
      console.error('删除学校失败:', error)
      throw error
    }
  },

  // 获取学校统计信息
  getSchoolStatistics: async (id) => {
    try {
      const response = await apiClient.get(`/schools/${id}/statistics`)
      return response
    } catch (error) {
      console.error('获取学校统计信息失败:', error)
      throw error
    }
  },

  // 获取学校班级信息
  getSchoolClasses: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/schools/${id}/classes`, { params })
      return response
    } catch (error) {
      console.error('获取学校班级信息失败:', error)
      throw error
    }
  },

  // 获取学校学生信息
  getSchoolStudents: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/schools/${id}/students`, { params })
      return response
    } catch (error) {
      console.error('获取学校学生信息失败:', error)
      throw error
    }
  },

  // 获取学校教师信息
  getSchoolTeachers: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/schools/${id}/teachers`, { params })
      return response
    } catch (error) {
      console.error('获取学校教师信息失败:', error)
      throw error
    }
  },

  // 上传学校logo
  uploadLogo: async (id, formData) => {
    try {
      const response = await apiClient.post(`/schools/${id}/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response
    } catch (error) {
      console.error('上传学校logo失败:', error)
      throw error
    }
  }
}

export default schoolService