import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
import FeeOverview from '../pages/fees/FeeOverview';
import CreateFee from '../pages/fees/CreateFee';
import BatchFees from '../pages/fees/BatchFees';
import ProtectedRoute from '../components/common/ProtectedRoute';
import BatchContent from '../pages/content/BatchContent';
import BrandingSettings from '../pages/branding/BrandingSettings';
import PosterGenerator from '../pages/poster/PosterGenerator';
import TestList from '../pages/tests/TestList';
import CreateTest from '../pages/tests/CreateTest';
import TestDetail from '../pages/tests/TestDetail';
import Leaderboard from '../pages/tests/Leaderboard';
import HomeworkList from '../pages/homework/HomeworkList';
import CreateHomework from '../pages/homework/CreateHomework';
import HomeworkSubmissions from '../pages/homework/HomeworkSubmissions';
import CalendarView from '../pages/calendar/CalendarView';
import CreateEvent from '../pages/calendar/CreateEvent';

const RootRedirect = () => {
  const { user, accessToken } = useAuth();
  return <Navigate to={accessToken && user ? '/dashboard' : '/login'} replace />;
};

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

      <Route
        path="/fees"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FeeOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fees/create"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateFee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fees/batch"
        element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <BatchFees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/content"
        element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <BatchContent />
          </ProtectedRoute>
        }
      />

      <Route
  path="/poster"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <PosterGenerator />
    </ProtectedRoute>


  }
/>



<Route
  path="/calendar"
  element={
    <ProtectedRoute>
      <CalendarView />
    </ProtectedRoute>
  }
/>
<Route
  path="/calendar/create"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <CreateEvent />
    </ProtectedRoute>
  }
/>

<Route
  path="/homework"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <HomeworkList />
    </ProtectedRoute>
  }
/>
<Route
  path="/homework/create"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <CreateHomework />
    </ProtectedRoute>
  }
/>
<Route
  path="/homework/:id/submissions"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <HomeworkSubmissions />
    </ProtectedRoute>
  }
/>


<Route
  path="/tests"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <TestList />
    </ProtectedRoute>
  }
/>
<Route
  path="/tests/create"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <CreateTest />
    </ProtectedRoute>
  }
/>
<Route
  path="/tests/:id"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <TestDetail />
    </ProtectedRoute>
  }
/>
<Route
  path="/tests/leaderboard/:batchId"
  element={
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <Leaderboard />
    </ProtectedRoute>
  }
/>




      <Route
  path="/branding"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <BrandingSettings />
    </ProtectedRoute>
  }
/>

     <Route path="/" element={<RootRedirect />} />
    </Routes>
  );
};

export default AppRoutes;