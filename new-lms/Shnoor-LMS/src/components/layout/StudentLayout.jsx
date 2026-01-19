import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { FaList, FaTrophy, FaUserCircle, FaSignOutAlt, FaStar, FaChartLine, FaCompass, FaClipboardList, FaCode, FaBars } from 'react-icons/fa';
import markLogo from '../../assets/just_logo.jpeg';
import { db } from '../../auth/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getRank } from '../../utils/gamification';
import '../../styles/Dashboard.css';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();
    const [xp, setXp] = useState(0);
    const [rank, setRank] = useState('Novice');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { unreadCounts } = useSocket();
    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setXp(data.xp || 0);
                        const rankObj = getRank(data.xp || 0);
                        setRank(rankObj.name);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, [currentUser]);


    const studentName = currentUser?.displayName || "Student";

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

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

                <ul className="nav-links">
                    <li
                        className={`nav-item ${location.pathname.includes('dashboard') ? 'active' : ''}`}
                        onClick={() => { navigate('/student/dashboard'); setIsSidebarOpen(false); }}
                    >
                        <FaChartLine className="nav-icon" /> Dashboard
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('courses') && !location.pathname.includes('dashboard') ? 'active' : ''}`}
                        onClick={() => { navigate('/student/courses'); setIsSidebarOpen(false); }}
                    >
                        <FaList className="nav-icon" /> My Courses
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('exams') ? 'active' : ''}`}
                        onClick={() => { navigate('/student/exams'); setIsSidebarOpen(false); }}
                    >
                        <FaClipboardList className="nav-icon" /> Exams
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('certificates') ? 'active' : ''}`}
                        onClick={() => { navigate('/student/certificates'); setIsSidebarOpen(false); }}
                    >
                        <FaTrophy className="nav-icon" /> Certificates
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('practice') ? 'active' : ''}`}
                        onClick={() => { navigate('/student/practice'); setIsSidebarOpen(false); }}
                    >
                        <FaCode className="nav-icon" /> Practice Arena
                    </li>

                    <li
                        className={`nav-item ${location.pathname.includes('chat') ? 'active' : ''}`}
                        onClick={() => { navigate('/student/chat'); setIsSidebarOpen(false); }}
                    >
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
                            <h2 className="text-lg font-semibold text-primary">Student Portal</h2>
                        </div>
                    </div>

                    <div className="user-profile-section">
                        <div className="hidden md:flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm mr-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Current Rank</span>
                                <span className="text-indigo-600 font-bold text-sm leading-none">{rank}</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                                <FaTrophy size={14} />
                            </div>
                        </div>

                        <div style={{
                            background: '#fef9c3', color: '#854d0e', padding: '6px 12px', borderRadius: '20px',
                            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px',
                            border: '1px solid #fde047', marginRight: '15px'
                        }}>
                            <FaStar color="#eab308" /> {xp} XP
                        </div>

                        <div className="user-info">
                            <span className="user-name">{studentName}</span>
                            <span className="user-role">Student</span>
                        </div>
                        <FaUserCircle style={{ fontSize: '2.2rem', color: '#9ca3af' }} />
                        <button onClick={handleLogout} className="logout-btn" title="Logout">
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>

                <div className="content-area">
                    <Outlet context={{ studentName, xp }} />
                </div>
            </div>
        </div>
    );
};

export default StudentLayout;
