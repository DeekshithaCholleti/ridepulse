import { Link, useNavigate } from 'react-router-dom';
import { Bus, UserPlus } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-purple-600 p-3 rounded-full text-white">
              <UserPlus size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Create Account</h2>
          <p className="text-center text-gray-600 mb-8">Join RidePulse and never miss a shuttle</p>
          
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Full Name</label>
              <input id="name" type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">University Email</label>
              <input id="email" type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" placeholder="student@university.edu" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
              <input id="password" type="password" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]">
              Sign Up
            </button>
          </form>
        </div>
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-sm text-gray-600">Already have an account? <Link to="/login" className="font-bold text-purple-600 hover:text-purple-500">Log in instead</Link></p>
        </div>
      </div>
    </div>
  );
}
