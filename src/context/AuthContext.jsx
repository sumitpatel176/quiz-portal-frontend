import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setMemoryToken, logoutUser , BASE_URL} from '../api/api';


// 1. Context create kiya
const AuthContext = createContext(null);

// 2. AuthProvider Component
export const AuthProvider = ({ children }) => {
    // User basic details
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("quiz_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // User Role (USER / ADMIN)
    const [role, setRole] = useState(() => {
        return localStorage.getItem("userRole") || null;
    });

    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateAccessToken = (newToken) => {
        setAccessToken(newToken);
        setMemoryToken(newToken);
    };

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await axios.post(
                     `${BASE_URL}/api/v1/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken =response.data.accessToken;
                updateAccessToken(newAccessToken);

                const savedRole = response.data.role || localStorage.getItem("userRole");
                const savedUser = response.data.user || JSON.parse(localStorage.getItem("quiz_user"));

                if (!savedRole || !savedUser) {
                    throw new Error("Incomplete session data");
                }

                setRole(savedRole);
                setUser(savedUser);

            } catch (error) {
                updateAccessToken(null);
                setUser(null);
                setRole(null);
                localStorage.removeItem("quiz_user");
                localStorage.removeItem("userRole");
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);


   const login = (jwtToken, userData, userRole) => {
    updateAccessToken(jwtToken); // RAM mein token rakha

    localStorage.setItem("quiz_user", JSON.stringify(userData));
    localStorage.setItem("userRole", userRole);

    setUser(userData);
    setRole(userRole);
};

    // Logout Function: Saara authentication data clear karo
   const logout = async () => {
    try {
        await logoutUser(); // Backend Call: Redis Blacklist + Cookie Clear
    } catch (error) {
        console.error("Logout API failed:", error);
    } finally {
        updateAccessToken(null);
        setUser(null);
        setRole(null);

        localStorage.removeItem("quiz_user");
        localStorage.removeItem("userRole");
        localStorage.removeItem("authToken");
    }
};

    // Helper method to check if user is logged in
    const isAuthenticated = Boolean(accessToken && user && role);

    return (
        <AuthContext.Provider value={{ user, accessToken , loading, role, login, logout, isAuthenticated }}>
           {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <h3>Loading session...</h3>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

// 3. Custom Hook Export
export const useAuth = () => {
    return useContext(AuthContext);
};