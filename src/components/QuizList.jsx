import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuizzes } from '../api/api';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await getAllQuizzes();
            setQuizzes(response.data);
        } catch (err) {
            console.error("Failed to fetch quizzes", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Quizzes...</div>;

    return (
        <div style={styles.container}>
            <h2>Available Quizzes</h2>
            <div style={styles.grid}>
                {quizzes.length === 0 ? (
                    <p>No quizzes available right now.</p>
                ) : (
                    quizzes.map((quiz) => (
                        <div key={quiz.id} style={styles.card}>
                            <h3>{quiz.title}</h3>
                            {quiz.description && <p style={styles.category}>Description: {quiz.description}</p>}
                            <button 
                                onClick={() => navigate(`/take-quiz/${quiz.id}`)} // Route matched
                                style={styles.button}
                            >
                                Start Quiz
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' },
    card: { padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    category: { color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0' },
    button: { marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

export default QuizList;