import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout/Layout'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

// 页面组件
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SchoolInfo from './pages/SchoolInfo'
import Classes from './pages/Classes'
import Students from './pages/Students'
import Users from './pages/Users'
import SchoolYearManagement from './pages/SchoolYearManagement'
import StudentHistory from './pages/StudentHistory'

// 体测系统页面组件
import PhysicalTestDashboard from './pages/PhysicalTest/Dashboard'
import TestItems from './pages/PhysicalTest/TestItems'
import ScoreManagementPage from './pages/PhysicalTest/ScoreManagementPage'
import StatisticsPage from './pages/PhysicalTest/StatisticsPage'
import ScoreStandardsPage from './pages/PhysicalTest/ScoreStandardsPage'

// 运动会编排系统页面组件
import SportsMeetDashboard from './pages/SportsMeet/Dashboard'
import SportsMeetManagement from './pages/SportsMeet/SportsMeetManagement'
import EventManagementPage from './pages/SportsMeet/EventManagementPage'
import RegistrationManagementPage from './pages/SportsMeet/RegistrationManagementPage'
import RegistrationAuditPage from './pages/SportsMeet/RegistrationAuditPage'
import RegistrationStatisticsPage from './pages/SportsMeet/RegistrationStatisticsPage'
import SchedulingPage from './pages/SportsMeet/SchedulingPage'
import ResultRecordPage from './pages/SportsMeet/ResultRecordPage'
import ReportGenerationPage from './pages/SportsMeet/ReportGenerationPage'
import RefereeManagement from './pages/SportsMeet/RefereeManagement'
import VenueManagement from './pages/SportsMeet/VenueManagement'
import TestComponent from './pages/SportsMeet/TestComponent'

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
  return (
    <div className="app">
      <Routes>
        {/* 公共路由 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
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
    </div>
  )
}

export default App
