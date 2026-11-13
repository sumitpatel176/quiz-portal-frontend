import React, { useEffect, useState } from 'react';
import { getAllResults, getAllQuizzes } from '../api/api';

const AdminUserResults = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Component load hone par saare Quizzes fetch karein
    useEffect(() => {
        getAllQuizzes()
            .then(res => {
                const quizList = res.data || [];
                setQuizzes(quizList);
                if (quizList.length > 0) {
                    setSelectedQuizId(quizList[0].id); // Default pehle quiz ko select kar dega
                }
            })
            .catch(err => console.error("Error fetching quizzes:", err));
    }, []);

    // 2. Jab bhi selectedQuizId change hoga, us quiz ke results fetch honge
    useEffect(() => {
        if (selectedQuizId) {
            setLoading(true);
            getAllResults(selectedQuizId)
                .then(res => {
                    setResults(res.data || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching quiz results:", err);
                    setLoading(false);
                });
        }
    }, [selectedQuizId]);

    return (        
        <div style={styles.container}>
            <h2 style={styles.heading}>All User Quiz Results (Admin View)</h2>

            {/* 🔽 Quiz Select Dropdown Section */}
            <div style={styles.dropdownContainer}>
                <label style={styles.label}>Select Quiz Topic:</label>
                <select 
                    style={styles.select}
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                >
                    {quizzes.length === 0 ? (
                        <option value="">No Quizzes Available</option>
                    ) : (
                        quizzes.map((quiz) => (
                            <option key={quiz.id} value={quiz.id}>
                                {quiz.title || quiz.quizTitle || quiz.name || `Quiz #${quiz.id}`}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {/* Table or Loading State */}
            {loading ? (
                <p style={styles.center}>Loading results...</p>
            ) : results.length === 0 ? (
                <p style={styles.center}>No results found for this quiz.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Result ID</th>
                            <th style={styles.th}>Username</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Quiz Title</th>
                            <th style={styles.th}>Score</th>
                            <th style={styles.th}>Completed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((res) => (
                            <tr key={res.id} style={styles.tr}>
                                <td style={styles.td}>#{res.id}</td>
                                <td style={styles.td}>
                                    <strong>{res.username || res.user?.username || 'N/A'}</strong>
                                </td>
                                <td style={styles.td}>
                                    <strong>{res.user?.email || 'N/A'}</strong>
                                </td>
                                <td style={styles.td}>{res.quizTitle || res.quiz?.title || 'General Quiz'}</td>
                                <td style={styles.td}>
                                    <span style={styles.scoreBadge}>{res.score} Marks</span>
                                </td>
                                <td style={styles.td}>
                                    {res.completedAt ? new Date(res.completedAt).toLocaleString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: '1000px', margin: '2rem auto', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    heading: { marginBottom: '1.5rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' },
    dropdownContainer: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' },
    label: { fontWeight: '600', color: '#334155', fontSize: '1rem' },
    select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', backgroundColor: '#f8fafc' },
    center: { textAlign: 'center', marginTop: '2rem', fontSize: '1.1rem', color: '#64748b' },
    error: { maxWidth: '600px', margin: '2rem auto', padding: '1rem', color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    thRow: { backgroundColor: '#f8fafc', textAlign: 'left' },
    th: { padding: '0.75rem 1rem', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' },
    tr: { borderBottom: '1px solid #f1f5f9' },
    td: { padding: '0.75rem 1rem', color: '#334155' },
    scoreBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '0.25rem 0.6rem', borderRadius: '12px', fontWeight: '600', fontSize: '0.875rem' }
};

export default AdminUserResults;