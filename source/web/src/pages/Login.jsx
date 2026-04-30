import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';
import { getHomeForRole, getStoredUser, setSession } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('test@unihub.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      navigate(getHomeForRole(user.role), { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      const { token, user } = response.data;
      setSession(token, user);
      navigate(getHomeForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white/85 p-10 shadow-[0_30px_70px_-50px_rgba(15,76,92,0.6)] backdrop-blur border border-brand-200 animate-rise">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-900 mb-2">
            UniHub Workshop
          </h1>
          <p className="text-brand-900/60 text-sm">
            Đăng nhập để quản lý đăng ký và check-in.
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-brand-900">Email</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              required 
              className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-brand-900 placeholder:text-brand-900/40 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-brand-900">Mật khẩu</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
              className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-brand-900 placeholder:text-brand-900/40 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-2 rounded-2xl bg-brand-500 text-white font-semibold px-6 py-3 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-out active:scale-[0.98]"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
