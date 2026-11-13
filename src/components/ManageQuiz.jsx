import React, { useState, useEffect } from 'react';
import { createQuiz, getAllQuizzes, deleteQuiz } from '../api/api';
import { useNavigate } from 'react-router-dom';

const ManageQuiz = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. Existing Quizzes Load Karein (async/await)
    const loadQuizzes = async () => {
        setLoading(true);
        try {
            const res = await getAllQuizzes();
            setQuizzes(res.data || []);
        } catch (err) {
            console.error("Error fetching quizzes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuizzes();
    }, []);

    // 2. Naya Quiz Create 
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await createQuiz({ title, description });
            alert('Quiz Created! Now add questions.');
            setTitle('');
            setDescription('');
            await loadQuizzes();
            navigate(`/admin/manage-question/${res.data.id}`);
        } catch (err) {
            console.error("Error creating quiz:", err);
            alert('Failed to create quiz.');
        }
    };

    // 3. Quiz Delete 
    const handleDelete = async (quizId) => {
        if (window.confirm("Do You Want To Delete This Question......? All Of The Question Will Be Delete.")) {
            try {
                await deleteQuiz(quizId);
                setQuizzes(prev => prev.filter(item => item.id !== quizId));
                alert("Quiz deleted successfully!");
            } catch (err) {
                console.error("Error deleting quiz:", err);
                alert("Failed to delete quiz.");
            }
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h2 style={{ textAlign: 'center' }}>Create New Quiz</h2>
            
            {/* Create Quiz Form */}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                    type="text" 
                    placeholder="Quiz Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <input 
                    type="text" 
                    placeholder="Description (e.g. Java, Python)" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '0.7rem', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                    Proceed to Add Questions
                </button>
            </form>

            <hr style={{ margin: '2rem 0' }} />

            {/* Existing Quizzes List with Delete Functionality */}
            <h3>Manage Existing Quizzes ({quizzes.length})</h3>
            {loading ? (
                <p>Loading quizzes...</p>
            ) : quizzes.length === 0 ? (
                <p style={{ color: '#64748b' }}>No quizzes created yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    {quizzes.map((quiz) => (
                        <div 
                            key={quiz.id} 
                            style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}
                        >
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>{quiz.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{quiz.description}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                    onClick={() => navigate(`/admin/manage-question/${quiz.id}`)}
                                    style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Questions
                                </button>
                                <button 
                                    onClick={() => handleDelete(quiz.id)}
                                    style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageQuiz;