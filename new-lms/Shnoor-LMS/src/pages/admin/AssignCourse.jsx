import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaSearch, FaBook, FaUser, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import '../../styles/Dashboard.css';

const AssignCourse = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [searchStudent, setSearchStudent] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const usersRef = collection(db, "users");
                const qUsers = query(usersRef, where("role", "==", "student"));
                const querySnapshotUsers = await getDocs(qUsers);
                const studentsList = [];
                querySnapshotUsers.forEach((doc) => {
                    studentsList.push({ id: doc.id, name: doc.data().displayName || 'No Name', email: doc.data().email });
                });

                const coursesRef = collection(db, "courses");
                const qCourses = query(coursesRef, where("status", "==", "published"));
                const querySnapshotCourses = await getDocs(qCourses);
                const coursesList = [];
                querySnapshotCourses.forEach((doc) => {
                    coursesList.push({ id: doc.id, title: doc.data().title, instructor: doc.data().instructorName });
                });

                setStudents(studentsList);
                setCourses(coursesList);
                setLoading(false);

            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleStudent = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const toggleCourse = (id) => {
        setSelectedCourses(prev =>
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (selectedStudents.length === 0 || selectedCourses.length === 0) {
            alert("Please select at least one student and one course.");
            return;
        }

        try {
            const promises = selectedStudents.map(studentId => {
                const studentRef = doc(db, "users", studentId);
                return updateDoc(studentRef, {
                    enrolledCourses: arrayUnion(...selectedCourses)
                });
            });

            await Promise.all(promises);

            const studentNames = students.filter(s => selectedStudents.includes(s.id)).map(s => s.name).join(', ');
            const courseTitles = courses.filter(c => selectedCourses.includes(c.id)).map(c => c.title).join(', ');

            alert(`Successfully assigned courses:\n${courses.length} Course(s)\n\nTo students:\n${students.length} Student(s)`);

            setSelectedStudents([]);
            setSelectedCourses([]);

        } catch (error) {
            console.error("Error assigning course:", error);
            alert("Failed to assign course.");
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.email.toLowerCase().includes(searchStudent.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading assignment data...</div>;

    return (
        <div className="p-6">
            <div className="form-box full-width" style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
                <form onSubmit={handleAssign} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    <div className="selection-grid">

                        <div className="selection-col selection-col-header">
                            <h3>
                                <FaUser className="text-primary" /> Select Students
                                {selectedStudents.length > 0 && <span>{selectedStudents.length}</span>}
                            </h3>

                            <div className="search-bar-styled">
                                <div className="input-icon-wrapper" style={{ zIndex: 1 }}><FaSearch /></div>
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            <div className="selection-list">
                                {filteredStudents.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => toggleStudent(s.id)}
                                        className={`selection-item ${selectedStudents.includes(s.id) ? 'selected' : ''}`}
                                    >
                                        <div className="item-info">
                                            <div className="item-name">{s.name}</div>
                                            <div className="item-sub"><FaEnvelope size={10} /> {s.email}</div>
                                        </div>
                                        <div className="check-icon">
                                            <FaCheckCircle size={18} />
                                        </div>
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                        No students found matching "{searchStudent}"
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`selection-col ${selectedStudents.length === 0 ? 'disabled' : 'enabled'}`}>
                            <h3>
                                <FaBook className="text-secondary" /> Select Courses
                                {selectedCourses.length > 0 && <span className="badge-secondary">{selectedCourses.length}</span>}
                            </h3>

                            {selectedStudents.length === 0 && (
                                <div className="warning-box">
                                    <FaCheckCircle /> First, select at least one student.
                                </div>
                            )}

                            <div className="selection-list">
                                {courses.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => toggleCourse(c.id)}
                                        className={`selection-item ${selectedCourses.includes(c.id) ? 'selected' : ''}`}
                                    >
                                        <div className="item-icon-box">
                                            <FaBook size={18} />
                                        </div>
                                        <div className="item-info">
                                            <div className="item-name">{c.title}</div>
                                            <div className="item-sub">Instructor: {c.instructor}</div>
                                        </div>
                                        <div className="check-icon">
                                            <FaCheckCircle size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="sticky-footer">
                        <button type="submit" className="btn-primary" disabled={selectedStudents.length === 0 || selectedCourses.length === 0} style={{ padding: '12px 36px', fontSize: '1rem', opacity: (selectedStudents.length === 0 || selectedCourses.length === 0) ? 0.5 : 1 }}>
                            <FaCheckCircle className="mr-2" />
                            {selectedStudents.length > 0 && selectedCourses.length > 0
                                ? `Assign ${selectedCourses.length} Course${selectedCourses.length > 1 ? 's' : ''} to ${selectedStudents.length} Student${selectedStudents.length > 1 ? 's' : ''}`
                                : 'Confirm Assignment'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignCourse;
