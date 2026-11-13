import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addQuestion, getQuestionsByQuiz, deleteQuestion } from '../api/api';

const ManageQuestion = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [q, setQ] = useState({ 
        questionText: '', 
        optionA: '', 
        optionB: '', 
        optionC: '', 
        optionD: '', 
        correctOption: '' 
    });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Purane Saare Questions Load Karein
    const loadQuestions = async () => {
        setLoading(true);
        try {
            const res = await getQuestionsByQuiz(quizId);
            setQuestions(res.data || []);
        } catch (err) {
            console.error("Error fetching questions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (quizId) {
            console.log("Fetching questions for quizId:", quizId);
            loadQuestions();
        }
    }, [quizId]);

    // 2. Naya Question Add Karein
    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addQuestion(quizId, q);
            alert('Question Added!');
            setQ({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: '' });
            await loadQuestions(); // List Refresh
        } catch (err) {
            console.error("Error adding question:", err);
            alert('Error adding question.');
        }
    };

    // 3. Question Delete / Hatane ka Handler
    const handleDelete = async (questionId) => {
        if (window.confirm("Do You Want To Delete This Question......?")) {
            try {
                await deleteQuestion(questionId);
                setQuestions(prev => prev.filter(item => item.id !== questionId));
                alert("Question Deleted Successfully!");
            } catch (err) {
                console.error("Error deleting question:", err);
                alert("Error deleting question.");
            }
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3>Add Question to Quiz #{quizId}</h3>

            {/* Form to Add New Questions */}
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <input 
                    type="text" 
                    placeholder="Question Title" 
                    value={q.questionText} 
                    onChange={(e) => setQ({ ...q, questionText: e.target.value })} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Option 1" 
                    value={q.optionA} 
                    onChange={(e) => setQ({ ...q, optionA: e.target.value })} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Option 2" 
                    value={q.optionB} 
                    onChange={(e) => setQ({ ...q, optionB: e.target.value })} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Option 3" 
                    value={q.optionC} 
                    onChange={(e) => setQ({ ...q, optionC: e.target.value })} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Option 4" 
                    value={q.optionD} 
                    onChange={(e) => setQ({ ...q, optionD: e.target.value })} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Correct Answer (Must match an option)" 
                    value={q.correctOption} 
                    onChange={(e) => setQ({ ...q, correctOption: e.target.value })} 
                    required 
                />
                <button type="submit" style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '0.6rem', cursor: 'pointer' }}>
                    Add More Questions
                </button>
            </form>

            <hr style={{ margin: '1.5rem 0' }} />

            {/* Purane Add Huye Questions Ki List Aur Delete Button */}
            <h4>Added Questions ({questions.length})</h4>
            {loading ? (
                <p>Loading questions...</p>
            ) : questions.length === 0 ? (
                <p style={{ color: '#64748b' }}>No questions added yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                    {questions.map((item, index) => (
                        <div key={item.id || index} style={{ padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>Q{index + 1}: {item.questionText || item.content}</p>
                                <span style={{ fontSize: '0.85rem', color: '#16a34a' }}>Correct: {item.correctOption}</span>
                            </div>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={() => navigate('/quizzes')} style={{ marginTop: '1.5rem', width: '100%', padding: '0.6rem', cursor: 'pointer' }}>
                Done / Go to Quizzes
            </button>
        </div>
    );
};

export default ManageQuestion;