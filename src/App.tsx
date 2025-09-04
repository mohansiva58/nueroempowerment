import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { SpeechSettingsProvider } from './contexts/SpeechSettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Games from './pages/Games';
import Daily from './pages/Daily';
import Community from './pages/Community';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import CourseDetail from './CourseDetail';
import Blog from './pages/Blog';
import { AuthProvider } from './pages/AuthContext';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import About from './pages/About';
import Articles from './pages/Articles';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';

// Create a component to conditionally render login popup
function ConditionalLoginPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  
  // Don't show login popup on the login page
  if (location.pathname === '/login') {
    return null;
  }
  
  return <Login isOpen={isOpen} onClose={onClose} />;
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    // Show login popup after 1 minute, only once per session
    const hasShownPopup = sessionStorage.getItem('loginPopupShown');
    
    if (!hasShownPopup) {
      const timer = setTimeout(() => {
        setIsLoginOpen(true);
        sessionStorage.setItem('loginPopupShown', 'true');
      }, 60000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <LanguageProvider>
      <SpeechSettingsProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-neutral-50">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/learning" element={<Learning />} />
                  <Route path="/coursedetail" element={<CourseDetail />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/daily" element={<Daily />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/assessment" element={<Assessment />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="/login" element={<Login isOpen={true} onClose={() => setIsLoginOpen(false)} />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/articles" element={<Articles />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              
              {/* Conditional Login Popup */}
              <ConditionalLoginPopup 
                isOpen={isLoginOpen} 
                onClose={() => setIsLoginOpen(false)} 
              />
            </div>
          </Router>
        </AuthProvider>
      </SpeechSettingsProvider>
    </LanguageProvider>
  );
}

export default App;