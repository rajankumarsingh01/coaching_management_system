import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import CreateUser from '../pages/users/CreateUser';
import InstituteList from '../pages/institutes/InstituteList';
import CreateInstitute from '../pages/institutes/CreateInstitute';
import BatchList from '../pages/batches/BatchList';
import CreateBatch from '../pages/batches/CreateBatch';
import BatchDetail from '../pages/batches/BatchDetail';
import MarkAttendance from '../pages/attendance/MarkAttendance';
import AttendanceReport from '../pages/attendance/AttendanceReport';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/create"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/institutes"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <InstituteList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/institutes/create"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <CreateInstitute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/batches"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BatchList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batches/create"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateBatch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batches/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BatchDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance/mark"
        element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <MarkAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/report"
        element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <AttendanceReport />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;