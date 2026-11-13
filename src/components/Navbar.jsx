import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout ,role} = useAuth();
    const navigate = useNavigate();

    const isAdminRoute = location.pathname.startsWith('/admin');

    const handleLogout = async () => {
    try {
        // 1. Backend hit hoga (/api/v1/auth/logout) -> Redis blacklist + Cookie clear
        await logout(); 
    } catch (error) {
        console.error("Logout API call failed:", error);
    } finally {
        // 2. Client-side cleanup chahe success ho ya failure, redirect login par hi hoga
        navigate('/login'); 
    }
};

    return (
        <nav style={styles.nav}>
            <h2 style={styles.logo} onClick={() => navigate('/quizzes')}>QuizPortal</h2>
            <div style={styles.links}>
                {user ? (
                    <>
                        <Link to="/quizzes" style={styles.link}>Quizzes</Link>
                        <Link to="/history" style={styles.link}>My History</Link>
                        <Link to="/leaderboard" style={styles.link}>Leaderboard</Link>
                        {(role === 'ADMIN' || role === 'ROLE_ADMIN') && !isAdminRoute && (
                            <Link to="/admin" style={styles.link}>
                                 Admin Panel
                            </Link>
                        )}
                         <Link to="/profile" style={styles.link}>👤 {user?.userResponse?.username}</Link>
                        
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.link}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        backgroundColor: '#1e293b',
        color: '#fff',
        width: '100%',
        boxSizing: 'border-box'
    },
    logo: {
        cursor: 'pointer',
        margin: 0,
        color: '#38bdf8',
        fontSize: '1.25rem'
    },
    links: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.85rem',
        alignItems: 'center',
        fontSize: '0.9rem'
    },
    link: {
        color: '#f8fafc',
        textDecoration: 'none',
        fontWeight: '500',
        whiteSpace: 'nowrap'
    },
    adminLink: {
        color: '#facc15',
        textDecoration: 'none',
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
    },
    user: {
        color: '#94a3b8',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap'
    },
    logoutBtn: {
        backgroundColor: '#ef4444',
        color: '#fff',
        border: 'none',
        padding: '0.35rem 0.75rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap'
    }
};

export default Navbar;