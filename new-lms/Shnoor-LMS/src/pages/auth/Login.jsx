import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../auth/firebase';
import { FaEye, FaEyeSlash, FaSignInAlt, FaGoogle } from 'react-icons/fa';
import '../../styles/Auth.css';
import brandLogo from '../../assets/SHnoor_logo_1.jpg';
import markLogo from '../../assets/just_logo.jpeg';

const Login = () => {
  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    const saved = localStorage.getItem('rememberedEmail');
    return saved && saved !== 'admin@shnoor.com' ? saved : '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('rememberedEmail');
    return !!(saved && saved !== 'admin@shnoor.com');
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkRoleAndRedirect = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { role, accountStatus } = userData;

        if (accountStatus === 'pending' || accountStatus === 'rejected') {
          await auth.signOut();
          setError("Access Denied: Your account is pending Admin approval.");
          setLoading(false);
          return;
        }

        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'student' || role === 'learner') navigate('/student/dashboard');
        else if (role === 'instructor' || role === 'company') navigate('/instructor/dashboard');
        else navigate('/instructor/dashboard');
      } else {
        if (user.email.includes('admin')) navigate('/admin/dashboard');
        else navigate('/instructor/dashboard');
      }
    } catch (err) {
      console.error("Role check failed:", err);
      setError("Failed to retrieve user profile.");
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');

      await checkRoleAndRedirect(userCredential.user);
    } catch (err) {
      console.error(err);
      setError("Invalid Email or Password.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role: 'student',
          xp: 0,
          rank: 'Novice',
          streak: 0,
          createdAt: new Date().toISOString(),
          accountStatus: 'pending'
        });

        await auth.signOut();
        setError("Account created successfully. Your account is pending Admin approval.");
        setLoading(false);
        return;
      }

      await checkRoleAndRedirect(user);

    } catch (err) {
      console.error(err);
      setError("Google Sign-In Failed.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container flex bg-background-muted">
      <div className="auth-brand-section hidden md:flex">
        <div className="brand-content">
          <img src={brandLogo} alt="SHNOOR Logo" style={{ maxWidth: '150px', marginBottom: '20px', borderRadius: '10px', display: 'block', margin: '0 auto 20px auto' }} />
          <p className="brand-description">
            Empower your institution with a world-class Learning Management System.
            Streamline administration, enhance learning, and drive results.
          </p>
          <div className="brand-testimonial">
            <span className="quote-text">"SHNOOR has completely transformed how we manage our curriculum and student progress. A true game changer!"</span>
            <span className="quote-author">- Dr. Sarah Miller, Principal</span>
          </div>
        </div>
      </div>

      <div className="auth-form-section flex-1 flex items-center justify-center">
        <div className="login-card w-full max-w-md">
          <div className="login-header">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={markLogo}
                alt="SHNOOR International"
                style={{ width: '70px', height: '60px', borderRadius: '1px' }}
              />
              <div>
                <h1 className="brand-logo text-primary text-xl md:text-2xl font-semibold mb-1 tracking-tight leading-tight">
                  SHNOOR International
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium tracking-[0.18em] uppercase">
                  Learning Platform
                </p>
              </div>
            </div>
            <p className="brand-subtitle text-sm md:text-base mt-1">
              Sign in to your SHNOOR LMS account.
            </p>
          </div>

          {error && <div className="error-message"> {error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>Forgot Password?</Link>
              </div>
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <label htmlFor="rememberMe">Remember me on this device</label>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing In..." : <><FaSignInAlt /> Sign In</>}
            </button>

            <div className="divider"><span>OR CONTINUE WITH</span></div>

            <button type="button" className="login-btn google-btn" onClick={handleGoogleSignIn} disabled={loading}>
              <FaGoogle style={{ color: '#EA4335' }} /> Google
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up</Link></p>
            <p style={{ marginTop: '10px', fontSize: '0.8rem' }}>Welcome to SHNOOR LMS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;