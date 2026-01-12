import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../utils/apiClient'

// 标准化班级数据，统一前端使用的字段
const normalizeClass = (cls = {}) => {
  const normalizedStatus = typeof cls.status === 'object' && cls.status?.value
    ? cls.status.value
    : cls.status

  return {
    ...cls,
    className: cls.class_name ?? cls.className ?? '',
    studentCount: cls.current_student_count ?? cls.studentCount ?? 0,
    maxStudentCount: cls.max_student_count ?? cls.maxStudentCount ?? 60,
    coach: cls.class_teacher_name ?? cls.coach ?? '',
    physicalTeacher: cls.assistant_teacher_name ?? cls.physicalTeacher ?? '',
    status: normalizedStatus ?? 'active'
  }
}

// 从出生日期计算年龄
const calculateAge = (birthDate) => {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// 标准化学生数据，统一前端使用的字段
const normalizeStudent = (student = {}) => {
  const birthDate = student.birth_date || student.birthDate
  return {
    ...student,
    name: student.real_name || student.name,
    birthDate: birthDate,
    idCard: student.id_card || student.idCard,
    studentId: student.student_no || student.studentId,
    educationId: student.education_id || student.educationId,
    phone: student.phone,
    address: student.address,
    // 从出生日期自动计算年龄
    age: calculateAge(birthDate),
    // 映射年级和班级字段
    grade: student.current_grade || student.grade,
    className: student.current_class_name || student.className,
    classId: student.current_class_id || student.classId || student.class_id
  }
}

// 获取学生列表
const fetchStudents = createAsyncThunk(
  'data/fetchStudents',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/students', { params })
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取学生列表失败')
    }
  }
)

// 创建学生
const createStudentAPI = createAsyncThunk(
  'data/createStudentAPI',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/students', studentData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建学生失败')
    }
  }
)

// 更新学生
const updateStudentAPI = createAsyncThunk(
  'data/updateStudentAPI',
  async ({ id, studentData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/students/${id}`, studentData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '更新学生失败')
    }
  }
)

// 删除学生
const deleteStudentAPI = createAsyncThunk(
  'data/deleteStudentAPI',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/students/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除学生失败')
    }
  }
)

// 获取班级列表
const fetchClasses = createAsyncThunk(
  'data/fetchClasses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/classes', { params })
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取班级列表失败')
    }
  }
)

// 创建班级
const createClassAPI = createAsyncThunk(
  'data/createClassAPI',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/classes', classData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '创建班级失败')
    }
  }
)

// 更新班级
const updateClassAPI = createAsyncThunk(
  'data/updateClassAPI',
  async ({ id, classData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/classes/${id}`, classData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '更新班级失败')
    }
  }
)

// 删除班级
const deleteClassAPI = createAsyncThunk(
  'data/deleteClassAPI',
  async ({ id, force = false }, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/classes/${id}?force=${force}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '删除班级失败')
    }
  }
)

// 将学生分配到班级
const assignStudentToClassAPI = createAsyncThunk(
  'data/assignStudentToClassAPI',
  async ({ studentId, classId, academicYear, joinDate }, { rejectWithValue }) => {
    try {
      // 构建查询参数
      const params = new URLSearchParams({ 
        class_id: classId, 
        academic_year: academicYear 
      })
      if (joinDate) {
        params.append('join_date', joinDate)
      }
      const response = await apiClient.post(`/students/${studentId}/classes?${params.toString()}`)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '分配学生到班级失败')
    }
  }
)

// 初始化状态
const initialState = {
  // 学年管理
  schoolYears: [],
  currentSchoolYear: {
    id: null,
    year_name: '',
    start_date: '',
    end_date: '',
    status: ''
  },
  
  schoolInfo: {
    fullName: '',
    shortName: '',
    area: '',
    schoolLevel: '',
    teacherCount: 0,
    registeredStudentCount: 0,
    currentStudentCount: 0,
    principal: '',
    phone: '',
    email: ''
  },
  classes: [],
  students: [],
  studentHistories: [],
  users: []
}

// 创建数据slice
const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // 学年管理相关操作
    addSchoolYear: (state, action) => {
      state.schoolYears.push(action.payload)
    },
    updateSchoolYears: (state, action) => {
      state.schoolYears = action.payload
    },
    updateSchoolYear: (state, action) => {
      const index = state.schoolYears.findIndex(year => year.id === action.payload.id)
      if (index !== -1) {
        state.schoolYears[index] = action.payload
      }
    },
    deleteSchoolYear: (state, action) => {
      state.schoolYears = state.schoolYears.filter(year => year.id !== action.payload)
    },
    completeSchoolYear: (state, action) => {
      // 更新学年状态为已完成
      const yearIndex = state.schoolYears.findIndex(year => year.id === action.payload.yearId)
      if (yearIndex !== -1) {
        state.schoolYears[yearIndex] = {
          ...state.schoolYears[yearIndex],
          status: 'completed',
          completedAt: action.payload.completedAt,
          completedBy: action.payload.completedBy
        }
      }
      
      // 将当前学年学生数据归档到历史记录
      state.students.forEach(student => {
        state.studentHistories.push({
          id: state.studentHistories.length + 1,
          studentId: student.id,
          educationId: student.educationId,
          name: student.name,
          schoolYearId: action.payload.yearId,
          schoolYearName: state.schoolYears[yearIndex].year_name,
          grade: student.grade,
          className: student.className,
          gender: student.gender,
          age: student.age,
          status: student.status,
          finalScore: 0, // 实际应用中应该计算最终成绩
          gradeLevel: '',
          testRecords: [] // 实际应用中应该关联测试记录
        })
      })
      
      // 清空当前学生和班级数据，准备新学年
      state.students = []
      state.classes = []
    },
    setCurrentSchoolYear: (state, action) => {
      state.currentSchoolYear = action.payload
    },
    
    // 班级相关操作
    addClass: (state, action) => {
      state.classes.push(action.payload)
    },
    updateClass: (state, action) => {
      const index = state.classes.findIndex(cls => cls.id === action.payload.id)
      if (index !== -1) {
        state.classes[index] = action.payload
      }
    },
    deleteClass: (state, action) => {
      state.classes = state.classes.filter(cls => cls.id !== action.payload)
    },

    // 学生相关操作
    addStudent: (state, action) => {
      state.students.push(action.payload)
      // 更新班级学生数
      const classIndex = state.classes.findIndex(cls => cls.id === action.payload.classId)
      if (classIndex !== -1) {
        state.classes[classIndex].studentCount++
      }
    },
    updateStudent: (state, action) => {
      const index = state.students.findIndex(student => student.id === action.payload.id)
      if (index !== -1) {
        // 获取原学生信息
        const oldStudent = state.students[index]
        // 保存新学生信息
        state.students[index] = action.payload
        
        // 如果学生班级发生变化，更新两个班级的学生数
        if (oldStudent.classId !== action.payload.classId) {
          // 原班级学生数减1
          const oldClassIndex = state.classes.findIndex(cls => cls.id === oldStudent.classId)
          if (oldClassIndex !== -1) {
            state.classes[oldClassIndex].studentCount = Math.max(0, state.classes[oldClassIndex].studentCount - 1)
          }
          
          // 新班级学生数加1
          const newClassIndex = state.classes.findIndex(cls => cls.id === action.payload.classId)
          if (newClassIndex !== -1) {
            state.classes[newClassIndex].studentCount++
          }
        }
      }
    },
    deleteStudent: (state, action) => {
      const student = state.students.find(student => student.id === action.payload)
      if (student) {
        state.students = state.students.filter(student => student.id !== action.payload)
        // 更新班级学生数，确保不会出现负数
        const classIndex = state.classes.findIndex(cls => cls.id === student.classId)
        if (classIndex !== -1) {
          state.classes[classIndex].studentCount = Math.max(0, state.classes[classIndex].studentCount - 1)
        }
      }
    },

    // 用户相关操作
    addUser: (state, action) => {
      state.users.push(action.payload)
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload)
    },

    // 批量更新数据
    updateData: (state, action) => {
      return { ...state, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    // 处理获取学生列表
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false
        console.log('[dataSlice] fetchStudents.fulfilled - RAW payload:', JSON.stringify(action.payload))
        console.log('[dataSlice] payload.items:', action.payload.items)
        console.log('[dataSlice] payload type:', Array.isArray(action.payload) ? 'array' : typeof action.payload)
        const studentsData = action.payload.items || action.payload
        console.log('[dataSlice] extracted students:', studentsData)
        
        // 使用统一的normalizeStudent函数转换字段
        const transformedStudents = (Array.isArray(studentsData) ? studentsData : []).map(normalizeStudent)
        
        state.students = transformedStudents
        console.log('[dataSlice] students updated to:', state.students.length, 'records')
        console.log('[dataSlice] state.students IS array?', Array.isArray(state.students))
        console.log('[dataSlice] first student:', state.students[0])
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 处理创建学生
    builder
      .addCase(createStudentAPI.fulfilled, (state, action) => {
        // 使用统一的normalizeStudent函数转换字段
        const transformedStudent = normalizeStudent(action.payload)
        state.students.push(transformedStudent)
        // 更新班级学生数
        const classIndex = state.classes.findIndex(cls => cls.id === transformedStudent.classId)
        if (classIndex !== -1) {
          state.classes[classIndex].studentCount++
        }
      })
    
    // 处理更新学生
    builder
      .addCase(updateStudentAPI.fulfilled, (state, action) => {
        const index = state.students.findIndex(student => student.id === action.payload.id)
        if (index !== -1) {
          const oldStudent = state.students[index]
          // 使用统一的normalizeStudent函数转换字段
          const transformedStudent = normalizeStudent(action.payload)
          state.students[index] = transformedStudent
          
          // 如果学生班级发生变化，更新两个班级的学生数
          if (oldStudent.classId !== transformedStudent.classId) {
            // 原班级学生数减1
            const oldClassIndex = state.classes.findIndex(cls => cls.id === oldStudent.classId)
            if (oldClassIndex !== -1) {
              state.classes[oldClassIndex].studentCount = Math.max(0, state.classes[oldClassIndex].studentCount - 1)
            }
            
            // 新班级学生数加1
            const newClassIndex = state.classes.findIndex(cls => cls.id === transformedStudent.classId)
            if (newClassIndex !== -1) {
              state.classes[newClassIndex].studentCount++
            }
          }
        }
      })
    
    // 处理删除学生
    builder
      .addCase(deleteStudentAPI.fulfilled, (state, action) => {
        // 修复：先查找学生信息再删除
        const student = state.students.find(s => s.id === action.payload)
        if (student) {
          // 更新班级学生数
          const classIndex = state.classes.findIndex(cls => cls.id === student.classId)
          if (classIndex !== -1) {
            state.classes[classIndex].studentCount = Math.max(0, state.classes[classIndex].studentCount - 1)
          }
        }
        // 最后再删除学生
        state.students = state.students.filter(s => s.id !== action.payload)
      })
    
    // 处理获取班级列表
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false
        console.log('[dataSlice] fetchClasses.fulfilled - RAW payload:', JSON.stringify(action.payload))
        console.log('[dataSlice] payload.items:', action.payload?.items)
        console.log('[dataSlice] payload type:', Array.isArray(action.payload) ? 'array' : typeof action.payload)
        const classesData = action.payload?.items || action.payload || []
        console.log('[dataSlice] extracted classes:', classesData)
        
        // 转换字段名以匹配前端组件的期望
        const transformedClasses = (Array.isArray(classesData) ? classesData : []).map(normalizeClass)
        
        state.classes = transformedClasses
        console.log('[dataSlice] classes updated to:', state.classes.length, 'records')
        console.log('[dataSlice] state.classes IS array?', Array.isArray(state.classes))
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 处理创建班级
    builder
      .addCase(createClassAPI.fulfilled, (state, action) => {
        state.classes.push(normalizeClass(action.payload))
      })
    
    // 处理更新班级
    builder
      .addCase(updateClassAPI.fulfilled, (state, action) => {
        const index = state.classes.findIndex(cls => cls.id === action.payload.id)
        if (index !== -1) {
          state.classes[index] = normalizeClass(action.payload)
        }
      })
    
    // 处理删除班级
    builder
      .addCase(deleteClassAPI.fulfilled, (state, action) => {
        state.classes = state.classes.filter(cls => cls.id !== action.payload)
      })
  }
})

// 导出action creators
export const {
  // 学年管理相关
  addSchoolYear,
  updateSchoolYears,
  updateSchoolYear,
  deleteSchoolYear,
  completeSchoolYear,
  setCurrentSchoolYear,
  
  // 班级相关
  addClass,
  updateClass,
  deleteClass,
  
  // 学生相关
  addStudent,
  updateStudent,
  deleteStudent,
  
  // 用户相关
  addUser,
  updateUser,
  deleteUser,
  
  // 批量更新
  updateData
} = dataSlice.actions

// 导出API相关的thunk actions
export {
  fetchStudents,
  createStudentAPI,
  updateStudentAPI,
  deleteStudentAPI,
  fetchClasses,
  createClassAPI,
  updateClassAPI,
  deleteClassAPI,
  assignStudentToClassAPI
}

// 导出选择器
export const selectStudents = (state) => state.data.students
export const selectClasses = (state) => state.data.classes
export const selectSchoolInfo = (state) => state.data.schoolInfo
export const selectUsers = (state) => state.data.users

// 导出reducer
export default dataSlice.reducer
