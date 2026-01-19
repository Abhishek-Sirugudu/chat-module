import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { FaUserCircle, FaChalkboardTeacher, FaUserGraduate, FaBook, FaSignOutAlt, FaThLarge, FaList, FaCog, FaFileUpload, FaBars } from 'react-icons/fa';
import markLogo from '../../assets/just_logo.jpeg';
import '../../styles/Dashboard.css';

const InstructorLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();
    const { unreadCounts } = useSocket();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Instructor';

    return (
        <div className="dashboard-container bg-background-muted text-slate-900">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <img
                            src={markLogo}
                            alt="SHNOOR International"
                        />
                        <div className="sidebar-brand-text">
                            <span className="sidebar-brand-title">SHNOOR</span>
                            <span className="sidebar-brand-subtitle">International</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section-header">
                    ACADEMIC OPS
                </div>

                <ul className="nav-links">
                    <li className={`nav-item ${location.pathname.includes('dashboard') ? 'active' : ''}`} onClick={() => { navigate('/instructor/dashboard'); setIsSidebarOpen(false); }}>
                        <FaThLarge className="nav-icon" /> Dashboard
                    </li>
                    <li className={`nav-item ${location.pathname.includes('add-course') ? 'active' : ''}`} onClick={() => { navigate('/instructor/add-course'); setIsSidebarOpen(false); }}>
                        <FaFileUpload className="nav-icon" /> Add Course
                    </li>
                </ul>

                <div className="sidebar-section-header">
                    MANAGEMENT
                </div>

                <ul className="nav-links">
                    <li className={`nav-item ${location.pathname.includes('courses') ? 'active' : ''}`} onClick={() => { navigate('/instructor/courses'); setIsSidebarOpen(false); }}>
                        <FaList className="nav-icon" /> My Courses
                    </li>
                    <li className={`nav-item ${location.pathname.includes('exams') ? 'active' : ''}`} onClick={() => { navigate('/instructor/exams'); setIsSidebarOpen(false); }}>
                        <FaBook className="nav-icon" /> Exams
                    </li>
                    <li className={`nav-item ${location.pathname.includes('chat') ? 'active' : ''}`} onClick={() => { navigate('/instructor/chat'); setIsSidebarOpen(false); }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>💬</span> Messages
                            </span>
                            {totalUnread > 0 && (
                                <span className="badge-count" style={{
                                    background: '#ef4444', color: 'white', borderRadius: '50%',
                                    padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold'
                                }}>
                                    {totalUnread}
                                </span>
                            )}
                        </div>
                    </li>
                </ul>

                <div className="sidebar-section-header">
                    SETTINGS
                </div>

                <ul className="nav-links">
                    <li className={`nav-item ${location.pathname.includes('settings') ? 'active' : ''}`} onClick={() => { navigate('/instructor/settings'); setIsSidebarOpen(false); }}>
                        <FaCog className="nav-icon" /> Settings
                    </li>
                </ul>
            </div>

            <div className="main-content">
                <div className="top-bar">
                    <div className="flex items-center gap-3">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <FaBars />
                        </button>
                        <div className="page-title">
                            <h2 className="text-lg font-semibold text-primary">Instructor Dashboard</h2>
                        </div>
                    </div>
                    <div className="user-profile-section">
                        <div className="user-info">
                            <span className="user-name">{userName}</span>
                            <span className="user-role">Instructor</span>
                        </div>
                        <FaUserCircle className="user-avatar" />
                        <button onClick={handleLogout} className="logout-btn" title="Logout"><FaSignOutAlt /></button>
                    </div>
                </div>
                <div className="content-area"><Outlet /></div>
            </div>
        </div>
    );
};

export default InstructorLayout;
