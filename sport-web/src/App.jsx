import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout/Layout'
import { useSelector } from 'react-redux'
import { useEffect, useState, lazy, Suspense } from 'react'
import { Spin } from 'antd'

// 懒加载容器组件
const LazyWrapper = ({ children }) => (
  <Suspense fallback={
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="加载中..." />
    </div>
  }>
    {children}
  </Suspense>
)

// 核心页面组件（同步加载，首屏需要）
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

// 独立工具页面（同步加载，无需登录）
import ScoreCalculator from './pages/ScoreCalculator'

// 其他页面组件（懒加载）
const SchoolInfo = lazy(() => import('./pages/SchoolInfo'))
const Classes = lazy(() => import('./pages/Classes'))
const Students = lazy(() => import('./pages/Students'))
const Users = lazy(() => import('./pages/Users'))
const SchoolYearManagement = lazy(() => import('./pages/SchoolYearManagement'))
const StudentHistory = lazy(() => import('./pages/StudentHistory'))

// 体测系统页面组件（懒加载）
const PhysicalTestDashboard = lazy(() => import('./pages/PhysicalTest/Dashboard'))
const TestItems = lazy(() => import('./pages/PhysicalTest/TestItems'))
const ScoreManagementPage = lazy(() => import('./pages/PhysicalTest/ScoreManagementPage'))
const StatisticsPage = lazy(() => import('./pages/PhysicalTest/StatisticsPage'))
const ScoreStandardsPage = lazy(() => import('./pages/PhysicalTest/ScoreStandardsPage'))

// 运动会编排系统页面组件（懒加载）
const SportsMeetDashboard = lazy(() => import('./pages/SportsMeet/Dashboard'))
const SportsMeetManagement = lazy(() => import('./pages/SportsMeet/SportsMeetManagement'))
const EventManagementPage = lazy(() => import('./pages/SportsMeet/EventManagementPage'))
const RegistrationManagementPage = lazy(() => import('./pages/SportsMeet/RegistrationManagementPage'))
const RegistrationAuditPage = lazy(() => import('./pages/SportsMeet/RegistrationAuditPage'))
const RegistrationStatisticsPage = lazy(() => import('./pages/SportsMeet/RegistrationStatisticsPage'))
const SchedulingPage = lazy(() => import('./pages/SportsMeet/SchedulingPage'))
const ResultRecordPage = lazy(() => import('./pages/SportsMeet/ResultRecordPage'))
const ReportGenerationPage = lazy(() => import('./pages/SportsMeet/ReportGenerationPage'))
const RefereeManagement = lazy(() => import('./pages/SportsMeet/RefereeManagement'))
const VenueManagement = lazy(() => import('./pages/SportsMeet/VenueManagement'))
const TestComponent = lazy(() => import('./pages/SportsMeet/TestComponent'))

// 保护路由组件
const ProtectedRoute = ({ children }) => {
  // 直接从 localStorage 检查认证状态，不依赖 Redux
  const authData = localStorage.getItem('auth');
  
  if (!authData) {
    return <Navigate to="/login" />;
  }
  
  try {
    const parsed = JSON.parse(authData);
    if (!parsed.token) {
      return <Navigate to="/login" />;
    }
  } catch (e) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  // 添加全局错误监听
  useEffect(() => {
    const handleError = (event) => {
      console.error('[App Global Error]', event.error)
    }
    const handleUnhandledRejection = (event) => {
      console.error('[App Unhandled Rejection]', event.reason)
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return (
    <div className="app">
      <LazyWrapper>
        <Routes>
          {/* 公共路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/calculator" element={<ScoreCalculator />} />
          
          {/* 受保护路由，所有受保护的页面都在Layout中渲染 */}
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/school-info" element={<ProtectedRoute><Layout><SchoolInfo /></Layout></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><Layout><Classes /></Layout></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Layout><Students /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
          <Route path="/school-year" element={<ProtectedRoute><Layout><SchoolYearManagement /></Layout></ProtectedRoute>} />
          <Route path="/student-history" element={<ProtectedRoute><Layout><StudentHistory /></Layout></ProtectedRoute>} />
          
          {/* 体测系统路由 */}
          <Route path="/physical-test" element={<ProtectedRoute><Layout><PhysicalTestDashboard /></Layout></ProtectedRoute>} />
          <Route path="/physical-test/test-items" element={<ProtectedRoute><Layout><TestItems /></Layout></ProtectedRoute>} />
          <Route path="/physical-test/score-management" element={<ProtectedRoute><Layout><ScoreManagementPage /></Layout></ProtectedRoute>} />
          <Route path="/physical-test/statistics" element={<ProtectedRoute><Layout><StatisticsPage /></Layout></ProtectedRoute>} />
          <Route path="/physical-test/score-standards" element={<ProtectedRoute><Layout><ScoreStandardsPage /></Layout></ProtectedRoute>} />
          <Route path="/physical-test/calculator" element={<ProtectedRoute><Layout><ScoreCalculator /></Layout></ProtectedRoute>} />
          
          {/* 运动会编排系统路由 */}
          <Route path="/sports-meet" element={<ProtectedRoute><Layout><SportsMeetDashboard /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/management" element={<ProtectedRoute><Layout><SportsMeetManagement /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/events" element={<ProtectedRoute><Layout><EventManagementPage /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/registration" element={<ProtectedRoute><Layout><RegistrationManagementPage /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/audit" element={<ProtectedRoute><Layout><RegistrationAuditPage /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/statistics" element={<ProtectedRoute><Layout><RegistrationStatisticsPage /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/scheduling" element={<ProtectedRoute><Layout><SchedulingPage /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/results" element={<ProtectedRoute><Layout><ResultRecordPage /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/reports" element={<ProtectedRoute><Layout><ReportGenerationPage /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/test" element={<ProtectedRoute><Layout><TestComponent /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/referees" element={<ProtectedRoute><Layout><RefereeManagement /></Layout></ProtectedRoute>} />
          <Route path="/sports-meet/venues" element={<ProtectedRoute><Layout><VenueManagement /></Layout></ProtectedRoute>} />
          
          {/* 404路由 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LazyWrapper>
    </div>
  )
}

export default App
