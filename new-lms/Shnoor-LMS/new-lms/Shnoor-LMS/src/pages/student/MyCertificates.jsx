import React, { useState, useEffect } from 'react';
import { FaTrophy, FaCertificate, FaDownload, FaPrint, FaArrowLeft } from 'react-icons/fa';
import { getStudentData } from '../../utils/studentData';
import '../../styles/Dashboard.css';
import '../../styles/Student.css';

const MyCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            setTimeout(() => {
                const data = getStudentData();
                setCurrentUser(data.currentUser);
                setCertificates(data.certificates || []);
                setLoading(false);
            }, 600);
        };
        fetchCertificates();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8">Loading achievements...</div>;

    if (selectedCert) {
        return (
            <div className="certificate-view-container">
                <div className="cert-print-hide flex-between-center mb-md" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                    <button onClick={() => setSelectedCert(null)} className="btn-secondary">
                        <FaArrowLeft /> Back to List
                    </button>
                    <button onClick={handlePrint} className="btn-primary">
                        <FaPrint /> Print / Save as PDF
                    </button>
                </div>

                <div className="cert-full-view" style={{
                    width: '900px',
                    height: '650px',
                    padding: '50px',
                    background: '#fff',
                    border: '15px solid #1e3a8a',
                    margin: '0 auto',
                    textAlign: 'center',
                    fontFamily: "'Playfair Display', serif",
                    color: '#1f2937',
                    position: 'relative',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3, zIndex: 0 }}></div>

                    <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        <FaCertificate size={60} style={{ color: '#fbbf24', marginBottom: '10px' }} />
                        <div style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '4px', color: '#6b7280', marginBottom: '5px' }}>
                            Certificate of Completion
                        </div>
                        <h1 style={{ fontSize: '3.5rem', color: '#1e3a8a', margin: '10px 0 20px 0', fontFamily: "'Pinyon Script', cursive" }}>
                            {selectedCert.courseName}
                        </h1>

                        <p style={{ fontSize: '1.4rem', color: '#4b5563', margin: '20px 0 10px 0', fontStyle: 'italic' }}>This certifies that</p>

                        <h2 style={{ fontSize: '2.5rem', borderBottom: '2px solid #ccc', paddingBottom: '10px', margin: '0 0 30px 0', minWidth: '500px', fontWeight: 'bold' }}>
                            {currentUser.name}
                        </h2>

                        <p style={{ fontSize: '1.3rem', color: '#4b5563', maxWidth: '700px', lineHeight: '1.6' }}>
                            Has demonstrated proficiency in the curriculum and successfully passed the required assessments with a score of <strong>{selectedCert.score}%</strong>.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', marginTop: 'auto', marginBottom: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.8rem', color: '#1e3a8a', marginBottom: '5px' }}>{selectedCert.instructor}</div>
                                <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '5px', width: '200px', margin: '0 auto', fontSize: '0.9rem', color: '#6b7280' }}>Lead Instructor</div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', marginBottom: '10px', marginTop: '10px' }}>{selectedCert.issueDate}</div>
                                <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '5px', width: '200px', margin: '0 auto', fontSize: '0.9rem', color: '#6b7280' }}>Date Issued</div>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '20px' }}>
                            Credential ID: {selectedCert.id.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="student-page-header">
                <div>
                    <h3>My Achievements</h3>
                    <p className="text-gray-500">Track your progress and earned credentials.</p>
                </div>
                <div className="status-badge pending flex-center-gap" style={{ fontSize: '1rem', padding: '8px 16px', background: '#e0f2fe', color: '#0369a1' }}>
                    <FaTrophy style={{ color: '#0284c7' }} /> {currentUser?.xp} XP Earned
                </div>
            </div>

            <h4 className="section-title">Verified Certificates</h4>

            {certificates.length === 0 ? (
                <div className="empty-state-card">
                    <FaCertificate className="empty-state-icon" style={{ color: '#cbd5e1', fontSize: '4rem', marginBottom: '1rem' }} />
                    <h3 className="empty-state-title">No Certificates Yet</h3>
                    <p className="empty-state-text">Complete courses and pass exams to earn official certificates.</p>
                </div>
            ) : (
                <div className="student-course-grid">
                    {certificates.map((cert, idx) => (
                        <div key={cert.id} className="student-course-card" onClick={() => setSelectedCert(cert)}>
                            <div className={`cert-preview-container course-thumbnail-gradient-${idx % 4}`} style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
                                <FaCertificate size={50} style={{ marginBottom: '10px', color: '#fbbf24' }} />
                                <div style={{ fontFamily: 'serif', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>CERTIFICATE</div>
                            </div>

                            <div className="course-details" style={{ padding: '20px' }}>
                                <h4 className="course-title" style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{cert.courseName}</h4>
                                <p className="text-secondary text-sm mb-md" style={{ marginBottom: '15px' }}>
                                    Issued: {cert.issueDate}
                                </p>

                                <button
                                    className="btn-primary w-100"
                                    onClick={(e) => { e.stopPropagation(); setSelectedCert(cert); }}
                                    style={{ marginTop: 'auto' }}
                                >
                                    <FaDownload /> View / Print
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCertificates;
