import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../utils/apiClient'
import { parseGradeCode, parseClassCode } from '../utils/codeMapping'

// 初始状态
  const initialState = {
    // 测试项目配置
    testItems: [
      {
        id: 1,
        itemName: '身高',
        itemCode: 'height',
        itemType: 'required',
        unit: '厘米',
        minValue: 80,
        maxValue: 250,
        decimalPlaces: 1,
        roundingRule: '四舍五入',
        weight: 15,
        tester: '测试组',
        testTime: '2025/11/15',
        testLocation: '田径场',
        testInstrument: '身高仪',
        testMethod: '仪器',
        applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['小学', '初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 2,
        itemName: '体重',
        itemCode: 'weight',
        itemType: 'required',
        unit: '千克',
        minValue: 14,
        maxValue: 200,
        decimalPlaces: 2,
        roundingRule: '四舍五入',
        weight: 15,
        tester: '测试组',
        testTime: '2025/11/16',
        testLocation: '田径场',
        testInstrument: '体重仪',
        testMethod: '仪器',
        applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['小学', '初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 3,
        itemName: '肺活量',
        itemCode: 'vitalCapacity',
        itemType: 'required',
        unit: '毫升',
        minValue: 500,
        maxValue: 9999,
        decimalPlaces: 0,
        roundingRule: '不取舍',
        weight: 15,
        tester: '测试组',
        testTime: '2025/11/16',
        testLocation: '田径场',
        testInstrument: '肺活量计',
        testMethod: '仪器',
        applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['小学', '初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 4,
        itemName: '50米跑',
        itemCode: 'run50m',
        itemType: 'required',
        unit: '秒',
        minValue: 5,
        maxValue: 20,
        decimalPlaces: 1,
        roundingRule: '非零进一',
        weight: 20,
        tester: '测试组',
        testTime: '2025/11/15',
        testLocation: '田径场',
        testInstrument: '秒表',
        testMethod: '手工',
        applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['小学', '初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 5,
        itemName: '坐位体前屈',
        itemCode: 'sitAndReach',
        itemType: 'required',
        unit: '厘米',
        minValue: -30,
        maxValue: 40,
        decimalPlaces: 1,
        roundingRule: '四舍五入',
        weight: 30,
        tester: '测试组',
        testTime: '2025/11/15',
        testLocation: '田径场',
        testInstrument: '坐位体前屈仪',
        testMethod: '仪器',
        applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['小学', '初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 6,
        itemName: '一分钟跳绳',
        itemCode: 'ropeSkipping',
        itemType: 'required',
        unit: '次',
        minValue: 0,
        maxValue: 300,
        decimalPlaces: 0,
        roundingRule: '不取舍',
        weight: 20,
        tester: '测试组',
        testTime: '2025/11/15',
        testLocation: '田径场',
        testInstrument: '体操垫、秒表',
        testMethod: '手工',
        applicableGrades: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['小学'],
        isPreset: true
      },
      {
        id: 7,
        itemName: '一分钟仰卧起坐',
        itemCode: 'sitUps',
        itemType: 'required',
        unit: '次',
        minValue: 0,
        maxValue: 300,
        decimalPlaces: 0,
        roundingRule: '不取舍',
        weight: 10,
        tester: '测试组',
        testTime: '2025/11/15',
        testLocation: '田径场',
        testInstrument: '秒表',
        testMethod: '手工',
        applicableGrades: ['三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['小学', '初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 8,
        itemName: '50米×8往返跑',
        itemCode: 'run50m8x',
        itemType: 'required',
        unit: '分.秒',
        minValue: 0.4,
        maxValue: 5,
        decimalPlaces: 2,
        roundingRule: '非零进一',
        weight: 10,
        tester: '测试组',
        testTime: '2025/11/11',
        testLocation: '田径场',
        testInstrument: '秒表',
        testMethod: '手工',
        applicableGrades: ['五年级', '六年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['小学'],
        isPreset: true
      },
      {
        id: 9,
        itemName: '立定跳远',
        itemCode: 'standingLongJump',
        itemType: 'required',
        unit: '厘米',
        minValue: 50,
        maxValue: 340,
        decimalPlaces: 1,
        roundingRule: '不取舍',
        weight: 10,
        tester: '测试组',
        testTime: '2025/11/11',
        testLocation: '田径场',
        testInstrument: '钢尺',
        testMethod: '手工',
        applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male', 'female'],
        applicableStages: ['初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 10,
        itemName: '引体向上',
        itemCode: 'pullUps',
        itemType: 'required',
        unit: '次',
        minValue: 0,
        maxValue: 99,
        decimalPlaces: 0,
        roundingRule: '不取舍',
        weight: 10,
        tester: '测试组',
        testTime: '2025/11/15',
        testLocation: '田径场',
        testInstrument: '单杠',
        testMethod: '手工',
        applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male'],
        applicableStages: ['初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 11,
        itemName: '1000米跑',
        itemCode: 'run1000m',
        itemType: 'required',
        unit: '分.秒',
        minValue: 1,
        maxValue: 9,
        decimalPlaces: 2,
        roundingRule: '四舍五入',
        weight: 20,
        tester: '测试组',
        testTime: '2025/11/15',
        testLocation: '田径场',
        testInstrument: '秒表',
        testMethod: '手工',
        applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['male'],
        applicableStages: ['初中', '高中', '大学'],
        isPreset: true
      },
      {
        id: 12,
        itemName: '800米跑',
        itemCode: 'run800m',
        itemType: 'required',
        unit: '分.秒',
        minValue: 1,
        maxValue: 9,
        decimalPlaces: 2,
        roundingRule: '四舍五入',
        weight: 20,
        tester: '测试组',
        testTime: '2025/11/15',
        testLocation: '田径场',
        testInstrument: '秒表',
        testMethod: '手工',
        applicableGrades: ['初一', '初二', '初三', '高一', '高二', '高三', '大学一二年级', '大学三四年级'],
        applicableGenders: ['female'],
        applicableStages: ['初中', '高中', '大学'],
        isPreset: true
      }
    ],
  
  // 体测记录
  testRecords: [
    {
      id: 1,
      studentName: '学生1',
      educationId: '20240701001',
      gender: 'male',
      grade: '一年级',
      className: '主校区1班',
      testDate: '2026-01-04',
      schoolYearId: 1,
      schoolYearName: '2025-2026学年',
      testItems: {
        height: 120,
        weight: 25,
        vitalCapacity: 1500,
        run50m: 8.5,
        sitAndReach: 15
      },
      totalScore: 85,
      gradeLevel: '良好',
      isApproved: true,
      approvedBy: '管理员',
      approvedTime: '2026-01-04 10:00:00'
    },
    {
      id: 2,
      studentName: '学生2',
      educationId: '20240701002',
      gender: 'female',
      grade: '一年级',
      className: '主校区1班',
      testDate: '2026-01-04',
      schoolYearId: 1,
      schoolYearName: '2025-2026学年',
      testItems: {
        height: 115,
        weight: 22,
        vitalCapacity: 1400,
        run50m: 9.0,
        sitAndReach: 18
      },
      totalScore: 82,
      gradeLevel: '良好',
      isApproved: true,
      approvedBy: '管理员',
      approvedTime: '2026-01-04 10:00:00'
    },
    {
      id: 3,
      studentName: '学生3',
      educationId: '20240701003',
      gender: 'male',
      grade: '一年级',
      className: '主校区1班',
      testDate: '2026-01-04',
      schoolYearId: 1,
      schoolYearName: '2025-2026学年',
      testItems: {
        height: 125,
        weight: 28,
        vitalCapacity: 1600,
        run50m: 8.0,
        sitAndReach: 12
      },
      totalScore: 88,
      gradeLevel: '良好',
      isApproved: false,
      approvedBy: '',
      approvedTime: ''
    }
  ],
  
  // 统计数据
  statistics: {
    totalStudents: 500,
    testedStudents: 450,
    excellentRate: 25,
    goodRate: 40,
    passRate: 25,
    failRate: 10,
    averageScore: 75
  },
  
  // 加载状态
  loading: false,
  
  // 错误信息
  error: null
}

// 异步获取体测记录
export const fetchPhysicalTests = createAsyncThunk(
  'physicalTest/fetchPhysicalTests',
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient.get('/physical-tests/')
    } catch (error) {
      return rejectWithValue(error.message || '获取体测记录失败')
    }
  }
)

// 异步获取体测统计数据
export const fetchPhysicalTestStatistics = createAsyncThunk(
  'physicalTest/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient.get('/physical-tests/statistics')
    } catch (error) {
      return rejectWithValue(error.message || '获取体测统计数据失败')
    }
  }
)

// 异步创建体测记录
export const createPhysicalTest = createAsyncThunk(
  'physicalTest/createPhysicalTest',
  async (testData, { rejectWithValue }) => {
    try {
      return await apiClient.post('/physical-tests/', testData)
    } catch (error) {
      return rejectWithValue(error.message || '创建体测记录失败')
    }
  }
)

// 异步更新体测记录
export const updatePhysicalTestRecord = createAsyncThunk(
  'physicalTest/updatePhysicalTest',
  async ({ id, testData }, { rejectWithValue }) => {
    try {
      return await apiClient.put(`/physical-tests/${id}`, testData)
    } catch (error) {
      return rejectWithValue(error.message || '更新体测记录失败')
    }
  }
)

// 异步删除体测记录
export const deletePhysicalTestRecord = createAsyncThunk(
  'physicalTest/deletePhysicalTest',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/physical-tests/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.message || '删除体测记录失败')
    }
  }
)

// 异步获取体测历史数据
export const fetchPhysicalTestHistory = createAsyncThunk(
  'physicalTest/fetchHistory',
  async (filters, { rejectWithValue }) => {
    try {
      return await apiClient.get('/physical-tests/history', { params: filters })
    } catch (error) {
      return rejectWithValue(error.message || '获取体测历史数据失败')
    }
  }
)

// 创建体测slice
export const physicalTestSlice = createSlice({
  name: 'physicalTest',
  initialState,
  reducers: {
    // 测试项目相关操作
    setTestItems: (state, action) => {
      state.testItems = action.payload
    },
    addTestItem: (state, action) => {
      state.testItems.push(action.payload)
    },
    updateTestItem: (state, action) => {
      const index = state.testItems.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.testItems[index] = action.payload
      }
    },
    deleteTestItem: (state, action) => {
      state.testItems = state.testItems.filter(item => item.id !== action.payload)
    },
    
    // 体测记录相关操作
    setTestRecords: (state, action) => {
      state.testRecords = action.payload
    },
    addTestRecord: (state, action) => {
      state.testRecords.push(action.payload)
    },
    updateTestRecord: (state, action) => {
      const index = state.testRecords.findIndex(record => record.id === action.payload.id)
      if (index !== -1) {
        state.testRecords[index] = action.payload
      }
    },
    deleteTestRecord: (state, action) => {
      state.testRecords = state.testRecords.filter(record => record.id !== action.payload)
    },
    approveTestRecord: (state, action) => {
      const index = state.testRecords.findIndex(record => record.id === action.payload.id)
      if (index !== -1) {
        state.testRecords[index] = {
          ...state.testRecords[index],
          isApproved: true,
          approvedBy: action.payload.approvedBy,
          approvedTime: action.payload.approvedTime
        }
      }
    },
    
    // 统计数据相关操作
    setStatistics: (state, action) => {
      state.statistics = action.payload
    },
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload }
    },
    
    // 加载状态管理
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // 处理获取体测记录
    builder
      .addCase(fetchPhysicalTests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPhysicalTests.fulfilled, (state, action) => {
        state.loading = false
        // 转换体测记录中的年级和班级编码
        state.testRecords = action.payload.map(record => ({
          ...record,
          grade: parseGradeCode(record.grade),
          className: parseClassCode(record.className)
        }))
      })
      .addCase(fetchPhysicalTests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 处理获取体测统计数据
    builder
      .addCase(fetchPhysicalTestStatistics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPhysicalTestStatistics.fulfilled, (state, action) => {
        state.loading = false
        // 转换API返回的下划线命名字段为驼峰命名
        const apiStats = action.payload
        state.statistics = {
          totalStudents: apiStats.total_students,
          testedStudents: apiStats.tested_students,
          excellentRate: apiStats.excellent_rate,
          goodRate: apiStats.good_rate,
          passRate: apiStats.pass_rate,
          failRate: apiStats.fail_rate,
          averageScore: apiStats.average_score
        }
      })
      .addCase(fetchPhysicalTestStatistics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 处理创建体测记录
    builder
      .addCase(createPhysicalTest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPhysicalTest.fulfilled, (state, action) => {
        state.loading = false
        state.testRecords.push(action.payload)
      })
      .addCase(createPhysicalTest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 处理更新体测记录
    builder
      .addCase(updatePhysicalTestRecord.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePhysicalTestRecord.fulfilled, (state, action) => {
        state.loading = false
        const index = state.testRecords.findIndex(record => record.id === action.payload.id)
        if (index !== -1) {
          state.testRecords[index] = action.payload
        }
      })
      .addCase(updatePhysicalTestRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 处理删除体测记录
    builder
      .addCase(deletePhysicalTestRecord.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePhysicalTestRecord.fulfilled, (state, action) => {
        state.loading = false
        state.testRecords = state.testRecords.filter(record => record.id !== action.payload)
      })
      .addCase(deletePhysicalTestRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // 处理获取体测历史数据
    builder
      .addCase(fetchPhysicalTestHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPhysicalTestHistory.fulfilled, (state, action) => {
        state.loading = false
        // 转换API返回的历史数据为前端需要的格式
        state.testRecords = action.payload.map(record => ({
          id: record.id,
          studentName: record.studentName,
          educationId: record.student_no,
          gender: record.student?.gender || 'male',
          grade: record.grade || '未知年级',
          className: record.className || '未知班级',
          testDate: record.test_date,
          schoolYearId: record.school_year_id || 1,
          schoolYearName: record.academic_year || '未知学年',
          testItems: {
            height: record.height,
            weight: record.weight,
            vitalCapacity: record.vital_capacity,
            run50m: record.run_50m,
            run800m: record.run_800m,
            run1000m: record.run_1000m,
            sitAndReach: record.sit_and_reach,
            standingLongJump: record.standing_long_jump,
            pullUps: record.pull_up,
            skipRope: record.skip_rope
          },
          totalScore: record.total_score,
          gradeLevel: record.grade,
          isApproved: record.is_official,
          approvedBy: record.tester_name,
          approvedTime: record.created_at
        }))
      })
      .addCase(fetchPhysicalTestHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

// 导出action creators
export const {
  // 测试项目相关
  setTestItems,
  addTestItem,
  updateTestItem,
  deleteTestItem,
  
  // 体测记录相关
  setTestRecords,
  addTestRecord,
  updateTestRecord,
  deleteTestRecord,
  approveTestRecord,
  
  // 统计数据相关
  setStatistics,
  updateStatistics,
  
  // 加载状态管理
  setLoading,
  setError,
  clearError
} = physicalTestSlice.actions



// 导出reducer
export default physicalTestSlice.reducer
