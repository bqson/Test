'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-traveller mb-6 text-center">Welcome Back</h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-foreground text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-traveller bg-background text-foreground"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-foreground text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-traveller bg-background text-foreground"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-traveller hover:bg-traveller/90 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-traveller hover:text-traveller/80 font-medium"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
};
