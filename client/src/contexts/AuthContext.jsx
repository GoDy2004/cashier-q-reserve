import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [staffUser, setStaffUser]     = useState(null);
  const [studentUser, setStudentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const staffToken   = localStorage.getItem('staff_token');
    const staffData    = localStorage.getItem('staff_user');
    const studentToken = localStorage.getItem('student_token');
    const studentData  = localStorage.getItem('student_user');

    if (staffToken && staffData)     setStaffUser(JSON.parse(staffData));
    if (studentToken && studentData) setStudentUser(JSON.parse(studentData));
    setLoading(false);
  }, []);

  const staffLogin = async (username, password) => {
    const res = await authAPI.staffLogin({ username, password });
    localStorage.setItem('staff_token', res.data.token);
    localStorage.setItem('staff_user', JSON.stringify(res.data.user));
    setStaffUser(res.data.user);
    return res.data.user;
  };

  const staffLogout = () => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
    setStaffUser(null);
  };

  const studentLogin = async (student_id, password) => {
    const res = await authAPI.studentLogin({ student_id, password });
    localStorage.setItem('student_token', res.data.token);
    localStorage.setItem('student_user', JSON.stringify(res.data.student));
    setStudentUser(res.data.student);
    return res.data.student;
  };

  const studentLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_user');
    setStudentUser(null);
  };

  const updateStudentUser = (data) => {
    const updated = { ...studentUser, ...data };
    localStorage.setItem('student_user', JSON.stringify(updated));
    setStudentUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      staffUser, studentUser, loading,
      staffLogin, staffLogout,
      studentLogin, studentLogout, updateStudentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
