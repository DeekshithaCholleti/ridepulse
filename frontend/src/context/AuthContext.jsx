import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem('token') || null);
	const [loading, setLoading] = useState(true);

	const fetchProfile = async (currentToken) => {
		try {
			const res = await fetch(`${API_URL}/auth/profile`, {
				headers: {
					'Authorization': `Bearer ${currentToken}`
				}
			});
			if (res.ok) {
				const data = await res.json();
				setUser(data.user);
			} else {
				logout();
			}
		} catch (error) {
			console.error('Error loading user profile:', error);
			logout();
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (token) {
			fetchProfile(token);
		} else {
			setLoading(false);
		}
	}, [token]);

	const login = async (email, password) => {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		const data = await res.json();
		if (!res.ok) {
			throw new Error(data.message || 'Login credentials invalid');
		}

		localStorage.setItem('token', data.token);
		setToken(data.token);
		setUser(data.user);
		return data.user;
	};

	const register = async (name, email, password, role = 'student') => {
		const res = await fetch(`${API_URL}/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email, password, role })
		});

		const data = await res.json();
		if (!res.ok) {
			throw new Error(data.message || 'Registration failed');
		}

		localStorage.setItem('token', data.token);
		setToken(data.token);
		setUser(data.user);
		return data.user;
	};

	const logout = () => {
		localStorage.removeItem('token');
		setToken(null);
		setUser(null);
	};

	const getHeaders = () => ({
		'Content-Type': 'application/json',
		'Authorization': token ? `Bearer ${token}` : ''
	});

	return (
		<AuthContext.Provider value={{ user, token, loading, login, register, logout, getHeaders, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
