import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=' + encodeURIComponent(error.message));
          return;
        }

        if (session?.user) {
          // Successfully authenticated with Google
          login(session.user);

          // Redirect to home page
          navigate('/', { replace: true });
        } else {
          // No session found, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        navigate('/login?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleAuthCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
