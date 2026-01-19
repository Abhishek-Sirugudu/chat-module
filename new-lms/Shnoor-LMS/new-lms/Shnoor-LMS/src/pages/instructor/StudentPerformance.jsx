import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaExclamationTriangle, FaCheckCircle, FaChartLine, FaEnvelope } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const StudentPerformance = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const students = [
        { id: 1, name: "Alice Johnson", course: "React Basics", progress: 85, score: 92, status: "Excellent" },
        { id: 2, name: "Bob Smith", course: "React Basics", progress: 45, score: 78, status: "Good" },
        { id: 3, name: "Charlie Brown", course: "Adv. Node.js", progress: 20, score: 55, status: "At Risk" },
        { id: 4, name: "Diana Prince", course: "UI/UX Design", progress: 95, score: 98, status: "Excellent" },
        { id: 5, name: "Evan Wright", course: "Python Intro", progress: 10, score: 40, status: "At Risk" },
        { id: 6, name: "Fiona Gallagher", course: "React Basics", progress: 60, score: 82, status: "Good" },
    ];

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
            case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'At Risk': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex-between-center mb-xl">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="back-button">
                        <FaArrowLeft /> Back
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Student Performance</h2>
                        <p className="text-gray-500">Track progress and identify students who need help.</p>
                    </div>
                </div>
            </div>

            <div className="grid-3 mb-xl">
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="flex-between-center">
                        <div>
                            <span className="stat-label">Total Students</span>
                            <div className="stat-number">{students.length}</div>
                        </div>
                        <div className="icon-circle indigo">
                            <FaChartLine size={20} />
                        </div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="flex-between-center">
                        <div>
                            <span className="stat-label">At Risk</span>
                            <div className="stat-number text-red-600">
                                {students.filter(s => s.status === 'At Risk').length}
                            </div>
                        </div>
                        <div className="icon-circle" style={{ background: '#fee2e2', color: '#ef4444' }}>
                            <FaExclamationTriangle size={20} />
                        </div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="flex-between-center">
                        <div>
                            <span className="stat-label">High Performers</span>
                            <div className="stat-number text-green-600">
                                {students.filter(s => s.status === 'Excellent').length}
                            </div>
                        </div>
                        <div className="icon-circle green">
                            <FaCheckCircle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-box full-width">
                <div className="flex-between-center mb-lg">
                    <h3 className="section-title mb-0">Enrolled Students</h3>
                    <div className="search-bar-styled mb-0" style={{ width: '300px' }}>
                        <div className="input-icon-wrapper">
                            <FaSearch />
                        </div>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search student or course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container shadow-none border-0">
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Course</th>
                                <th>Progress</th>
                                <th>Avg. Quiz Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td>
                                            <div className="font-semibold text-gray-800">{student.name}</div>
                                            <div className="text-xs text-gray-400">ID: STD-{student.id}00</div>
                                        </td>
                                        <td>{student.course}</td>
                                        <td>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200 mt-1" style={{ width: '120px' }}>
                                                <div
                                                    className={`h-2.5 rounded-full ${student.progress < 30 ? 'bg-red-500' : 'bg-blue-600'}`}
                                                    style={{ width: `${student.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{student.progress}% Completed</div>
                                        </td>
                                        <td>
                                            <span className={`font-bold ${student.score < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                                                {student.score}%
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(student.status)}`}>
                                                {student.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-action-sm"
                                                onClick={() => navigate('/instructor/chat')}
                                                title="Message Student"
                                                style={{
                                                    background: '#eff6ff',
                                                    color: '#3b82f6',
                                                    border: 'none',
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <FaEnvelope /> Message
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentPerformance;
