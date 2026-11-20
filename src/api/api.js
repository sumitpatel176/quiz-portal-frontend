import axios from 'axios';
import React from 'react'

// In-Memory Token Variable (RAM storage for Access Token)
let memoryToken = null;


export const setMemoryToken = (token) => {
    memoryToken = token;
};

export const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_API_URL : "";


const API = axios.create({
    baseURL: BASE_URL,
    headers:{
        'Content-Type':'application/json'
    },
    withCredentials: true
});

  API.interceptors.request.use(
    (config) => {
        if (memoryToken) {
            config.headers['Authorization'] = `Bearer ${memoryToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR (Auto Retry & Refresh Queue)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Agar Request 401 ya 403 throw kare aur pehle retry na hui ho
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            
            if (isRefreshing) {
                // Agar Refresh pehle se chal raha hai, toh baki requests ko queue mein daal do
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return API(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Background Refresh Call
                
                const response = await axios.post(
                    `${BASE_URL}/api/v1/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                console.log("2. Refresh Successful! Naya Token:", response.data.accessToken);

                const newAccessToken = response.data.accessToken;

                // Memory State Update
                setMemoryToken(newAccessToken);

                // Queue mein phansi baaki saari requests ko naya token pass karo
                processQueue(null, newAccessToken);

                // Original failed request ko retry karo
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return API(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);

                // Refresh bhi fail ho gaya (Session Expired) -> Logout
                setMemoryToken(null);
                localStorage.removeItem("quiz_user");
                localStorage.removeItem("userRole");
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const registerUser = (userData)=>API.post('/api/v1/auth/register',userData);
export const loginUser = (credentials) => API.post('/api/v1/auth/login', credentials);
export const logoutUser = () => API.post('/api/v1/auth/logout');
export const getUserProfile = ()=>API.get('/api/user/me');

export const createQuiz = (quizData)=>API.post('/api/admin/quizzes/createquiz', quizData);
export const getAllQuizzes = ()=>API.get('/api/quizzes/all');
export const getQuizById = (id) => API.get(`/api/quizzes/${id}`);
export const deleteQuiz = (id)=> API.delete(`/api/admin/quizzes/deleteQuiz/${id}`);

export const addQuestion = (quizId,question)=>API.post(`/api/admin/questions/addQuestion/${quizId}` , question);
export const getQuestionsByQuiz = (quizId)=>API.get(`/api/questions/quiz/${quizId}`);
export const deleteQuestion = (questionId)=>API.delete(`/api/admin/questions/deleteQuestion/${questionId}`);


export const saveResult = (resultData)=>API.post(`/api/results/submit`,resultData);
export const getUserResults = ()=>API.get('/api/results/me');
export const getLeaderboardByQuizId = (quizId)=>API.get(`/api/results/leaderboard/${quizId}`);
export const getAllResults = (quizId) =>API.get(`/api/admin/results/all/${quizId}`);


export const logTabViolation = (attemptId) =>API.post(`/api/v1/attempts/${attemptId}/violation`);
export const startQuizAttempt = (userId,quizId) =>API.post(`/api/v1/attempts/start/${userId}/${quizId}`);
export const submitQuizAttempt = (attemptId,submitQuizRequest) =>API.post(`/api/v1/attempts/${attemptId}/submit`,submitQuizRequest);




