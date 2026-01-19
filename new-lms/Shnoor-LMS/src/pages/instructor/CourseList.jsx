import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFolder, FaPlus, FaTrash, FaEdit, FaBookOpen } from 'react-icons/fa';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../auth/firebase';
import '../../styles/Dashboard.css';

const CourseList = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        if (!auth.currentUser) return;
        try {
            setLoading(true);
            const q = query(
                collection(db, "courses"),
                where("instructorId", "==", auth.currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const courseList = [];
            querySnapshot.forEach((doc) => {
                courseList.push({ id: doc.id, ...doc.data() });
            });

            if (courseList.length === 0) {
                const mockFallback = [
                    {
                        id: 'mock1',
                        title: 'React Fundamentals (Demo)',
                        category: 'Web Development',
                        status: 'published',
                        modules: new Array(12).fill(null),
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'mock2',
                        title: 'Draft Course (Demo)',
                        category: 'Design',
                        status: 'draft',
                        modules: new Array(3).fill(null),
                        createdAt: new Date().toISOString()
                    }
                ];
                setCourses(mockFallback);
            } else {
                setCourses(courseList);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (e, courseId, status) => {
        e.stopPropagation();
        if (status === 'published') {
            alert("Cannot delete a published course. Please contact admin.");
            return;
        }

        if (window.confirm('Are you sure you want to delete this course? This cannot be undone.')) {
            try {
                if (courseId.startsWith('mock')) {
                    setCourses(courses.filter(c => c.id !== courseId));
                    return;
                }

                await deleteDoc(doc(db, "courses", courseId));
                setCourses(courses.filter(c => c.id !== courseId));
            } catch (error) {
                console.error("Error deleting course:", error);
                alert("Failed to delete course.");
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'rejected': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (loading) return <div className="p-8">Loading your library...</div>;

    return (
        <div className="p-6">
            <div className="table-header">
                <h3>My Courses</h3>
                <button className="btn-primary" onClick={() => navigate('/instructor/add-course')}>
                    <FaPlus /> Create New Course
                </button>
            </div>

            <div className="folder-grid">
                {courses.length === 0 ? (
                    <div className="empty-state-card">
                        <FaBookOpen size={48} className="text-gray-400 mb-md" />
                        <h3>No courses yet.</h3>
                        <p className="mb-md">Start teaching today by creating your first course!</p>
                        <button className="btn-primary" onClick={() => navigate('/instructor/add-course')}>
                            Create Course
                        </button>
                    </div>
                ) : (
                    courses.map(course => (
                        <div
                            key={course.id}
                            className="folder-card"
                            style={{ borderTop: `4px solid ${getStatusColor(course.status)}` }}
                            onClick={() => navigate(`/instructor/add-course?edit=${course.id}`, { state: { courseData: course } })}
                        >
                            <div className="card-actions">
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/instructor/add-course?edit=${course.id}`, { state: { courseData: course } }) }}
                                    className="btn-icon"
                                    title="Edit Course"
                                >
                                    <FaEdit size={14} className="text-primary" />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, course.id, course.status)}
                                    className="btn-icon delete"
                                    title="Delete Course"
                                    disabled={course.status === 'published'}
                                    style={{ opacity: course.status === 'published' ? 0.3 : 1, cursor: course.status === 'published' ? 'not-allowed' : 'pointer' }}
                                >
                                    <FaTrash size={14} className="text-danger" />
                                </button>
                            </div>

                            <div className="folder-icon-wrapper">
                                <FaFolder size={40} className="text-accent" style={{ opacity: 0.5 }} />
                            </div>

                            <div className="folder-content">
                                <div className="folder-header-row">
                                    <span className="category-badge">{course.category}</span>
                                    <span className={`status-badge ${course.status}`}>{course.status}</span>
                                </div>

                                <h4 className="folder-name">{course.title}</h4>

                                <div className="folder-footer-row">
                                    <span>{course.modules ? course.modules.length : 0} Modules</span>
                                    <span>{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseList;
