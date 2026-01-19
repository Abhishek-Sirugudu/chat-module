import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import { FaSearch, FaBan, FaCheckCircle, FaUserShield, FaUserGraduate, FaChalkboardTeacher, FaBuilding } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersRef = collection(db, "users");
            // Sorting by email as a proxy for 'recent' if createdAt isn't consistently available, 
            // otherwise use createdAt if you have it. 'email' is safe.
            const q = query(usersRef, orderBy("email"));
            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this user?`)) return;

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                accountStatus: newStatus
            });

            // Optimistic update
            setUsers(users.map(user =>
                user.id === userId ? { ...user, accountStatus: newStatus } : user
            ));
            alert(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully.`);
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("Failed to update status.");
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <FaUserShield className="text-primary" />;
            case 'instructor': return <FaChalkboardTeacher className="text-info" />;
            case 'company': return <FaBuilding className="text-warning" />;
            default: return <FaUserGraduate className="text-success" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return <span className="status-badge success">Active</span>;
            case 'suspended': return <span className="status-badge danger">Suspended</span>;
            case 'pending': return <span className="status-badge warning">Pending</span>;
            default: return <span className="status-badge secondary">{status || 'Unknown'}</span>;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) return <div className="p-8">Loading users...</div>;

    return (
        <div className="dashboard-content">
            <div className="flex-between-center mb-md">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <div className="flex-center-gap">
                    <div className="search-bar">
                        <FaSearch className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-select"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                    >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="instructor">Instructors</option>
                        <option value="company">Companies</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="flex-center-gap">
                                        <div className="avatar-circle sm">
                                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.displayName || 'No Name'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex-center-gap">
                                        {getRoleIcon(user.role)}
                                        <span className="capitalize">{user.role}</span>
                                    </div>
                                </td>
                                <td>{getStatusBadge(user.accountStatus)}</td>
                                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                                <td>
                                    {user.accountStatus === 'suspended' ? (
                                        <button
                                            className="btn-sm btn-success"
                                            onClick={() => handleStatusChange(user.id, 'active')}
                                            title="Activate User"
                                        >
                                            <FaCheckCircle /> Activate
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-sm btn-danger"
                                            onClick={() => handleStatusChange(user.id, 'suspended')}
                                            title="Suspend User"
                                            disabled={user.role === 'admin'}
                                        >
                                            <FaBan /> Suspend
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="text-center p-md text-gray-500">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
