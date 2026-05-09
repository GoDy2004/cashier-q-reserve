import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Student pages
import StudentHome        from './pages/student/StudentHome';
import StudentQueue       from './pages/student/StudentQueue';
import StudentReserve     from './pages/student/StudentReserve';
import StudentHistory     from './pages/student/StudentHistory';
import StudentProfile     from './pages/student/StudentProfile';
import StudentTransaction from './pages/student/StudentTransaction';
import StudentLogin       from './pages/student/StudentLogin';
import StudentLayout      from './pages/student/StudentLayout';

// Admin pages
import RoleSelect         from './pages/admin/RoleSelect';
import AdminLogin         from './pages/admin/AdminLogin';
import AdminLayout        from './pages/admin/AdminLayout';
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminQueueMonitor  from './pages/admin/AdminQueueMonitor';
import AdminReservations  from './pages/admin/AdminReservations';
import AdminTransactions  from './pages/admin/AdminTransactions';
import AdminVerification  from './pages/admin/AdminVerification';
import AdminReports       from './pages/admin/AdminReports';

function StudentGuard({ children }) {
  const { studentUser, loading } = useAuth();
  if (loading) return <Spinner color="#7c3aed" />;
  return studentUser ? children : <Navigate to="/login" replace />;
}

function StaffGuard({ children }) {
  const { staffUser, loading } = useAuth();
  if (loading) return <Spinner color="#2563eb" />;
  return staffUser ? children : <Navigate to="/admin/login" replace />;
}

function Spinner({ color }) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <div style={{width:32,height:32,border:`3px solid ${color}22`,borderTopColor:color,borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Student */}
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/" element={<StudentGuard><StudentLayout /></StudentGuard>}>
            <Route index               element={<StudentHome />} />
            <Route path="queue"        element={<StudentQueue />} />
            <Route path="reserve"      element={<StudentReserve />} />
            <Route path="history"      element={<StudentHistory />} />
            <Route path="transactions" element={<StudentTransaction />} />
            <Route path="profile"      element={<StudentProfile />} />
          </Route>

          {/* Admin */}
          <Route path="/admin"       element={<RoleSelect />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/app"   element={<StaffGuard><AdminLayout /></StaffGuard>}>
            <Route index                 element={<AdminDashboard />} />
            <Route path="queue"          element={<AdminQueueMonitor />} />
            <Route path="reservations"   element={<AdminReservations />} />
            <Route path="transactions"   element={<AdminTransactions />} />
            <Route path="verification"   element={<AdminVerification />} />
            <Route path="reports"        element={<AdminReports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
