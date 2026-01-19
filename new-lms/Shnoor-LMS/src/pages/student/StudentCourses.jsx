import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookReader, FaSearch, FaGlobe, FaBookOpen } from 'react-icons/fa';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../auth/firebase';
import '../../styles/Dashboard.css';
import '../../styles/Student.css';
import '../../styles/StudentGrid.css';

const StudentCourses = () => {
    const navigate = useNavigate();
    const [allCourses, setAllCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('my-learning');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLevel, setSelectedLevel] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "courses"),
                    where("status", "==", "published")
                );
                const querySnapshot = await getDocs(q);
                const fetchedCourses = [];
                querySnapshot.forEach((doc) => {
                    fetchedCourses.push({ id: doc.id, ...doc.data() });
                });

                setAllCourses(fetchedCourses);

                if (auth.currentUser) {
                    const userRef = doc(db, "users", auth.currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setEnrolledIds(userSnap.data().enrolledCourses || []);
                    }
                }

            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEnroll = async (courseId) => {
        if (!auth.currentUser) return;
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                enrolledCourses: arrayUnion(courseId)
            });
            setEnrolledIds(prev => [...prev, courseId]);
            alert("Enrolled successfully!");
        } catch (error) {
            console.error("Error enrolling:", error);
            alert("Failed to enroll.");
        }
    };

    const getDisplayCourses = () => {
        let filtered = allCourses;

        if (activeTab === 'my-learning') {
            filtered = allCourses.filter(c => enrolledIds.includes(c.id));
        }

        if (searchTerm) {
            filtered = filtered.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(c => c.category === selectedCategory);
        }

        if (selectedLevel !== 'All') {
            filtered = filtered.filter(c => c.level === selectedLevel);
        }

        return filtered;
    };

    const displayCourses = getDisplayCourses();

    if (loading) return <div className="p-8">Loading course catalog...</div>;

    return (
        <div>
            <div className="student-page-header">
                <div>
                    <h3>{activeTab === 'my-learning' ? 'My Learning' : 'Course Catalog'}</h3>
                    <p className="text-gray-500 text-sm">
                        {activeTab === 'my-learning' ? 'Continue your progress.' : 'Find your next skill.'}
                    </p>
                </div>
                <div className="search-bar-container" style={{ display: 'none' }}>
                </div>
            </div>

            <div className="courses-filter-bar">
                <div className="filter-search-container">
                    <FaSearch className="filter-search-icon" />
                    <input
                        className="filter-search-input"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {[...new Set(allCourses.map(c => c.category).filter(Boolean))].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>

            <div className="tabs-container" style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px', display: 'flex', gap: '20px' }}>
                <button
                    className={`tab-btn ${activeTab === 'my-learning' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-learning')}
                    style={{
                        padding: '10px 15px',
                        color: activeTab === 'my-learning' ? 'var(--color-primary)' : '#6b7280',
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'my-learning' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    My Learning
                </button>
                <button
                    className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
                    onClick={() => setActiveTab('explore')}
                    style={{
                        padding: '10px 15px',
                        color: activeTab === 'explore' ? 'var(--color-primary)' : '#6b7280',
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'explore' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        cursor: 'pointer'
                    }}
                >
                    Explore
                </button>
            </div>

            {displayCourses.length === 0 ? (
                <div className="empty-state-card">
                    {activeTab === 'my-learning' ? (
                        <>
                            <FaBookOpen className="empty-state-icon" style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1.5rem', display: 'block', margin: '0 auto 1.5rem auto' }} />
                            <h3 className="empty-state-title">No Enrolled Courses</h3>
                            <p className="empty-state-text">You haven't enrolled in any courses yet.</p>
                            <button className="btn-primary mt-sm" onClick={() => setActiveTab('explore')}>
                                <FaGlobe style={{ marginRight: '8px' }} /> Browse Courses
                            </button>
                        </>
                    ) : (
                        <>
                            <FaSearch className="empty-state-icon" style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1.5rem', display: 'block', margin: '0 auto 1.5rem auto' }} />
                            <h3 className="empty-state-title">No Courses Found</h3>
                            <p className="empty-state-text">Try adjusting your search terms.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="student-course-grid">
                    {displayCourses.map((course, index) => {
                        const isEnrolled = enrolledIds.includes(course.id);
                        return (
                            <div key={course.id} className="student-course-card">
                                <div className={`course-thumbnail course-thumbnail-gradient-${index % 4}`} style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FaBookReader style={{ fontSize: '3.5rem', color: 'rgba(255,255,255,0.3)' }} />
                                </div>

                                <div className="course-details" style={{ padding: '15px' }}>
                                    <span className="category-badge" style={{ fontSize: '0.7rem', marginBottom: '5px' }}>{course.category}</span>
                                    <h4 className="course-title" style={{ fontSize: '1rem', marginBottom: '5px' }}>{course.title}</h4>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '15px' }}>
                                        By {course.instructorName || 'Instructor'}
                                    </div>

                                    <div style={{ marginTop: 'auto' }}>
                                        {isEnrolled ? (
                                            <button
                                                className="btn-primary w-100"
                                                onClick={() => navigate(`/student/course/${course.id}`)}
                                            >
                                                Continue
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-secondary w-100"
                                                onClick={() => handleEnroll(course.id)}
                                            >
                                                Enroll Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};

export default StudentCourses;
