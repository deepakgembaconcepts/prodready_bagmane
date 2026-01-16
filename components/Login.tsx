
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BagmaneLogo = () => (
    <div className="flex items-center space-x-2">
        <div className="flex flex-col">
            <span className="w-8 h-2 bg-yellow-400 rounded-full"></span>
            <span className="w-8 h-2 bg-blue-500 rounded-full mt-1.5"></span>
            <span className="w-8 h-2 bg-green-500 rounded-full mt-1.5"></span>
        </div>
    </div>
);

export const Login: React.FC = () => {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 z-10 animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <BagmaneLogo />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-wider">BAGMANE Login</h1>
                    <p className="text-slate-600 mt-2">Sign in to Asset Management Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                            placeholder="admin@bagmane.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-brand-primary text-white rounded-lg font-semibold shadow-lg hover:bg-brand-primary/90 focus:ring-4 focus:ring-brand-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                    <p>Default Password: <strong>Bagmane@123</strong></p>
                    <div className="mt-2 text-[10px] text-slate-400">
                        &copy; 2025 Gemba Concept Business Analytics Team
                    </div>
                </div>
            </div>
        </div>
    );
};
