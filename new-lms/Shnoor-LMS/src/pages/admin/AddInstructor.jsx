import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaUser, FaEnvelope, FaBook, FaPhone, FaInfoCircle } from 'react-icons/fa';
import '../../styles/Dashboard.css';

const AddInstructor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    fullName: '',
    email: '',
    subject: '',
    phone: '',
    bio: ''
  });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setTimeout(() => {
        alert(`Instructor "${data.fullName}" added.\n\nAction would normally create user: "${data.email}"`);
        navigate('/admin/dashboard');
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error("Error adding instructor:", error);
      alert("Failed to add instructor: " + error.message);
      setLoading(false);
    }
  };


  if (loading) return <div className="p-8">Adding instructor...</div>;

  return (
    <div className="p-6">
      <div className="form-box full-width">
        <div className="form-header-styled">
          <div className="icon-circle indigo">
            <FaChalkboardTeacher size={18} />
          </div>
          Instructor Details
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-300">

            <div className="form-group">
              <label>Full Name</label>
              <div className="input-group-styled">
                <div className="input-icon-wrapper"><FaUser /></div>
                <input name="fullName" value={data.fullName} onChange={handleChange} required placeholder="Dr. Smith" className="form-input-styled" />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-group-styled">
                <div className="input-icon-wrapper"><FaEnvelope /></div>
                <input name="email" type="email" value={data.email} onChange={handleChange} required placeholder="instructor@shnoor.com" className="form-input-styled" />
              </div>
            </div>

            <div className="form-group">
              <label>Subject / Specialization</label>
              <div className="input-group-styled">
                <div className="input-icon-wrapper"><FaBook /></div>
                <input name="subject" value={data.subject} onChange={handleChange} required placeholder="Mathematics, ReactJS..." className="form-input-styled" />
              </div>
            </div>

            <div className="form-group">
              <label>Phone (Optional)</label>
              <div className="input-group-styled">
                <div className="input-icon-wrapper"><FaPhone /></div>
                <input name="phone" value={data.phone} onChange={handleChange} placeholder="+1 234..." className="form-input-styled" />
              </div>
            </div>

          </div>

          <div className="form-group">
            <label>Bio (Optional)</label>
            <div className="input-group-styled">
              <div className="input-icon-wrapper top-align"><FaInfoCircle /></div>
              <textarea name="bio" value={data.bio} onChange={handleChange} rows="5" placeholder="Short biography..." className="form-input-styled" style={{ resize: 'vertical' }} />
            </div>
          </div>

          <div className="form-actions-styled">
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" style={{ paddingLeft: '30px', paddingRight: '30px' }}>Add Instructor</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInstructor;