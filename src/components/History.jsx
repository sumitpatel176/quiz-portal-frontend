import React, { useEffect, useState } from 'react';
import { getUserResults } from '../api/api';
import { useAuth } from '../context/AuthContext';


const History = () => {
    const { isAuthenticated } = useAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            getUserResults()
                .then(res => {
                    setResults(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("History fetch error:", err);
                    setLoading(false);
                });
        }
    }, [isAuthenticated]);

    if (loading) {
        return <h3 style={{ textAlign: 'center', marginTop: '2rem' }}>Loading History...</h3>;
    }

    return (
        <div style={styles.container}>
            <h2>My Quiz History</h2>
            {results.length === 0 ? (
                <p>Koi purana quiz attempt nahi mila.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Quiz</th>
                            <th style={styles.th}>Score</th>
                            <th style={styles.th}>Percentage</th>
                            <th style={styles.th}>Quiz Title</th>
                            <th style={styles.th}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((r) => {
                            // On-the-fly Percentage Calculation
                            const total = r.totalQuestions || r.total_questions || 0;
                            const currentScore = r.score || 0;
                            const percentage = total > 0 ? ((currentScore / total) * 100).toFixed(1) : '0.0';

                            return (
                                <tr key={r.id} style={styles.tr}>
                                    <td style={styles.td}>{ `#${r.quizId || r.quiz_id}`}</td>
                                    <td style={styles.td}>{currentScore} / {total}</td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(percentage)}>
                                            {percentage}%
                                        </span>
                                    </td>
                                    <td style={styles.td}>{r.quizTitle || r.quiz_title}</td>
                                    <td style={styles.td}>
                                        {r.completedAt || r.completed_at ? new Date(r.completedAt || r.completed_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '2rem auto', padding: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    thRow: { backgroundColor: '#f1f5f9', textAlign: 'left' },
    th: { padding: '12px', borderBottom: '2px solid #cbd5e1' },
    tr: { borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px' },
    badge: (pct) => ({
        padding: '4px 8px',
        borderRadius: '4px',
        fontWeight: 'bold',
        backgroundColor: pct >= 50 ? '#dcfce7' : '#fee2e2',
        color: pct >= 50 ? '#15803d' : '#b91c1c'
    })
};

export default History;