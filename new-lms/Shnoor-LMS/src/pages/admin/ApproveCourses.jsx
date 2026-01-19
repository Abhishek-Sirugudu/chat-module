import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaPlay, FaFileAlt } from 'react-icons/fa';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import '../../styles/Dashboard.css';

const ApproveCourses = () => {
    const navigate = useNavigate();
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        fetchPendingCourses();
    }, []);

    const fetchPendingCourses = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "courses"),
                where("status", "==", "pending")
            );

            const querySnapshot = await getDocs(q);
            const courses = [];
            querySnapshot.forEach((doc) => {
                courses.push({ id: doc.id, ...doc.data() });
            });

            setPendingCourses(courses);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pending courses:", error);
            setLoading(false);
        }
    };

    const handleAction = async (courseId, status) => {
        const confirmMsg = status === 'published' ? 'APPROVE and PUBLISH' : 'REJECT';
        if (!window.confirm(`Are you sure you want to ${confirmMsg} this course?`)) return;

        try {
            await updateDoc(doc(db, "courses", courseId), {
                status: status,
                verifiedAt: new Date().toISOString()
            });

            alert(`Course ${status === 'published' ? 'Approved' : 'Rejected'}!`);
            setPendingCourses(prev => prev.filter(c => c.id !== courseId));
            setSelectedCourse(null);
        } catch (error) {
            console.error("Error updating course status:", error);
            alert("Failed to update status.");
        }
    };


    if (loading) return <div className="p-8">Loading courses queue...</div>;

    return (
        <div className="p-6">
            <div className="approval-header">
                <h2 className="text-2xl font-bold text-gray-800">Course Approval Queue</h2>
                <div className="pending-badge">
                    {pendingCourses.length} Pending
                </div>
            </div>

            <div className={`approval-grid ${selectedCourse ? 'split' : ''}`}>

                <div className="table-container table-scroll-container">
                    <table style={{ width: '100%' }}>
                        <thead className="sticky-thead">
                            <tr>
                                <th>Course Title</th>
                                <th>Instructor</th>
                                <th>Category</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCourses.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No courses pending approval.</td></tr>
                            ) : (
                                pendingCourses.map(course => (
                                    <tr
                                        key={course.id}
                                        className={`course-row-base hover:bg-gray-50 transition-colors ${selectedCourse?.id === course.id ? 'course-row-selected' : ''}`}
                                        onClick={() => setSelectedCourse(course)}
                                    >
                                        <td style={{ fontWeight: 600, color: '#1f2937' }}>{course.title}</td>
                                        <td>{course.instructorName || course.instructorId}</td>
                                        <td><span className="category-badge">{course.category}</span></td>
                                        <td>
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Review</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedCourse && (
                    <div className="form-box details-panel">
                        <div className="details-header">
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>{selectedCourse.title}</h3>
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Category: {selectedCourse.category} • Instructor: {selectedCourse.instructorName || 'Unknown'}</p>
                            </div>
                            <button onClick={() => setSelectedCourse(null)} className="close-btn"><FaTimesCircle /></button>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <h4 className="section-title">Description</h4>
                            <p className="description-box">{selectedCourse.description}</p>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <h4 className="section-title">Course Content ({selectedCourse.modules ? selectedCourse.modules.length : 0} Modules)</h4>
                            <div className="module-list custom-scrollbar">
                                {selectedCourse.modules && selectedCourse.modules.map((m, idx) => (
                                    <div key={idx} className="module-item">
                                        <div className={`module-icon ${m.type}`}>
                                            {m.type === 'video' ? <FaPlay color="#ef4444" size={12} /> : <FaFileAlt color="#3b82f6" size={12} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: '#374151' }}>{m.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{m.type.toUpperCase()} • {m.duration} mins</div>
                                        </div>
                                        {m.url && (
                                            <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>Link</a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="approval-actions">
                            <button
                                className="btn-secondary btn-reject"
                                onClick={() => handleAction(selectedCourse.id, 'rejected')}
                            >
                                <FaTimesCircle style={{ marginRight: '8px' }} /> Reject
                            </button>
                            <button
                                className="btn-primary btn-approve"
                                onClick={() => handleAction(selectedCourse.id, 'published')}
                            >
                                <FaCheckCircle style={{ marginRight: '8px' }} /> Approve & Publish
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApproveCourses;
