import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLinkedin, FaGithub, FaSave, FaCamera } from 'react-icons/fa';
import { auth, db } from '../../auth/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../../styles/Dashboard.css';

const ProfileSettings = () => {
    const [userData, setUserData] = useState({
        displayName: '',
        email: '',
        bio: '',
        headline: '',
        linkedin: '',
        github: '',
        role: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;
            try {
                const docRef = doc(db, "users", auth.currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        displayName: data.displayName || auth.currentUser.displayName || '',
                        email: auth.currentUser.email || '',
                        role: data.role || 'User',
                        bio: data.bio || '',
                        headline: data.headline || '',
                        linkedin: data.linkedin || '',
                        github: data.github || ''
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!auth.currentUser) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                displayName: userData.displayName,
                bio: userData.bio,
                headline: userData.headline,
                linkedin: userData.linkedin,
                github: userData.github,
                updatedAt: new Date().toISOString()
            });
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Account Settings</h2>

            <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>

                {/* Left: Profile Card */}
                <div className="form-box" style={{ textAlign: 'center', height: 'fit-content' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 15px' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '2.5rem' }}>
                            {userData.displayName ? userData.displayName[0].toUpperCase() : <FaUser />}
                        </div>
                        <button style={{ position: 'absolute', bottom: 0, right: 0, background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaCamera size={14} />
                        </button>
                    </div>

                    <h3 style={{ margin: '0 0 5px 0' }}>{userData.displayName || 'User'}</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#6b7280', fontSize: '0.9rem' }}>{userData.headline || 'No headline set'}</p>

                    <span className={`status-badge ${userData.role === 'admin' ? 'published' : 'pending'}`} style={{ display: 'inline-block', marginBottom: '20px' }}>
                        {userData.role.toUpperCase()}
                    </span>

                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '15px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.9rem', color: '#4b5563' }}>
                            <FaEnvelope className="text-gray-400" /> {userData.email}
                        </div>
                    </div>
                </div>

                {/* Right: Edit Form */}
                <div className="form-box full-width">
                    <h3 className="section-title mb-md">Edit Profile</h3>

                    <div className="grid-2">
                        <div className="form-group full-width">
                            <label>Full Name</label>
                            <input
                                name="displayName"
                                value={userData.displayName}
                                onChange={handleChange}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Professional Headline</label>
                            <input
                                name="headline"
                                value={userData.headline}
                                onChange={handleChange}
                                placeholder="e.g. Senior Software Engineer"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Bio</label>
                            <textarea
                                name="bio"
                                rows="4"
                                value={userData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                    <h4 className="mt-md mb-sm" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>Social Links</h4>
                    <div className="grid-2">
                        <div className="form-group">
                            <label><FaLinkedin className="text-blue-600" /> LinkedIn URL</label>
                            <input
                                name="linkedin"
                                value={userData.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div className="form-group">
                            <label><FaGithub /> GitHub URL</label>
                            <input
                                name="github"
                                value={userData.github}
                                onChange={handleChange}
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>

                    <div className="mt-lg flex-end">
                        <button
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
