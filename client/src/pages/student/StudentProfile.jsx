import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { studentAPI } from '../../services/api';
import styles from './StudentProfile.module.css';

export default function StudentProfile() {
  const { studentUser, studentLogout } = useAuth();
  const navigate = useNavigate();

  const [confirmLogout, setConfirmLogout]   = useState(false);
  const [modal, setModal]                   = useState(null); // 'edit' | 'password'

  // Edit profile state
  const [editForm, setEditForm] = useState({
    full_name:      studentUser?.full_name      || '',
    course:         studentUser?.course         || '',
    year_section:   studentUser?.year_section   || '',
    contact_number: studentUser?.contact_number || '',
    email:          studentUser?.email          || '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg]         = useState('');

  // Change password state
  const [pwForm, setPwForm]   = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg]     = useState('');
  const [pwError, setPwError] = useState('');
  const [showPw, setShowPw]   = useState({ current: false, new: false, confirm: false });

  const handleLogout = () => {
    studentLogout();
    navigate('/login');
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditMsg('');
    try {
      await studentAPI.updateProfile(studentUser.id, editForm);
      setEditMsg('✅ Profile updated successfully!');
      setTimeout(() => { setModal(null); setEditMsg(''); }, 1500);
    } catch (err) {
      setEditMsg('❌ ' + (err.response?.data?.error || 'Failed to update profile'));
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError('');
    setPwMsg('');
    if (!pwForm.current_password || !pwForm.new_password || !pwForm.confirm_password) {
      setPwError('Please fill in all fields.'); return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match.'); return;
    }
    if (pwForm.new_password.length < 6) {
      setPwError('New password must be at least 6 characters.'); return;
    }
    setPwLoading(true);
    try {
      await studentAPI.changePassword(studentUser.id, {
        current_password: pwForm.current_password,
        new_password:     pwForm.new_password,
      });
      setPwMsg('✅ Password changed successfully!');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => { setModal(null); setPwMsg(''); }, 1800);
    } catch (err) {
      setPwError('❌ ' + (err.response?.data?.error || 'Failed to change password'));
    } finally {
      setPwLoading(false);
    }
  };

  const MENU_SECTIONS = [
    {
      title: 'Account',
      items: [
        { icon: '✏️', label: 'Edit Profile',    action: () => setModal('edit') },
        { icon: '🔒', label: 'Change Password', action: () => setModal('password') },
        { icon: '💳', label: 'Payment Methods', action: null },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: '🔔', label: 'Notifications',             action: null },
        { icon: '❓', label: 'Help & Support',            action: null },
        { icon: 'ℹ️', label: 'About Cashier-Q Reserve',  action: null },
      ],
    },
  ];

  if (!studentUser) return null;

  return (
    <div className={styles.page}>
      {/* Purple header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>{studentUser.full_name[0]}</div>
          <button className={styles.cameraBtn}>📷</button>
        </div>
        <h2 className={styles.name}>{studentUser.full_name}</h2>
        <p className={styles.meta}>{studentUser.student_id} · {studentUser.course} {studentUser.year_section}</p>
      </div>

      {/* Menu sections */}
      <div className={styles.content}>
        {MENU_SECTIONS.map(section => (
          <div key={section.title} className={styles.section}>
            <p className={styles.sectionTitle}>{section.title}</p>
            <div className={styles.menuCard}>
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  className={`${styles.menuItem} ${i < section.items.length - 1 ? styles.menuItemBorder : ''}`}
                  onClick={item.action || undefined}
                  style={!item.action ? { opacity: 0.5, cursor: 'default' } : {}}
                >
                  <div className={styles.menuLeft}>
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span className={styles.menuLabel}>{item.label}</span>
                  </div>
                  <ChevronIcon />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className={styles.section}>
          {!confirmLogout ? (
            <button className={styles.logoutBtn} onClick={() => setConfirmLogout(true)}>
              <span>🚪</span> Log Out
            </button>
          ) : (
            <div className={styles.confirmWrap}>
              <p>Are you sure you want to log out?</p>
              <div className={styles.confirmBtns}>
                <button className={styles.cancelBtn} onClick={() => setConfirmLogout(false)}>Cancel</button>
                <button className={styles.confirmLogout} onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          )}
        </div>

        <p className={styles.version}>Cashier-Q Reserve · v1.0.0</p>
      </div>

      {/* ── Edit Profile Modal ── */}
      {modal === 'edit' && (
        <div style={overlayStyle} onClick={() => setModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={modalTitleStyle}>Edit Profile</h3>
            {[
              ['Full Name',       'full_name',      'text'],
              ['Course',          'course',         'text'],
              ['Year & Section',  'year_section',   'text'],
              ['Contact Number',  'contact_number', 'tel'],
              ['Email',           'email',          'email'],
            ].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={type}
                  value={editForm[key]}
                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}
            {editMsg && <p style={{ fontSize: 13, marginBottom: 10, color: editMsg.startsWith('✅') ? '#065f46' : '#dc2626' }}>{editMsg}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button style={cancelBtnStyle} onClick={() => setModal(null)}>Cancel</button>
              <button style={saveBtnStyle} onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {modal === 'password' && (
        <div style={overlayStyle} onClick={() => setModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h3 style={modalTitleStyle}>Change Password</h3>
            {[
              ['Current Password', 'current_password', 'current'],
              ['New Password',     'new_password',     'new'],
              ['Confirm Password', 'confirm_password', 'confirm'],
            ].map(([label, key, showKey]) => (
              <div key={key} style={{ marginBottom: 12, position: 'relative' }}>
                <label style={labelStyle}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw[showKey] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: 40 }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => ({ ...s, [showKey]: !s[showKey] }))}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                  >
                    {showPw[showKey] ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            ))}
            {pwError && <p style={{ fontSize: 13, marginBottom: 10, color: '#dc2626' }}>{pwError}</p>}
            {pwMsg   && <p style={{ fontSize: 13, marginBottom: 10, color: '#065f46' }}>{pwMsg}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button style={cancelBtnStyle} onClick={() => { setModal(null); setPwError(''); setPwMsg(''); setPwForm({ current_password: '', new_password: '', confirm_password: '' }); }}>
                Cancel
              </button>
              <button style={saveBtnStyle} onClick={handlePasswordChange} disabled={pwLoading}>
                {pwLoading ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline styles for modal ──
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 20,
};
const modalStyle = {
  background: '#fff', borderRadius: 16, padding: 24,
  width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};
const modalTitleStyle = {
  fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 18,
};
const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.4px',
};
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
  borderRadius: 8, fontSize: 14, color: '#111827',
  boxSizing: 'border-box', outline: 'none',
};
const cancelBtnStyle = {
  flex: 1, padding: 11, background: '#f3f4f6', border: 'none',
  borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#6b7280', cursor: 'pointer',
};
const saveBtnStyle = {
  flex: 1, padding: 11, background: '#7c3aed', border: 'none',
  borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
};

function ChevronIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{color:'#9ca3af'}}><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
