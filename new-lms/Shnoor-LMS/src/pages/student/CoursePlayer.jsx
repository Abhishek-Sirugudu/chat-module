import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaArrowLeft, FaFilePdf, FaClock, FaPlay, FaLock, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../auth/firebase';
import { awardXP } from '../../utils/gamification';
import '../../styles/Dashboard.css';
import '../../styles/Student.css';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [currentModule, setCurrentModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completedModuleIds, setCompletedModuleIds] = useState([]);

    useEffect(() => {
        const fetchCourse = async () => {
            if (courseId.startsWith('mock')) {
                setTimeout(() => {
                    setCourse({
                        id: courseId,
                        title: 'Mock Course Demo',
                        modules: [
                            { id: 'm1', title: 'Welcome to the Course', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '5m' },
                            { id: 'm2', title: 'Chapter 1: Basics', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15m' },
                            { id: 'm3', title: 'Reading Material', type: 'pdf', url: '#', duration: '10m' }
                        ]
                    });
                    setCurrentModule({ id: 'm1', title: 'Welcome to the Course', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '5m' });
                    setLoading(false);
                }, 500);
                return;
            }

            try {
                const docRef = doc(db, "courses", courseId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const courseData = docSnap.data();
                    setCourse({ id: docSnap.id, ...courseData });
                    if (courseData.modules && courseData.modules.length > 0) {
                        setCurrentModule(courseData.modules[0]);
                    }
                } else {
                    console.error("No such course!");
                }
            } catch (error) {
                console.error("Error loading course:", error);
            } finally {
                setLoading(false);
            }
        };

        const storedProgress = JSON.parse(localStorage.getItem(`progress_${courseId}`)) || [];
        setCompletedModuleIds(storedProgress);

        fetchCourse();
    }, [courseId]);

    const handleMarkComplete = () => {
        if (!currentModule) return;

        if (!completedModuleIds.includes(currentModule.id)) {
            const newCompleted = [...completedModuleIds, currentModule.id];
            setCompletedModuleIds(newCompleted);
            setCompletedModuleIds(newCompleted);
            localStorage.setItem(`progress_${courseId}`, JSON.stringify(newCompleted));

            if (auth.currentUser) {
                awardXP(auth.currentUser.uid, 10, 'Completed Lesson');
            }

            alert("Module marked as completed! +10 XP 🎉");
        }
    };

    const isModuleCompleted = (id) => completedModuleIds.includes(id);

    const getProgress = () => {
        if (!course || !course.modules || course.modules.length === 0) return 0;
        return Math.round((completedModuleIds.length / course.modules.length) * 100);
    };

    if (loading) return <div className="p-8">Loading classroom...</div>;
    if (!course) return <div className="p-8">Course not found.</div>;

    const progressPercentage = getProgress();

    return (
        <div className="player-grid">
            <div className="player-main">
                <div className="mb-sm">
                    <button onClick={() => navigate('/student/courses')} className="btn-secondary back-button">
                        <FaArrowLeft /> Back to Courses
                    </button>
                </div>

                <div className="player-video-container">
                    {currentModule?.type === 'video' ? (
                        <>
                            {(currentModule.url.includes('firebasestorage') || currentModule.url.match(/\.(mp4|webm|ogg)$/)) ? (
                                <video
                                    controls
                                    width="100%"
                                    height="100%"
                                    style={{ position: 'absolute', top: 0, left: 0, background: '#000' }}
                                >
                                    <source src={currentModule.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={currentModule.url.includes('youtube') && !currentModule.url.includes('embed') ? currentModule.url.replace('watch?v=', 'embed/') : currentModule.url}
                                    title="Video Player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ position: 'absolute', top: 0, left: 0 }}
                                ></iframe>
                            )}
                        </>
                    ) : (
                        <div className="player-pdf-container">
                            <FaFilePdf size={50} style={{ marginBottom: '15px' }} />
                            <h3>Document Viewer</h3>
                            <p>{currentModule?.title}</p>
                            <a href={currentModule?.url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-sm">
                                Open Document
                            </a>
                        </div>
                    )}
                </div>

                <div className="mt-md" style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                    <div className="flex-between-center mb-sm">
                        <h2 className="module-title" style={{ fontSize: '1.4rem', margin: 0 }}>{currentModule?.title}</h2>
                        <button
                            onClick={handleMarkComplete}
                            className={isModuleCompleted(currentModule?.id) ? "btn-secondary" : "btn-primary"}
                            disabled={isModuleCompleted(currentModule?.id)}
                        >
                            {isModuleCompleted(currentModule?.id) ? <><FaCheckCircle /> Completed</> : "Mark as Complete"}
                        </button>
                    </div>

                    {(currentModule?.notes || currentModule?.pdfUrl) && (
                        <div className="module-resources mt-md" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#111827' }}>Lesson Resources</h4>

                            {currentModule.notes && (
                                <div className="module-notes mb-sm" style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    <strong>Notes:</strong><br />
                                    {currentModule.notes}
                                </div>
                            )}

                            {currentModule.pdfUrl && (
                                <div className="module-pdf">
                                    <a
                                        href={currentModule.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <FaFilePdf className="text-red-500" />
                                        View Attached Resource
                                        <FaExternalLinkAlt size={12} />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="player-sidebar">
                <div className="sidebar-header" style={{ background: '#f9fafb', color: '#374151', borderBottom: '1px solid #e5e7eb', padding: '15px' }}>
                    <h4 style={{ margin: 0 }}>Course Content</h4>
                </div>

                <div style={{ padding: '15px', borderBottom: '1px solid #e5e7eb' }}>
                    <div className="flex-between-center mb-sm">
                        <span className="text-secondary text-sm">{progressPercentage}% Completed</span>
                        {progressPercentage === 100 && <span className="text-success text-sm font-bold">Done!</span>}
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progressPercentage}%`, background: '#10b981' }}></div>
                    </div>
                </div>

                <div style={{ padding: '15px' }}>
                    <button
                        className="btn-primary w-100"
                        style={{ marginTop: '20px', background: '#E8AA25', border: 'none' }}
                        onClick={() => navigate(`/student/exam/final_${courseId}`)}
                    >
                        Complete Course & Take Exam
                    </button>
                    <div style={{ marginTop: '30px', overflowY: 'auto' }}>
                        {course.modules && course.modules.map((module, index) => {
                            const isActive = currentModule?.id === module.id;
                            const isCompleted = isModuleCompleted(module.id);

                            return (
                                <div
                                    key={module.id}
                                    onClick={() => setCurrentModule(module)}
                                    className={`module-list-item ${isActive ? 'active' : ''}`}
                                    style={{
                                        padding: '15px',
                                        borderBottom: '1px solid #f3f4f6',
                                        cursor: 'pointer',
                                        background: isActive ? '#f0f9ff' : 'white',
                                        borderLeft: isActive ? '4px solid var(--color-primary)' : '4px solid transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ minWidth: '20px' }}>
                                            {isCompleted ? (
                                                <FaCheckCircle color="#10b981" />
                                            ) : isActive ? (
                                                <FaPlay color="var(--color-primary)" size={12} />
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{index + 1}</span>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h5 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: isActive ? 'var(--color-primary)' : '#374151' }}>
                                                {module.title}
                                            </h5>
                                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: '#9ca3af' }}>
                                                <span>{module.type === 'video' ? 'Video' : 'File'}</span>
                                                {module.duration && <span>• {module.duration}m</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;