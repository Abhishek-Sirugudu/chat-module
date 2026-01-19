import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import { FaCheckCircle, FaTimesCircle, FaUserClock } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const ApproveUsers = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const q = query(
                collection(db, "users"),
                where("accountStatus", "==", "pending")
            );

            const querySnapshot = await getDocs(q);
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });

            users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setPendingUsers(users);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pending users:", error);
            setLoading(false);
        }
    };

    const handleAction = async (userId, action, userName) => {
        const confirmMessage = action === 'active'
            ? `Approve access for ${userName}?`
            : `Reject access for ${userName}?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                accountStatus: action === 'active' ? 'active' : 'rejected'
            });

            setPendingUsers(prev => prev.filter(user => user.id !== userId));
            alert(`User ${action === 'active' ? 'Approved' : 'Rejected'} successfully.`);

        } catch (error) {
            console.error(`Error ${action} user:`, error);
            alert("Failed to update user status.");
        }
    };

    if (loading) return <div className="p-8">Loading pending requests...</div>;

    return (
        <div className="p-6">
            <div className="approval-header">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaUserClock /> User Approval Queue
                    </h2>
                    <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Review and manage new account requests.</p>
                </div>
                {pendingUsers.length > 0 && (
                    <div className="pending-badge">
                        {pendingUsers.length} Pending
                    </div>
                )}
            </div>

            <div className="table-container table-scroll-container">
                <table style={{ width: '100%' }}>
                    <thead className="sticky-thead">
                        <tr>
                            <th>Applicant</th>
                            <th>Role Requested</th>
                            <th>Date Registered</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <FaCheckCircle size={40} style={{ opacity: 0.2 }} />
                                        <span>No pending user requests.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            pendingUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, color: '#1f2937' }}>{user.name || 'Unknown Name'}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{user.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${user.role === 'admin' ? 'admin' : user.role === 'instructor' ? 'instructor' : 'student'}`}
                                            style={{
                                                background: user.role === 'instructor' ? '#e0e7ff' : '#dcfce7',
                                                color: user.role === 'instructor' ? '#4338ca' : '#166534',
                                                textTransform: 'capitalize'
                                            }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.9rem' }}>
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                            <button
                                                onClick={() => handleAction(user.id, 'rejected', user.name)}
                                                className="btn-icon delete"
                                                title="Reject"
                                                style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <FaTimesCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(user.id, 'active', user.name)}
                                                className="btn-icon"
                                                title="Approve"
                                                style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '8px', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <FaCheckCircle size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApproveUsers;
