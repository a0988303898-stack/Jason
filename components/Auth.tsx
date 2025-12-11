import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/storageService';
import Button from './Button';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState(''); // Serves as Email
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatFirebaseError = (err: any): string => {
    const msg = err.message || JSON.stringify(err);
    if (msg.includes('auth/invalid-api-key')) return 'System Error: Invalid Firebase API Key in configuration.';
    if (msg.includes('auth/email-already-in-use')) return 'This email is already registered.';
    if (msg.includes('auth/weak-password')) return 'Password should be at least 6 characters.';
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) return 'Invalid email or password.';
    if (msg.includes('auth/network-request-failed')) return 'Network error. Please check your connection.';
    // Clean up the raw Firebase error message like "Firebase: Error (auth/xyz)."
    return msg.replace('Firebase: ', '').replace('Error ', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await loginUser(username, password);
        // Success handled by App.tsx listener
        if (user) onLogin(user);
      } else {
        if (!username || !password || !name) {
          throw new Error('All fields are required');
        }
        const newUser: User = {
          id: '', // Will be assigned by Firebase
          username,
          passwordHash: password,
          name,
        };
        await registerUser(newUser);
        // If no error thrown, registration was successful
        // Auto login happens via auth listener in App.tsx
        setError('Registration successful! Logging you in...');
      }
    } catch (err: any) {
      console.error(err);
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
            W
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to WealthFlow' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'create a new account' : 'sign in to existing account'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="username" className="sr-only">Email Address</label>
              <input
                id="username"
                name="username"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Email Address"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className={`text-sm text-center p-2 rounded ${error.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {error}
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" isLoading={loading}>
              {isLogin ? 'Sign in' : 'Sign up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;