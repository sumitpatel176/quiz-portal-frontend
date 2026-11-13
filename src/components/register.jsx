import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER'
    });

    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Dynamic Error Cleanup
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        let newErrors = {};

        // 1. Username Validation
        if (!formData.username.trim()) {
            newErrors.username = "Username is required!";
        } else if (formData.username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters!";
        }

        // 2. Email Validation (Regex Check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required!";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address!";
        }

        // 3. Password Validation
        if (!formData.password) {
            newErrors.password = "Password is required!";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters!";
        }

        // 4. Confirm Password Matching
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password!";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match!";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // Register API Call
            await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            // Redirect to Login page after successful registration
            navigate('/login');
        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.response?.data?.message || err.response?.data || 'Registration failed. Try again!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>Create Account</h2>
                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Username Field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter username"
                            style={{
                                ...styles.input,
                                borderColor: errors.username ? '#dc2626' : '#ccc'
                            }}
                        />
                        {errors.username && <span style={styles.fieldError}>{errors.username}</span>}
                    </div>

                    {/* Email Field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            style={{
                                ...styles.input,
                                borderColor: errors.email ? '#dc2626' : '#ccc'
                            }}
                        />
                        {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
                    </div>

                    {/* Password Field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            style={{
                                ...styles.input,
                                borderColor: errors.password ? '#dc2626' : '#ccc'
                            }}
                        />
                        {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
                    </div>

                    {/* Confirm Password Field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter password"
                            style={{
                                ...styles.input,
                                borderColor: errors.confirmPassword ? '#dc2626' : '#ccc'
                            }}
                        />
                        {errors.confirmPassword && <span style={styles.fieldError}>{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem' },
    card: { width: '380px', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    label: { fontSize: '0.9rem', fontWeight: '500', color: '#374151' },
    input: { padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' },
    fieldError: { color: '#dc2626', fontSize: '0.78rem', marginTop: '0.1rem' },
    button: { padding: '0.7rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
    error: { padding: '0.5rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.9rem' }
};

export default Register;