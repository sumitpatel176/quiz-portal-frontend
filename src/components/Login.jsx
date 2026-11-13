import React, { useState, useEffect } from 'react';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';


const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const { login, accessToken, loading } = useAuth();
    const navigate = useNavigate();


    // Direct Login Check (Already logged in hai toh redirect karo)
    useEffect(() => {
        if (loading) return;
        const userRole = localStorage.getItem('userRole');

        if (accessToken) {
            if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/quizzes', { replace: true });
            }
        }
    }, [navigate , accessToken, loading]);


    const validateForm = () => {
        let newErrors = {};

        // 1. Email Check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!credentials.email.trim()) {
            newErrors.email = "Email is required!";
        } else if (!emailRegex.test(credentials.email)) {
            newErrors.email = "Please enter a valid email address!";
        }

        // 2. Password Check
        if (!credentials.password) {
            newErrors.password = "Password is required!";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            // 1. Backend JWT API Hit
            const res = await loginUser(credentials);

            // Backend Response Structure: { token: "eyJhbG...", role: "ROLE_USER", email: "..." }

            

            const jwtToken = res.data?.accessToken;
            const userRole = res.data.userResponse.role;

            if (!jwtToken) {
                setError("Token not received from server.");
                return;
            }

            // 2. Updated AuthContext me (token, userData, userRole) pass karein
            login(jwtToken, { email: credentials.email, ...res.data }, userRole);



            // 3. Role-Based Navigation
            if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/quizzes');
            }

        } catch (err) {
            console.error("Login Failed:", err);
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div style={styles.card}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
                
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} 
                    required 
                />
                {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
                
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} 
                    required 
                />
                {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
                
                <button type="submit" style={styles.btn}>Login</button>
            </form>
            <p style={{ marginTop: '1rem' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

const styles = {
    card: { 
        maxWidth: '380px', 
        margin: '3rem auto', 
        padding: '2rem', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        textAlign: 'center', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    },
    form: { 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem' 
    },
    btn: { 
        backgroundColor: '#2563eb', 
        color: '#fff', 
        border: 'none', 
        padding: '0.7rem', 
        borderRadius: '4px', 
        cursor: 'pointer' 
    }
};

export default Login;