import React, { useEffect, useState } from 'react';
import { getAllQuizzes, getLeaderboardByQuizId } from '../api/api';

const Leaderboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [board, setBoard] = useState([]);
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

    // 2. Jab bhi selectedQuizId change hoga, us quiz ka leaderboard fetch hoga
    useEffect(() => {
        if (selectedQuizId) {
            setLoading(true);
            getLeaderboardByQuizId(selectedQuizId)
                .then(res => {
                    setBoard(res.data || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching quiz leaderboard:", err);
                    setLoading(false);
                });
        }
    }, [selectedQuizId]);

    return (
        <div style={{ maxWidth: '750px', margin: '2rem auto', padding: '0 1rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🏆 Quiz Wise Leaderboard</h2>

            {/* Quiz Selector Dropdown */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>Select Quiz Topic:</label>
                <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    {quizzes.map(quiz => (
                        <option key={quiz.id} value={quiz.id}>
                            {quiz.title || quiz.name || `Quiz #${quiz.id}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table Rendering */}
            {loading ? (
                <h3 style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Leaderboard...</h3>
            ) : (
                <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th>Rank</th>
                            <th>User ID</th>
                            <th>User Name </th>
                            <th>Email</th>
                            <th>Score</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {board.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem' }}>
                                    Is quiz ke liye abhi koi leaderboard record nahi hai.
                                </td>
                            </tr>
                        ) : (
                            board.map((item, index) => {
                                const total = item.totalQuestions || 10;
                                const calculatedPercentage = ((item.score / total) * 100).toFixed(1);
                                const displayName = item.user?.username && item.user?.username.trim() !== "" 
                                    ? item.user?.username 
                                    : `User #${item.user?.userId}`;

                                return (
                                    <tr key={item.user?.id || index}>
                                        <td style={{ fontWeight: 'bold' }}>
                                            {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                                        </td>
                                        <td>User #{item.user?.id}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{displayName}</td>
                                        <td>{item.user?.email|| "N/A"}</td>
                                        <td>{item.score} / {total}</td>
                                        <td>{calculatedPercentage}%</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Leaderboard;