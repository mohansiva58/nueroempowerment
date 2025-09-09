import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, BookOpen, Gamepad2, Calendar, Users, Brain, Settings, FileText, MessageSquare, User, LogOut, Volume2, VolumeX } from 'lucide-react';
import { SpeechText } from '../components/speach';
import { FormattedMessage } from 'react-intl';
import { useLanguage } from '../contexts/LanguageContext';
import { useSpeechSettings } from '../contexts/SpeechSettingsContext';
import { useAuth } from '../pages/AuthContext';
import Login from '../pages/Login';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState<'login' | 'logout' | null>(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { isSpeechEnabled, toggleSpeech } = useSpeechSettings();

  const navigation = [
    { nameKey: "navbar.home", href: '/', icon: Home },
    { nameKey: "navbar.learning", href: '/learning', icon: BookOpen },
    { nameKey: "navbar.games", href: '/games', icon: Gamepad2 },
    { nameKey: "navbar.daily", href: '/daily', icon: Calendar },
    { nameKey: "navbar.community", href: '/community', icon: Users },
    { nameKey: "navbar.assessment", href: '/assessment', icon: Brain },
  ];

  const profileMenu = [
    { nameKey: "navbar.settings", href: '/settings', icon: Settings },
    { nameKey: "navbar.blog", href: '/blog', icon: FileText },
    { nameKey: "navbar.articles", href: '/articles', icon: MessageSquare },
    { nameKey: "navbar.about", href: '/about', icon: FileText },
    { nameKey: "navbar.logout", href: '#', icon: LogOut, onClick: () => handleLogout(), hide: !user },
  ];

  const handleLogout = () => {
    logout();
    setShowSuccess('logout');
    setIsProfileOpen(false);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const getUserInitials = () => {
    if (user && user.displayName) {
      const nameParts = user.displayName.split(' ');
      return nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : nameParts[0][0];
    }
    return '';
  };

  useEffect(() => {
    if (user) {
      console.log('User Data:', {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    }
  }, [user]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <>
      <nav className="bg-black text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Title and Mobile Language Selector */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2">
                <Brain className="h-8 w-8" />
                <SpeechText>
                  <span className="font-bold text-xl">
                    <FormattedMessage id="navbar.title" defaultMessage="NeuroHub" />
                  </span>
                </SpeechText>
              </Link>
              
              {/* Mobile Language Selector - beside title */}
              <div className="md:hidden flex items-center space-x-2">
                <select
                  value={currentLanguage}
                  onChange={e => {
                    changeLanguage(e.target.value);
                    localStorage.setItem('lang', e.target.value);
                    }}
                    className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="Language"
                  >
                  <option value="en">EN</option>
                  <option value="te">TE</option>
                  <option value="hi">HI</option>
                </select>
                
                {/* Mobile Speech Toggle Button */}
                <button
                  onClick={toggleSpeech}
                  className={`p-1.5 rounded-md transition-colors ${
                    isSpeechEnabled 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                  }`}
                  title={isSpeechEnabled ? 'Disable Speech' : 'Enable Speech'}
                  aria-label={isSpeechEnabled ? 'Disable Speech' : 'Enable Speech'}
                >
                  {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4 items-center">
              {navigation.map((item) => {
                const Icon = item.icon;
                // If Daily and user is not logged in, open login modal instead of navigating
                if (item.href === '/daily' && !user) {
                  return (
                    <button
                      key={item.nameKey}
                      onClick={() => handleLoginClick()}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === item.href ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <SpeechText>
                        <span>
                          <FormattedMessage id={item.nameKey} defaultMessage={item.nameKey.split('.')[1]} />
                        </span>
                      </SpeechText>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.nameKey}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.href ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <SpeechText>
                      <span>
                        <FormattedMessage id={item.nameKey} defaultMessage={item.nameKey.split('.')[1]} />
                      </span>
                    </SpeechText>
                  </Link>
                );
              })}
              {/* Language Switcher Dropdown (Desktop) */}
              <select
                value={currentLanguage}
                onChange={e => {
                  changeLanguage(e.target.value);
                  localStorage.setItem('lang', e.target.value);
                }}
                className="bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 mx-2"
                aria-label="Language"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिंदी</option>
              </select>

              {/* Speech Toggle Button */}
              <button
                onClick={toggleSpeech}
                className={`p-2 rounded-md transition-colors ${
                  isSpeechEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
                title={isSpeechEnabled ? 'Disable Speech' : 'Enable Speech'}
                aria-label={isSpeechEnabled ? 'Disable Speech' : 'Enable Speech'}
              >
                {isSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="User Profile"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={`${user.displayName || 'User'}'s Profile`}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          console.error('Image failed to load:', user.photoURL);
                          e.currentTarget.style.display = 'none';
                          const nextSibling = e.currentTarget.nextSibling as HTMLElement | null;
                          if (nextSibling) nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-700 rounded-full">
                        <SpeechText>
                          <span className="text-sm font-semibold">{getUserInitials()}</span>
                        </SpeechText>
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="Login"
                  >
                    <User className="h-5 w-5" />
                  </button>
                )}
                {isProfileOpen && user && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 transform origin-top-right transition-all duration-200 ease-in-out z-50">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <SpeechText>
                        <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                      </SpeechText>
                      <SpeechText>
                        <p className="text-xs text-gray-300 truncate">{user.email}</p>
                      </SpeechText>
                    </div>
                    <div className="py-1">
                      {profileMenu.map((item) => {
                        if (item.hide) return null;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.nameKey}
                            to={item.href}
                            onClick={item.onClick || (() => setIsProfileOpen(false))}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                          >
                            <Icon className="h-4 w-4 text-gray-300" />
                            <SpeechText>
                              <span>
                                <FormattedMessage id={item.nameKey} defaultMessage={item.nameKey.split('.')[1]} />
                              </span>
                            </SpeechText>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-md p-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                // Mobile: if Daily and user not logged in, open login modal instead of navigating
                if (item.href === '/daily' && !user) {
                  return (
                    <button
                      key={item.nameKey}
                      onClick={() => { setIsOpen(false); handleLoginClick(); }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                        location.pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <SpeechText>
                        <span>
                          <FormattedMessage id={item.nameKey} defaultMessage={item.nameKey.split('.')[1]} />
                        </span>
                      </SpeechText>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.nameKey}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <SpeechText>
                      <span>
                        <FormattedMessage id={item.nameKey} defaultMessage={item.nameKey.split('.')[1]} />
                      </span>
                    </SpeechText>
                  </Link>
                );
              })}

              {/* Mobile Profile Menu */}
              <div className="px-3 py-2">
                {user ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={`${user.displayName || 'User'}'s Profile`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image failed to load:', user.photoURL);
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextSibling as HTMLElement | null;
                                if (nextSibling) nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-700 rounded-full">
                              <SpeechText>
                                <span className="text-sm font-semibold">{getUserInitials()}</span>
                              </SpeechText>
                            </div>
                          )}
                        </div>
                        <SpeechText>
                          <span>{user.displayName || 'Profile'}</span>
                        </SpeechText>
                      </div>
                    </button>
                    {isProfileOpen && (
                      <div className="w-full rounded-lg shadow-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 transition-all duration-200 ease-in-out">
                        <div className="px-4 py-3 border-b border-gray-800">
                          <SpeechText>
                            <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                          </SpeechText>
                          <SpeechText>
                            <p className="text-xs text-gray-300 truncate">{user.email}</p>
                          </SpeechText>
                        </div>
                        <div className="py-1">
                          {profileMenu.map((item) => {
                            if (item.hide) return null;
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.nameKey}
                                to={item.href}
                                onClick={item.onClick || (() => setIsProfileOpen(false))}
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                              >
                                <Icon className="h-4 w-4 text-gray-300" />
                                <SpeechText>
                                  <span>
                                    <FormattedMessage id={item.nameKey} defaultMessage={item.nameKey.split('.')[1]} />
                                  </span>
                                </SpeechText>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 transition-colors duration-200"
                  >
                    <User className="h-5 w-5" />
                    <SpeechText>
                      <span>
                        <FormattedMessage id="navbar.login" defaultMessage="Login" />
                      </span>
                    </SpeechText>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Login Popup */}
      <Login
        isOpen={isLoginOpen}
        onClose={handleCloseLogin}
      />
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-md shadow-lg animate-fade-in">
            <SpeechText>
              <span>
                <FormattedMessage 
                  id={showSuccess === 'login' ? 'navbar.login_success' : 'navbar.logout_success'} 
                  defaultMessage={showSuccess === 'login' ? 'Login Successful!' : 'Logout Successful!'}
                />
              </span>
            </SpeechText>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;