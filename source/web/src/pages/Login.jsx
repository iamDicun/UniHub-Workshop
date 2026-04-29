import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('test@unihub.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data.data;
      localStorage.setItem('unihub_token', token);
      localStorage.setItem('unihub_user', JSON.stringify(user));
      
      alert(`Đăng nhập thành công! Xin chào ${user.name}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-50">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 md:p-12 shadow-sm border border-brand-200">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 mb-2">Welcome to UniHub</h1>
          <p className="text-brand-900/60 text-sm">Sign in to register for upcoming campus workshops.</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-brand-900">Email address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              required 
              className="w-full px-4 py-3 bg-brand-50/50 border border-brand-200 rounded-lg text-brand-900 placeholder:text-brand-900/40 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-brand-900">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
              className="w-full px-4 py-3 bg-brand-50/50 border border-brand-200 rounded-lg text-brand-900 placeholder:text-brand-900/40 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 bg-brand-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-out active:scale-[0.98]"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
