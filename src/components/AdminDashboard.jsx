import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1>Admin Portal</h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Select an action below to manage your quiz system.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fff' }}>
                    <h3>Manage Quizzes</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Create new quizzes, view existing list, or delete quizzes.</p>
                    <button 
                        onClick={() => navigate('/admin/manage-quiz')} 
                        style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                    >
                        Go to Quiz Manager
                    </button>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fff' }}>
                    <h3>View Students Results</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Navigate to the student results taking interface.</p>
                    <button 
                        onClick={() => navigate('/admin/results')} 
                        style={{ backgroundColor: 'rgb(187, 123, 34)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                    >
                        View Students Results
                    </button>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fff' }}>
                    <h3>User Portal</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Navigate to the student quiz taking interface.</p>
                    <button 
                        onClick={() => navigate('/quizzes')} 
                        style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                    >
                        View User Portal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;