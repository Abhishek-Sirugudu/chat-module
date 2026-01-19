import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FaCog, FaExpand, FaPlay, FaSave, FaPaperPlane } from 'react-icons/fa';
import '../../styles/CodeEditor.css';

const CodeEditorPanel = ({ question, startCode, language, onLanguageChange, onCodeChange, onRun, onSubmit, isRunning, consoleOutput }) => {
    const [activeTab, setActiveTab] = useState('testcases');

    const handleEditorChange = (value) => {
        onCodeChange(value);
    };

    return (
        <div className="ce-panel-right">
            <div className="editor-header">
                <div className="lang-selector">
                    <span role="img" aria-label="code">💻</span>
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                        className="bg-transparent border-none text-sm font-semibold focus:outline-none cursor-pointer"
                        style={{ color: 'inherit' }}
                    >
                        <option value="javascript" style={{ color: '#000' }}>JavaScript</option>
                        <option value="python" style={{ color: '#000' }}>Python</option>
                        <option value="java" style={{ color: '#000' }}>Java</option>
                        <option value="cpp" style={{ color: '#000' }}>C++</option>
                        <option value="go" style={{ color: '#000' }}>Go</option>
                    </select>
                </div>
                <div className="editor-actions-top">
                    <button className="icon-btn" title="Settings"><FaCog /></button>
                    <button className="icon-btn" title="Fullscreen"><FaExpand /></button>
                </div>
            </div>

            <div className="monaco-wrapper">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    language={language || 'javascript'}
                    value={startCode}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                        fontFamily: "'Fira Code', 'Consolas', monospace"
                    }}
                />
            </div>

            <div className="bottom-panel">
                <div className="bp-tabs">
                    <div
                        className={`bp-tab ${activeTab === 'testcases' ? 'active' : ''}`}
                        onClick={() => setActiveTab('testcases')}
                    >
                        Test Cases
                    </div>
                    <div
                        className={`bp-tab ${activeTab === 'console' ? 'active' : ''}`}
                        onClick={() => setActiveTab('console')}
                    >
                        Console
                    </div>
                </div>

                <div className="bp-content custom-scrollbar">
                    {activeTab === 'testcases' && (
                        <div>
                            {(question.testCases || []).filter(tc => tc.isPublic).map((tc, idx) => (
                                <div key={idx} className="tc-item">
                                    <div className="tc-label">Input</div>
                                    <div className="tc-input-box mb-2">{tc.input}</div>
                                    <div className="tc-label">Expected Output</div>
                                    <div className="tc-input-box">{tc.output}</div>
                                </div>
                            ))}
                            {(question.testCases || []).filter(tc => tc.isPublic).length === 0 && (
                                <div className="text-gray-500">No public test cases.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'console' && (
                        <div className="console-output">
                            {consoleOutput.length === 0 && <div className="text-gray-500 italic">&gt; Run code to see logging output...</div>}
                            {consoleOutput.map((log, i) => (
                                <div key={i} className="console-log-item">
                                    <span className={log.type === 'error' ? 'console-log-icon-error' : 'console-log-icon-success'}>
                                        {log.type === 'error' ? '⨯' : '✓'}
                                    </span>
                                    <span className={log.type === 'error' ? 'console-log-msg-error' : 'console-log-msg-success'}>{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="ce-footer">
                <button className="btn-ce secondary"><FaSave /> Save</button>
                <button className="btn-ce run" onClick={onRun} disabled={isRunning}>
                    {isRunning ? 'Running...' : <><FaPlay size={12} /> Run</>}
                </button>
                <button className="btn-ce submit" onClick={onSubmit}><FaPaperPlane size={12} /> Submit</button>
            </div>
        </div>
    );
};

export default CodeEditorPanel;
