import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCode, FaCheckCircle, FaCircle, FaFilter } from 'react-icons/fa';
import { getStudentData } from '../../utils/studentData';
import '../../styles/Dashboard.css';
import '../../styles/Student.css';
import '../../styles/StudentGrid.css';

const PracticeArea = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        setTimeout(() => {
            const data = getStudentData();
            setChallenges(data.practiceChallenges || []);
            setLoading(false);
        }, 500);
    }, []);

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getDifficultyBg = (diff) => {
        switch (diff) {
            case 'Easy': return '#ecfdf5';
            case 'Medium': return '#fffbeb';
            case 'Hard': return '#fef2f2';
            default: return '#f3f4f6';
        }
    };

    const filteredChallenges = filter === 'All'
        ? challenges
        : challenges.filter(c => c.difficulty === filter);

    if (loading) return <div className="p-8">Loading challenges...</div>;

    return (
        <div>
            <div className="student-welcome flex-between-center">
                <div>
                    <h2>Practice Arena</h2>
                    <p>Sharpen your coding skills with these challenges.</p>
                </div>
                <div className="flex-center-gap">
                    <FaFilter className="text-secondary" />
                    <select
                        className="select-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderColor: '#e5e7eb', borderRadius: '6px' }}
                    >
                        <option value="All">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
            </div>

            <div className="student-course-grid">
                {filteredChallenges.map((challenge, index) => (
                    <div
                        key={challenge.id}
                        className="student-course-card"
                        onClick={() => navigate(`/student/practice/session/${challenge.id}`)}
                    >
                        <div className={`course-thumbnail course-thumbnail-gradient-${index % 4}`}>
                            <FaCode style={{ fontSize: '3.5rem', color: 'rgba(255,255,255,0.3)' }} />
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(255,255,255,0.9)',
                                    color: getDifficultyColor(challenge.difficulty),
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {challenge.difficulty}
                            </span>
                        </div>

                        <div className="course-details">
                            <h3 className="course-title">{challenge.title}</h3>
                            <p className="text-secondary text-sm line-clamp-2" style={{ marginBottom: '15px' }}>{challenge.text}</p>

                            <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f3f4f6' }}>
                                <div className="flex-between-center">
                                    <span className="text-sm text-secondary flex-center-gap">
                                        <FaCode /> {challenge.type === 'coding' ? 'Coding' : 'Quiz'}
                                        {challenge.status === 'Solved' && <FaCheckCircle className="text-success" style={{ marginLeft: '5px', color: '#10b981' }} />}
                                    </span>
                                    <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Solve</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredChallenges.length === 0 && (
                <div className="empty-state-card">
                    <FaCode className="empty-state-icon" />
                    <h3>No Challenges Found</h3>
                    <p className="empty-state-text">No challenges match your selected filter.</p>
                </div>
            )}
        </div>
    );
};

export default PracticeArea;
