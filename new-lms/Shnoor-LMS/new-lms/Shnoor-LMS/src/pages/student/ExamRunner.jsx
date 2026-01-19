import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaAngleLeft, FaAngleRight, FaTrophy, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { getStudentData, saveStudentData } from '../../utils/studentData';
import { awardXP } from '../../utils/gamification';
import { auth } from '../../auth/firebase';
import PracticeSession from './PracticeSession';
import '../../styles/Dashboard.css';
import '../../styles/Student.css';

const MOCK_EXAM_DATA = {
    id: 'exam_demo_001',
    title: 'React.js Certification Exam',
    duration: 45,
    passScore: 60,
    questions: [
        { id: 1, type: 'mcq', text: 'Which hook is used to perform side effects in functional components?', options: ['useState', 'useEffect', 'useReducer', 'useContext'], correctAnswer: 'useEffect', marks: 10 },
        { id: 2, type: 'mcq', text: 'What is the Virtual DOM?', options: ['A direct copy of the real DOM', 'A lightweight JavaScript representation of the DOM', 'A browser extension', 'None of the above'], correctAnswer: 'A lightweight JavaScript representation of the DOM', marks: 10 },
        { id: 3, type: 'mcq', text: 'How do you pass data to a child component?', options: ['State', 'Props', 'Redux', 'Context'], correctAnswer: 'Props', marks: 10 },
        { id: 4, type: 'mcq', text: 'Which method is used to update state in a class component?', options: ['updateState()', 'changeState()', 'setState()', 'forceUpdate()'], correctAnswer: 'setState()', marks: 10 },
        { id: 5, type: 'mcq', text: 'What is the default port for a React app created with CRA?', options: ['8080', '5000', '3000', '4200'], correctAnswer: '3000', marks: 10 }
    ]
};

const ExamRunner = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            const data = getStudentData();
            let foundExam = (data.exams || []).find(e => e.id === examId);

            if (examId && examId.startsWith('prac_')) {
                const challenge = (data.practiceChallenges || []).find(c => c.id === examId);
                if (challenge) {
                    foundExam = {
                        id: challenge.id,
                        title: challenge.title,
                        duration: 0,
                        passScore: 0,
                        questions: [challenge]
                    };
                }
            } else if (!foundExam && (examId === 'exam_001' || examId.includes('demo'))) {
                foundExam = MOCK_EXAM_DATA;
            }

            if (foundExam) {
                setExam(foundExam);
                if (foundExam.duration > 0) {
                    setTimeLeft(foundExam.duration * 60);
                }
            }
            setLoading(false);
        }, 500);
    }, [examId]);

    useEffect(() => {
        if (!exam || isSubmitted || timeLeft <= 0 || exam.duration === 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted, exam]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleAnswer = (val) => {
        setAnswers(prev => ({ ...prev, [currentQIndex]: val }));
    };

    const handleSubmit = async () => {
        try {
            console.log("Submitting exam...");
            let gainedPoints = 0;
            let totalPoints = 0;

            if (!exam || !exam.questions) {
                console.error("Exam data missing questions");
                return;
            }

            exam.questions.forEach((q, index) => {
                totalPoints += (q.marks || 0);
                if (q.type === 'mcq' && answers[index] === q.correctAnswer) {
                    gainedPoints += (q.marks || 0);
                } else if (q.type === 'coding') {
                    const userCode = answers[index];
                    // Simple validation: if code is longer than 20 chars, give marks (mock logic)
                    if (userCode && userCode.length > 20) {
                        gainedPoints += (q.marks || 0);
                    }
                }
            });

            console.log(`Points: ${gainedPoints}/${totalPoints}`);

            const percentage = totalPoints === 0 ? 100 : Math.round((gainedPoints / totalPoints) * 100);
            const passScore = exam.passScore || 0;
            const passed = percentage >= passScore;

            setResult({ percentage, passed });
            setIsSubmitted(true); // Switch UI immediately

            // Post-submission effects (can fail without blocking UI)
            try {
                if (passed) {
                    const data = getStudentData();
                    const existingCert = data.certificates?.find(c => c.courseName === exam.title);

                    if (!existingCert) {
                        const newCert = {
                            id: `cert_${Date.now()}`,
                            courseName: exam.title,
                            issueDate: new Date().toLocaleDateString(),
                            score: percentage,
                            instructor: 'Instructor Name'
                        };
                        saveStudentData({ ...data, certificates: [...(data.certificates || []), newCert] });
                    }

                    const passedExams = JSON.parse(localStorage.getItem('passedExams')) || [];
                    if (!passedExams.includes(exam.id)) {
                        passedExams.push(exam.id);
                        localStorage.setItem('passedExams', JSON.stringify(passedExams));
                    }

                    if (auth && auth.currentUser) {
                        await awardXP(auth.currentUser.uid, 50, 'Passed Exam');
                    }
                }
            } catch (postSubmitError) {
                console.error("Error saving progress:", postSubmitError);
            }

        } catch (error) {
            console.error("Error in handleSubmit:", error);
            alert("An error occurred while submitting. Please try again or check console.");
        }
    };

    if (loading) return <div className="p-8">Loading Assessment...</div>;
    if (!exam) return <div className="p-8">Exam not found.</div>;

    if (isSubmitted && result) {
        return (
            <div className="exam-runner-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="result-container" style={{ width: '100%', maxWidth: '600px' }}>
                    {result.passed ? (
                        <div className="result-pass">
                            <FaTrophy size={80} className="mb-md" style={{ color: '#E8AA25', display: 'block', margin: '0 auto 20px' }} />
                            <h2 className="mb-sm text-3xl font-bold">Excellent Work!</h2>
                            <p className="text-xl mb-md">You passed <strong>{exam.title}</strong></p>
                            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#16A34A', marginBottom: '20px' }}>
                                {result.percentage}%
                            </div>
                            <p className="mb-lg">Your certificate has been generated.</p>
                            <div className="flex-center-gap">
                                <button className="btn-secondary" onClick={() => navigate('/student/dashboard')}>Back to Home</button>
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate('/student/certificates')}
                                >
                                    View Certificate
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="result-fail">
                            <FaTimesCircle size={80} className="mb-md" style={{ display: 'block', margin: '0 auto 20px' }} />
                            <h2 className="mb-sm text-3xl font-bold">Assessment Failed</h2>
                            <p className="text-xl mb-md">You scored</p>
                            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '10px' }}>
                                {result.percentage}%
                            </div>
                            <p className="mb-lg" style={{ color: '#6b7280' }}>Required to pass: {exam.passScore}%</p>
                            <div className="flex-center-gap">
                                <button className="btn-secondary" onClick={() => navigate('/student/dashboard')}>Back to Home</button>
                                <button
                                    className="btn-primary"
                                    style={{ background: '#DC2626', border: 'none', color: '#ffffff' }}
                                    onClick={() => window.location.reload()}
                                >
                                    Retake Exam
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const currentQ = exam.questions[currentQIndex];
    const isPractice = exam.duration === 0;

    return (
        <div className="exam-runner-container">
            <div className="exam-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => { if (window.confirm("Quit exam? Progress will be lost.")) navigate(-1); }}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7 }}
                    >
                        <FaAngleLeft size={20} /> <span style={{ fontSize: '0.9rem', marginLeft: '5px' }}>Exit</span>
                    </button>
                    <h3 className="exam-header-title" style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{exam.title}</h3>
                </div>

                {!isPractice && (
                    <div className="flex-center-gap">
                        <span className={`exam-timer-text ${timeLeft < 300 ? 'urgent' : ''}`} style={{ background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', color: timeLeft < 300 ? '#fca5a5' : 'white', padding: '6px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 'bold', border: timeLeft < 300 ? '1px solid #ef4444' : '1px solid transparent' }}>
                            <FaClock /> {formatTime(timeLeft)}
                        </span>
                        <button className="btn-primary exam-btn-finish" onClick={handleSubmit} style={{ background: '#ef4444', border: 'none', marginLeft: '15px' }}>
                            Finish Test
                        </button>
                    </div>
                )}
            </div>

            <div className="exam-layout">
                <div className="exam-sidebar">
                    <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#64748b' }}>
                        Question {currentQIndex + 1} of {exam.questions.length}
                    </div>
                    <h4 className="mt-0 mb-md" style={{ fontSize: '1rem' }}>Overview</h4>
                    <div className="exam-question-grid">
                        {exam.questions.map((q, idx) => {
                            let statusClass = '';
                            if (idx === currentQIndex) statusClass = 'active';
                            else if (answers[idx]) statusClass = 'answered';

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQIndex(idx)}
                                    className={`exam-q-btn ${statusClass}`}
                                    title={`Question ${idx + 1}`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '30px', fontSize: '0.8rem', color: '#94a3b8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#1e293b', borderRadius: '2px' }}></div> Current
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#dcfce7', borderRadius: '2px', border: '1px solid #bbf7d0' }}></div> Answered
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '2px', border: '1px solid #cbd5e1' }}></div> Unvisited
                        </div>
                    </div>
                </div>

                <div className={`exam-content ${currentQ.type === 'coding' ? 'no-padding' : ''}`}>
                    {currentQ.type === 'coding' ? (
                        <div className="flex flex-col h-full">
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <PracticeSession
                                    question={currentQ}
                                    value={answers[currentQIndex]}
                                    onChange={(val) => handleAnswer(val)}
                                    onComplete={() => { }}
                                />
                            </div>
                            <div className="flex-between-center p-3 bg-[#2d2d2d] border-t border-[#333] text-white">
                                <button
                                    className="btn-ce secondary"
                                    disabled={currentQIndex === 0}
                                    onClick={() => setCurrentQIndex(prev => prev - 1)}
                                >
                                    <FaAngleLeft /> Previous
                                </button>
                                {currentQIndex < exam.questions.length - 1 ? (
                                    <button
                                        className="btn-ce run"
                                        onClick={() => setCurrentQIndex(prev => prev + 1)}
                                    >
                                        Next <FaAngleRight />
                                    </button>
                                ) : (
                                    <button className="btn-ce submit" onClick={handleSubmit}>
                                        Submit Test
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="exam-card">
                            <div className="exam-card-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-lg font-bold" style={{ color: '#334155' }}>Question {currentQIndex + 1}</span>
                                <span className="status-badge neutral">{currentQ.marks} Marks</span>
                            </div>

                            <div className="exam-card-text" style={{ flex: 1 }}>
                                <p className="exam-question-text" style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#1e293b', fontWeight: 500 }}>{currentQ.text}</p>
                            </div>

                            <div className="exam-options-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                                {currentQ.options.map((opt, i) => (
                                    <label
                                        key={i}
                                        className={`question-option ${answers[currentQIndex] === opt ? 'selected' : ''}`}
                                        style={{
                                            padding: '15px 20px',
                                            border: answers[currentQIndex] === opt ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            background: answers[currentQIndex] === opt ? '#eff6ff' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${currentQ.id}`}
                                            value={opt}
                                            checked={answers[currentQIndex] === opt}
                                            onChange={() => handleAnswer(opt)}
                                            className="option-radio"
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span style={{ fontSize: '1rem', color: answers[currentQIndex] === opt ? '#1e40af' : '#475569' }}>{opt}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="exam-footer" style={{ marginTop: 'auto', paddingTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                                <button
                                    className="btn-secondary"
                                    disabled={currentQIndex === 0}
                                    onClick={() => setCurrentQIndex(prev => prev - 1)}
                                    style={{ visibility: currentQIndex === 0 ? 'hidden' : 'visible' }}
                                >
                                    <FaAngleLeft /> Previous
                                </button>

                                {currentQIndex < exam.questions.length - 1 ? (
                                    <button
                                        className="btn-primary"
                                        onClick={() => setCurrentQIndex(prev => prev + 1)}
                                    >
                                        Next <FaAngleRight />
                                    </button>
                                ) : (
                                    <button className="btn-primary exam-btn-submit" onClick={handleSubmit}>
                                        Submit Test
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamRunner;