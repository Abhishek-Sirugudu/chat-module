import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaBookOpen, FaUserCheck, FaChalkboardTeacher, FaExclamationCircle, FaChartLine, FaDollarSign, FaUsers, FaArrowUp, FaArrowDown, FaGlobe } from 'react-icons/fa';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import '../../styles/Dashboard.css';

// Custom SVG Bar Chart Component with fixed color handling
const BarChart = ({ data, height = 200, color = "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)" }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <div className="analytics-chart-container" style={{ height: height }}>
      <div className="chart-bars">
        {data.map((item, idx) => (
          <div key={idx} className="chart-bar-wrapper">
            <div
              className="chart-bar-fill"
              style={{
                height: `${(item.value / maxVal) * 100}%`,
                background: color
              }}
            >
              <div className="tooltip">{item.value.toLocaleString()}</div>
            </div>
            <span className="chart-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom SVG Line Chart Component with fixed Aspect Ratio
const LineChart = ({ data, height = 200, color = "#10b981" }) => {
  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = Math.min(...data.map(d => d.value));

  // Calculate points for a 500x100 coord system to reduce distortion
  const width = 500;
  const chartHeight = 100;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = chartHeight - ((d.value - minVal) / (maxVal - minVal)) * (chartHeight * 0.8) - 10; // Padding
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="analytics-chart-container" style={{ height: height, position: 'relative', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M0,${chartHeight} ${points} ${width},${chartHeight}`}
          fill={`url(#gradient-${color.replace('#', '')})`}
          style={{ transition: 'd 0.5s ease' }}
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chart-line-path"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = chartHeight - ((d.value - minVal) / (maxVal - minVal)) * (chartHeight * 0.8) - 10;
          return (
            <g key={i} className="chart-point-group">
              <circle
                cx={x}
                cy={y}
                r="3"
                fill="white"
                stroke={color}
                strokeWidth="2"
                className="chart-point"
                vectorEffect="non-scaling-stroke"
              />
              <rect x={x - 20} y={y - 30} width="40" height="20" fill="transparent" />
            </g>
          );
        })}
      </svg>
      <div className="chart-labels-x" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
        {data.map((d, i) => (
          <span key={i} style={{ position: 'static', transform: 'none' }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    pendingCourses: 0,
    activeInstructors: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data for analytics
  const courseEngagementData = [
    { label: 'React', value: 120 },
    { label: 'UI/UX', value: 95 },
    { label: 'Python', value: 85 },
    { label: 'Node', value: 70 },
    { label: 'DevOps', value: 60 },
    { label: 'AWS', value: 45 },
  ];

  const studentActivityData = [
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 145 },
    { label: 'Wed', value: 132 },
    { label: 'Thu', value: 190 },
    { label: 'Fri', value: 210 },
    { label: 'Sat', value: 180 },
    { label: 'Sun', value: 250 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let total = 0;
        let pending = 0;
        let instructors = 0;

        usersSnapshot.forEach(doc => {
          const data = doc.data();
          total++;
          if (data.accountStatus === 'pending') pending++;
          if (data.role === 'instructor') instructors++;
        });

        const pendingCoursesQuery = query(collection(db, "courses"), where("status", "==", "pending"));
        const pendingCoursesSnapshot = await getDocs(pendingCoursesQuery);
        const pendingCoursesCount = pendingCoursesSnapshot.size;

        setStats({
          totalUsers: total,
          pendingUsers: pending,
          pendingCourses: pendingCoursesCount,
          activeInstructors: instructors
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const recentActivity = [
    { id: 1, text: "New Instructor application received: John Doe", time: "2 mins ago", type: 'user' },
    { id: 2, text: "System backup completed successfully", time: "1 hour ago", type: 'system' },
    { id: 3, text: "Course 'React Basics' approved by Admin", time: "3 hours ago", type: 'course' },
    { id: 4, text: "Payment received: $49.99 from Jane Smith", time: "5 hours ago", type: 'payment' },
    { id: 5, text: "New Ticket: Login issue reported", time: "6 hours ago", type: 'alert' }
  ];

  if (loading) return <div className="p-8">Loading dashboard metrics...</div>;

  return (
    <div className="p-6 dashboard-fade-in">
      <div className="flex-between-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
          <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button className="btn-primary"><FaArrowDown style={{ marginRight: '8px' }} /> Download Report</button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid-4 mb-xl">
        <div className="stat-card premium-card">
          <div className="flex-between-center mb-2">
            <span className="stat-label">Total Learners</span>
            <span className="trend-badge positive"><FaArrowUp /> 8.2%</span>
          </div>
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-subtext">Active Learners</div>
          <div className="stat-icon-overlay primary"><FaUsers /></div>
        </div>

        <div className="stat-card premium-card">
          <div className="flex-between-center mb-2">
            <span className="stat-label">Course Enrollments</span>
            <span className="trend-badge positive"><FaArrowUp /> 15%</span>
          </div>
          <div className="stat-number">482</div>
          <div className="stat-subtext">New this month</div>
          <div className="stat-icon-overlay info"><FaBookOpen /></div>
        </div>

        <div className="stat-card premium-card">
          <div className="flex-between-center mb-2">
            <span className="stat-label">Completion Rate</span>
            <span className="trend-badge neutral">+2%</span>
          </div>
          <div className="stat-number">68%</div>
          <div className="stat-subtext">Avg. across all courses</div>
          <div className="stat-icon-overlay success"><FaChalkboardTeacher /></div>
        </div>

        <div className="stat-card premium-card">
          <div className="flex-between-center mb-2">
            <span className="stat-label">Active Instructors</span>
            <span className="trend-badge neutral">+1.2%</span>
          </div>
          <div className="stat-number">{stats.activeInstructors}</div>
          <div className="stat-subtext">Currently active</div>
          <div className="stat-icon-overlay secondary"><FaUserCheck /></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-2 mb-xl" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="form-box full-width" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <div className="flex-between-center mb-6">
            <h3 className="section-title mb-0">Most Popular Courses</h3>
            <div className="time-filter">
              <span className="active">Enrollments</span>
              <span>Views</span>
            </div>
          </div>
          <BarChart data={courseEngagementData} color="linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)" />
        </div>

        <div className="form-box full-width" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <div className="flex-between-center mb-6">
            <h3 className="section-title mb-0">Student Activity</h3>
            <FaChartLine className="text-gray-400" />
          </div>
          <LineChart data={studentActivityData} color="#10b981" />
          <div className="mt-4 text-center">
            <span className="text-2xl font-bold text-green-600">250</span>
            <p className="text-sm text-gray-500">Active students today</p>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid-2 mb-xl">
        <div className="form-box full-width">
          <h3 className="section-title mb-md">Student Performance Metrics</h3>
          <div className="region-list">
            <div className="region-item">
              <div className="flex items-center gap-3">
                <FaBookOpen className="text-blue-500" />
                <span>Course Completion Rate</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: '78%' }}></div>
              </div>
              <span className="font-bold">78%</span>
            </div>
            <div className="region-item">
              <div className="flex items-center gap-3">
                <FaChalkboardTeacher className="text-purple-500" />
                <span>Quiz Pass Rate</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar purple" style={{ width: '64%' }}></div>
              </div>
              <span className="font-bold">64%</span>
            </div>
            <div className="region-item">
              <div className="flex items-center gap-3">
                <FaUsers className="text-green-500" />
                <span>Assignment Submission</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar green" style={{ width: '92%' }}></div>
              </div>
              <span className="font-bold">92%</span>
            </div>
          </div>
        </div>              <span>11%</span>
      </div>

      {/* Recent Activity Section */}
      <div className="form-box full-width">
        <h3 className="section-title mb-md">Recent System Activity</h3>
        <div className="activity-list">
          {recentActivity.map(item => (
            <div key={item.id} className="activity-item">
              <div className={`activity-dot ${item.type}`}></div>
              <div className="activity-content">
                <p className="activity-text">{item.text}</p>
                <span className="activity-time">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;