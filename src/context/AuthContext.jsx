import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { authService } = await import('../services/api');
                    const response = await authService.getMe();
                    setUser(response.data.user);
                } catch (error) {
                    console.error("Failed to load user profile:", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [])

    const login = async (email, password) => {
        const { authService } = await import('../services/api');
        const response = await authService.login({ email, password });
        localStorage.setItem('token', response.data.session.access_token);
        setUser(response.data.user);
        return response.data;
    }

    const register = async (userData) => {
        const { authService } = await import('../services/api');
        const response = await authService.register(userData);
        localStorage.setItem('token', response.data.session.access_token);
        setUser(response.data.user);
        return response.data;
    }

    const logout = async () => {
        try {
            const { authService } = await import('../services/api');
            await authService.logout();
        } catch (error) {
            console.error("Error during server logout", error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    }

    const resetPassword = async (email) => {
        // Placeholder for future implementation
        return new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
