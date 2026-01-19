import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaCheckCircle, FaUserTie, FaClock, FaCalendarAlt, FaStar, FaGlobe, FaCertificate, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../auth/firebase';
import '../../styles/Dashboard.css';
import '../../styles/Student.css';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses')) || [];
            setIsEnrolled(enrolledCourses.includes(courseId));

            if (courseId.startsWith('mock')) {
                setTimeout(() => {
                    const mockData = {
                        id: courseId,
                        title: courseId === 'mock1' ? 'React Fundamentals' : 'Course Title',
                        description: 'This comprehensive course will take you from a beginner to an advanced practitioner. You will learn key concepts, best practices, and build real-world projects.',
                        category: 'Web Development',
                        level: 'Beginner',
                        rating: 4.8,
                        instructor: {
                            name: 'Sarah Johnson',
                            bio: 'Senior Software Engineer with 10+ years of experience in full-stack development. Passionate about teaching and mentorship.',
                            avatar: null
                        },
                        modules: [
                            { id: 'm1', title: 'Welcome to the Course', duration: '5m', type: 'video' },
                            { id: 'm2', title: 'Chapter 1: Introduction', duration: '15m', type: 'video' },
                            { id: 'm3', title: 'Chapter 1: Quiz', duration: '10m', type: 'quiz' },
                            { id: 'm4', title: 'Chapter 2: Key Concepts', duration: '20m', type: 'video' },
                            { id: 'm5', title: 'Final Project Brief', duration: '5m', type: 'pdf' }
                        ],
                        updatedAt: '2025-12-15'
                    };
                    setCourse(mockData);
                    setLoading(false);
                }, 500);
                return;
            }

            try {
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCourse({
                        id: docSnap.id,
                        ...data,
                        instructor: {
                            name: data.instructorName || 'Instructor',
                            bio: 'Experienced industry professional.',
                            avatar: null
                        }
                    });
                } else {
                    console.error("No such course!");
                }
            } catch (error) {
                console.error("Error loading course:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handleEnroll = () => {
        const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses')) || [];
        if (!enrolledCourses.includes(courseId)) {
            const newEnrolled = [...enrolledCourses, courseId];
            localStorage.setItem('enrolledCourses', JSON.stringify(newEnrolled));
            setIsEnrolled(true);
            alert("Successfully enrolled! Welcome aboard. 🚀");
        }
    };

    const handleContinue = () => {
        navigate(`/student/course/${courseId}/learn`);
    };

    if (loading) return <div className="p-8">Loading course details...</div>;
    if (!course) return <div className="p-8">Course not found.</div>;

    return (
        <div className="course-detail-page">
            <button onClick={() => navigate('/student/courses')} className="btn-text" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaArrowLeft /> Back to Courses
            </button>

            <div className="course-hero">
                <div className="course-hero-content">
                    <span className="badge badge-primary">{course.category || 'General'}</span>
                    <h1 className="course-hero-title">{course.title}</h1>
                    <p className="course-hero-desc">{course.description || 'No description available.'}</p>

                    <div className="course-meta-row">
                        <div className="meta-item">
                            <FaGlobe /> {course.level || 'All Levels'}
                        </div>
                        <div className="meta-item">
                            <FaStar className="text-yellow-400" /> {course.rating || '4.5'} (120 reviews)
                        </div>
                        <div className="meta-item">
                            <FaCalendarAlt /> Last updated {course.updatedAt || 'Recently'}
                        </div>
                    </div>

                    <div className="course-instructor-preview">
                        <div className="instructor-avatar-placeholder">
                            <FaUserTie />
                        </div>
                        <div>
                            <div className="text-sm text-gray-300">Created by</div>
                            <div className="font-semibold">{course.instructor?.name}</div>
                        </div>
                    </div>
                </div>

                <div className="course-action-card">
                    <div className="card-video-preview">
                        <FaPlay className="play-icon" />
                    </div>
                    <div className="card-body">
                        <div className="price-tag">Free</div>

                        {isEnrolled ? (
                            <button className="btn-primary w-100" onClick={handleContinue}>
                                Continue Learning
                            </button>
                        ) : (
                            <button className="btn-primary w-100" onClick={handleEnroll}>
                                Enroll Now
                            </button>
                        )}

                        <p className="guarantee-text">Full Lifetime Access</p>

                        <div className="course-features-list">
                            <div className="feature-item"><FaClock /> {course.modules?.length * 15 || 60} mins on-demand video</div>
                            <div className="feature-item"><FaCheckCircle /> Access on mobile and TV</div>
                            <div className="feature-item"><FaCertificate /> Certificate of completion</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="course-content-container">
                <div className="content-section">
                    <h3 className="section-title">What you'll learn</h3>
                    <div className="learning-outcomes">
                        <div className="outcome-item"><FaCheck /> Master the core concepts of {course.title}</div>
                        <div className="outcome-item"><FaCheck /> Build real-world projects</div>
                        <div className="outcome-item"><FaCheck /> Understand industry best practices</div>
                        <div className="outcome-item"><FaCheck /> Become job-ready</div>
                    </div>
                </div>

                <div className="content-section">
                    <h3 className="section-title">Course Content</h3>
                    <div className="modules-list-static">
                        {course.modules?.map((module, idx) => (
                            <div key={idx} className="static-module-item">
                                <div className="static-module-icon">
                                    {module.type === 'video' ? <FaPlay size={12} /> : <FaCheckCircle size={12} />}
                                </div>
                                <div className="static-module-info">
                                    <div className="module-name">{module.title}</div>
                                    <div className="module-meta">{module.type} • {module.duration}</div>
                                </div>
                                {isEnrolled && idx === 0 && <span className="badge badge-success">Started</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="content-section">
                    <h3 className="section-title">Instructor</h3>
                    <div className="instructor-full-card">
                        <div className="instructor-header">
                            <div className="instructor-avatar-large">
                                <FaUserTie size={30} />
                            </div>
                            <div>
                                <h4 className="instructor-name">{course.instructor?.name}</h4>
                                <p className="instructor-title">Senior Instructor</p>
                            </div>
                        </div>
                        <p className="instructor-bio">
                            {course.instructor?.bio}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
