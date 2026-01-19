import React from 'react';
import '../../styles/CodeEditor.css';

const ProblemDescription = ({ question }) => {
    if (!question) return <div className="p-4 text-gray-400">Select a question...</div>;

    const difficultyClass = (question.difficulty || 'Medium').toLowerCase();

    return (
        <div className="pd-content custom-scrollbar">
            <div className="pd-header-section mb-6">
                <h2 className="pd-title">{question.title}</h2>
                <div className="pd-tags">
                    <span className={`pd-tag ${difficultyClass}`}>{question.difficulty || 'Medium'}</span>
                    <span className="pd-tag">{question.marks || 10} Points</span>
                </div>
            </div>

            <div className="pd-section">
                <div className="pd-section-title">Description</div>
                <div className="pd-text">{question.text}</div>
            </div>

            {question.inputFormat && (
                <div className="pd-section">
                    <div className="pd-section-title">Input Format</div>
                    <div className="pd-text">{question.inputFormat}</div>
                </div>
            )}

            {question.constraints && (
                <div className="pd-section">
                    <div className="pd-section-title">Constraints</div>
                    <div className="pd-text">{question.constraints}</div>
                </div>
            )}

            <div className="pd-section">
                <div className="pd-section-title">Examples</div>
                {(question.testCases || []).filter(tc => tc.isPublic).slice(0, 2).map((tc, idx) => (
                    <div key={idx} className="pd-example-card">
                        <div className="mb-2">
                            <span className="text-xs text-gray-500 font-bold uppercase">Input</span>
                            <div className="pd-code-block">{tc.input}</div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-bold uppercase">Output</span>
                            <div className="pd-code-block">{tc.output}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProblemDescription;
