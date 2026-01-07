import { createSlice } from '@reduxjs/toolkit'

// 初始化状态
const initialState = {
  // 学年管理
  schoolYears: [
    {
      id: 1,
      yearName: '2025-2026学年',
      startDate: '2025-09-01',
      endDate: '2026-08-31',
      status: 'active',
      importedAt: '2025-09-01',
      importedBy: '管理员'
    },
    {
      id: 2,
      yearName: '2024-2025学年',
      startDate: '2024-09-01',
      endDate: '2025-08-31',
      status: 'completed',
      importedAt: '2024-09-01',
      importedBy: '管理员',
      completedAt: '2025-08-31',
      completedBy: '管理员'
    }
  ],
  currentSchoolYear: {
    id: 1,
    yearName: '2025-2026学年',
    startDate: '2025-09-01',
    endDate: '2026-08-31',
    status: 'active'
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
  classes: [
    { id: 1, grade: '一年级', className: '主校区1班', coach: '张三', physicalTeacher: '李四', studentCount: 45, status: 'active', schoolYearId: 1 },
    { id: 2, grade: '二年级', className: '主校区2班', coach: '张二', physicalTeacher: '李无', studentCount: 42, status: 'active', schoolYearId: 1 }
  ],
  students: [
    { id: 1, name: '学生1', gender: 'male', age: 18, classId: 1, className: '主校区1班', phone: '13800138001', email: 'student1@example.com', address: '北京市朝阳区', status: '在学', studentNo: '20240701001', idCard: '', studentId: 'G110106201906103314', educationId: '25083338', birthDate: '', grade: '一年级', schoolYearId: 1 },
    { id: 2, name: '学生2', gender: 'female', age: 17, classId: 2, className: '主校区2班', phone: '13800138002', email: 'student2@example.com', address: '上海市浦东新区', status: '休学', studentNo: '20240701002', idCard: '', studentId: 'G110106201906103315', educationId: '25083339', birthDate: '', grade: '二年级', schoolYearId: 1 },
    { id: 3, name: '学生3', gender: 'male', age: 19, classId: 1, className: '主校区1班', phone: '13800138003', email: 'student3@example.com', address: '广州市天河区', status: '在学', studentNo: '20240701003', idCard: '', studentId: 'G110106201906103316', educationId: '25083340', birthDate: '', grade: '一年级', schoolYearId: 1 }
  ],
  studentHistories: [
    {
      id: 1,
      studentId: 1,
      educationId: '25083338',
      name: '学生1',
      schoolYearId: 2,
      schoolYearName: '2024-2025学年',
      grade: '一年级',
      className: '主校区1班',
      gender: 'male',
      age: 17,
      status: '在学',
      finalScore: 85,
      gradeLevel: '良好',
      testRecords: [1, 2] // 关联的测试记录ID
    }
  ],
  users: [
    { id: 1, username: 'admin', name: '管理员', email: 'admin@example.com', phone: '13800138000', role: 'admin', status: 'active' },
    { id: 2, username: 'teacher1', name: '张三', email: 'teacher1@example.com', phone: '13800138001', role: 'classTeacher', status: 'active' },
    { id: 3, username: 'peTeacher1', name: '李四', email: 'peTeacher1@example.com', phone: '13800138002', role: 'peTeacher', status: 'active' },
    { id: 4, username: 'coach1', name: '王五', email: 'coach1@example.com', phone: '13800138003', role: 'coach', status: 'active' },
    { id: 5, username: 'other1', name: '赵六', email: 'other1@example.com', phone: '13800138004', role: 'other', status: 'active' }
  ]
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
    updateSchoolYear: (state, action) => {
      const index = state.schoolYears.findIndex(year => year.id === action.payload.id)
      if (index !== -1) {
        state.schoolYears[index] = action.payload
      }
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
          schoolYearName: state.schoolYears[yearIndex].yearName,
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
  }
})

// 导出action creators
export const {
  // 学年管理相关
  addSchoolYear,
  updateSchoolYear,
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

// 导出reducer
export default dataSlice.reducer
