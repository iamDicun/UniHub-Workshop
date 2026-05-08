import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminWorkshops from './pages/AdminWorkshops';
import AdminFailedJobs from './pages/AdminFailedJobs';
import AdminPayments from './pages/AdminPayments';
import StudentPayments from './pages/StudentPayments';
import StaffDashboard from './pages/StaffDashboard';
import Profile from './pages/Profile';
import QrGenerator from './pages/QrGenerator';
import { getHomeForRole, getStoredUser } from './utils/auth';

const RoleRoute = ({ roles, children }) => {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }
  return children;
};

const HomeRedirect = () => {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getHomeForRole(user.role)} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/student"
          element={
            <RoleRoute roles={['student']}>
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/student/payments"
          element={
            <RoleRoute roles={['student']}>
              <StudentPayments />
            </RoleRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleRoute roles={['admin']}>
              <AdminWorkshops />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/failed-jobs"
          element={
            <RoleRoute roles={['admin']}>
              <AdminFailedJobs />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <RoleRoute roles={['admin']}>
              <AdminPayments />
            </RoleRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <RoleRoute roles={['staff']}>
              <StaffDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <RoleRoute roles={['student', 'admin', 'staff']}>
              <Profile />
            </RoleRoute>
          }
        />
        <Route path="/qr-gen" element={<QrGenerator />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
