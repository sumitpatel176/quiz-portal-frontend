import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, getUserResults, startQuizAttempt, submitQuizAttempt, logTabViolation } from '../api/api';
import { useAuth } from '../context/AuthContext';

const MAX_ALLOWED_VIOLATIONS = 3;

const TakeQuiz = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [attemptId, setAttemptId] = useState(null);
    const [quizTitle, setQuizTitle] = useState("Untitled Quiz");
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [resultData, setResultData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [alreadyAttempted, setAlreadyAttempted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [timeLeft, setTimeLeft] = useState(0);
    const [violations, setViolations] = useState(0);
    const [warningMessage, setWarningMessage] = useState('');

    const isSubmittingRef = useRef(false);
    const hasInitializedRef = useRef(false);

    // 1. Submit Handler
    const handleSubmit = useCallback(async (isAutoSubmit = false) => {
        if (isSubmittingRef.current || !attemptId) return;
        isSubmittingRef.current = true;
        setSubmitting(true);

        const formattedResponses = Object.keys(answers).map(qId => ({
            questionId: parseInt(qId),
            selectedOption: answers[qId]
        }));

        try {
            const res = await submitQuizAttempt(attemptId, { responses: formattedResponses });
            const data = res.data?.data || res.data;

            // Submit hone par saved answers clear kar dein
            localStorage.removeItem(`quiz_answers_${id}`);
            setResultData(data);

            if (isAutoSubmit) {
                alert("Quiz auto-submitted due to violations or timer expiry!");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || "Result save nahi ho paya";
            alert(typeof errorMsg === 'string' ? errorMsg : "Result save nahi ho paya");
        } finally {
            setSubmitting(false);
            isSubmittingRef.current = false;
        }
    }, [attemptId, answers, id]);

    // 2. Initialize & Resume Session
    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        const checkAndFetchData = async () => {
            try {
                const currentUserId = user?.id || user?.userId || user?.userResponse?.id || 1;

                // History check
                const resultsRes = await getUserResults(currentUserId);
                const userResults = resultsRes.data?.data || resultsRes.data || [];
                const isTaken = userResults.some(r => (r.quizId || r.quiz_id) === parseInt(id));

                if (isTaken) {
                    setAlreadyAttempted(true);
                    setLoading(false);
                    return;
                }

                // Start or Resume Attempt
                const startRes = await startQuizAttempt(currentUserId, id);
                const attemptDto = startRes.data?.data || startRes.data;
                setAttemptId(attemptDto.attemptId || attemptDto.id);

                // Fetch Quiz & Questions
                const res = await getQuizById(id);
                const quizDetails = res.data?.data || res.data;

                setQuizTitle(quizDetails?.title || quizDetails?.quizTitle || ("Quiz #" + id));
                setQuestions(quizDetails?.questions || []);

                // Exact Remaining Time Calculate Karein
                const durationInMins = quizDetails?.durationInMinutes || 30;
                const maxAllowedSecs = durationInMins * 60;
                const startTimeMs = new Date(attemptDto.startTime).getTime();
                const durationMs = durationInMins * 60 * 1000;
                const remainingSecs = Math.min(
                    maxAllowedSecs,
                    Math.max(0, Math.floor((startTimeMs + durationMs - Date.now()) / 1000))
                );
                setTimeLeft(remainingSecs);

                // Saved Answers Restore Karein
                const savedAnswers = localStorage.getItem(`quiz_answers_${id}`);
                if (savedAnswers) {
                    setAnswers(JSON.parse(savedAnswers));
                }

                setLoading(false);
            } catch (err) {
                console.error("Error starting quiz session:", err);
                alert(err.response?.data?.message || "Could not start quiz attempt");
                setLoading(false);
            }
        };

        checkAndFetchData();
    }, [id, user]);

    // 3. Tab Switch Listener
    useEffect(() => {
        if (!attemptId || resultData) return;

        const handleVisibilityChange = async () => {
            if (document.hidden) {
                try {
                    const res = await logTabViolation(attemptId);
                    const count = res.data?.data ?? violations + 1;
                    setViolations(count);

                    if (count >= MAX_ALLOWED_VIOLATIONS) {
                        setWarningMessage("Max tab switch violations reached! Submitting exam automatically...");
                        handleSubmit(true);
                    } else {
                        setWarningMessage(`⚠️ WARNING: Tab switch detected! (Violation ${count}/${MAX_ALLOWED_VIOLATIONS})`);
                    }
                } catch (err) {
                    console.error("Violation log error:", err);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [attemptId, violations, resultData, handleSubmit]);

    // 4. Countdown Timer
    useEffect(() => {
        if (loading || resultData) return;

        if (timeLeft <= 0 && attemptId) {
            handleSubmit(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, timeLeft, attemptId, resultData, handleSubmit]);

    const handleOptionSelect = (option) => {
        const updated = { ...answers, [questions[currentIndex].id]: option };
        setAnswers(updated);
        localStorage.setItem(`quiz_answers_${id}`, JSON.stringify(updated));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (loading) return <h3 style={{ textAlign: 'center', marginTop: '3rem' }}>Checking & Initializing Quiz Session...</h3>;

    if (alreadyAttempted) {
        return (
            <div style={styles.resultCard}>
                <h2>⚠️ Quiz Already Attempted</h2>
                <p style={{ margin: '1rem 0', color: '#475569' }}>
                    Aap is quiz ko pehle hi de chuke hain. Ek quiz sirf ek hi baar attempt kiya ja sakta hai.
                </p>
                <button onClick={() => navigate('/history')} style={styles.btn}>View My History</button>
            </div>
        );
    }

    if (questions.length === 0) return <h3 style={{ textAlign: 'center', marginTop: '3rem' }}>No questions found for this quiz.</h3>;

    if (resultData !== null) {
        const total = resultData.totalQuestions || questions.length;
        const score = resultData.score || 0;
        const percentage = total > 0 ? ((score / total) * 100).toFixed(1) : 0;

        return (
            <div style={styles.resultCard}>
                <h2>Quiz Completed! 🎉</h2>
                <h3>Your Score: {score} / {total}</h3>
                <p>Percentage: {percentage}%</p>
                <button onClick={() => navigate('/quizzes')} style={styles.btn}>Back to Quizzes</button>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>Question {currentIndex + 1} of {questions.length}</span>
                <span style={{ fontWeight: 'bold', color: timeLeft < 60 ? '#dc2626' : '#2563eb' }}>
                    ⏱ Time Left: {formatTimer(timeLeft > 0 ? timeLeft : 0)}
                </span>
            </div>

            {warningMessage && (
                <div style={{ padding: '0.8rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', fontWeight: 'bold' }}>
                    {warningMessage}
                </div>
            )}

            <div style={styles.card}>
                <h3 style={{ marginTop: 0 }}>{currentQ.questionText}</h3>
                <div style={styles.options}>
                    {[currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD].filter(Boolean).map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleOptionSelect(opt)}
                            style={{
                                ...styles.optBtn,
                                backgroundColor: answers[currentQ.id] === opt ? '#3b82f6' : '#f1f5f9',
                                color: answers[currentQ.id] === opt ? '#fff' : '#0f172a'
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    style={styles.navBtn}
                >
                    Previous
                </button>
                {currentIndex === questions.length - 1 ? (
                    <button
                        disabled={submitting}
                        onClick={() => handleSubmit(false)}
                        style={{ ...styles.navBtn, backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold' }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        style={{ ...styles.navBtn, backgroundColor: '#2563eb', color: '#fff' }}
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '600px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' },
    card: { border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', backgroundColor: '#fff' },
    options: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' },
    optBtn: { padding: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' },
    resultCard: { maxWidth: '400px', margin: '3rem auto', textAlign: 'center', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' },
    btn: { padding: '0.6rem 1.2rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    navBtn: { padding: '0.6rem 1.2rem', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }
};

export default TakeQuiz;