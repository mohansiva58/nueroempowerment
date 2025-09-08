import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, BookOpen, Gamepad2, Calendar, Users, Brain, Settings, FileText, MessageSquare, User as UserIcon, LogOut, Activity, Mic } from 'lucide-react';
import { SpeechText } from '../components/speach';
import { FormattedMessage } from 'react-intl';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../pages/AuthContext';
import { useSpeechSettings } from '../contexts/SpeechSettingsContext';
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

  const handleLogout = useCallback(() => {
    logout();
    setShowSuccess('logout');
    setIsProfileOpen(false);
  }, [logout]);

  const handleLoginClick = useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  const handleCloseLogin = useCallback(() => {
    setIsLoginOpen(false);
  }, []);

  const navigation = [
    { nameKey: "navbar.home", href: '/', icon: Home },
    { nameKey: "navbar.learning", href: '/learning', icon: BookOpen },
    { nameKey: "navbar.games", href: '/games', icon: Gamepad2 },
    { nameKey: "navbar.daily", href: '/daily', icon: Calendar },
    // { nameKey: "navbar.community", href: '/community', icon: Users },
    { nameKey: "navbar.assessment", href: '/assessment', icon: Brain },
    { nameKey: "navbar.about", href: '/about', icon: FileText },
  ];

  const profileMenu = useMemo(() => [
    // { nameKey: "navbar.ml_analysis", href: '/ml-analysis', icon: Brain },
    // { nameKey: "navbar.real_time_monitoring", href: '/real-time-monitoring', icon: Activity },
    // { nameKey: "navbar.speech_analysis", href: '/speech-analysis', icon: Mic },
    { nameKey: "navbar.settings", href: '/settings', icon: Settings },
    { nameKey: "navbar.blog", href: '/blog', icon: FileText },
    { nameKey: "navbar.articles", href: '/articles', icon: MessageSquare },
    // { nameKey: "navbar.about", href: '/about', icon: FileText },
    { nameKey: "navbar.logout", href: '#', icon: LogOut, onClick: handleLogout, hide: !user },
  ], [handleLogout, user]);

  const getUserInitials = () => {
    if (user && user.email) {
      // Use email to generate initials since Supabase user doesn't have displayName by default
      const emailParts = user.email.split('@')[0];
      return emailParts.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  useEffect(() => {
    if (user) {
      console.log('User Data:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
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
                
                {/* Mobile Speech Toggle Button - REMOVED per user request */}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4 items-center">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.nameKey}
                    to={item.href}
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                      console.debug('Navbar desktop link clicked', item.href, 'userPresent:', !!user);
                      try {
                        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
                        console.debug('elementFromPoint at click:', el ? `${el.tagName} ${el.className}` : el);
                      } catch (err) {
                        console.debug('elementFromPoint error', err);
                      }
                    }}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.href ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <SpeechText enableVisualFeedback={false}>
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
                aria-pressed={!isSpeechEnabled ? 'false' : 'true'}
                title={isSpeechEnabled ? 'Disable speech' : 'Enable speech'}
                className="ml-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {isSpeechEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <LogOut className="h-4 w-4 transform rotate-90" />
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="User Profile"
                  >
                    {getUserAvatar() ? (
                      <img
                        src={getUserAvatar()}
                        alt={`${getUserDisplayName()}'s Profile`}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          console.error('Image failed to load:', getUserAvatar());
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
                    <UserIcon className="h-5 w-5" />
                  </button>
                )}
                {isProfileOpen && user && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 transform origin-top-right transition-all duration-200 ease-in-out z-50">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <SpeechText>
                        <p className="text-sm font-medium text-white truncate">{getUserDisplayName()}</p>
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
                            onClick={(e) => {
                              console.log('Desktop profile menu item clicked:', item.nameKey, item.href);
                              if (item.onClick) {
                                e.preventDefault();
                                console.log('Executing custom onClick for:', item.nameKey);
                                item.onClick();
                              } else {
                                console.log('Closing profile menu and navigating to:', item.href);
                                setIsProfileOpen(false);
                              }
                            }}
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
                return (
                  <Link
                    key={item.nameKey}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                    onClick={(e: React.MouseEvent<HTMLElement>) => {
                      console.debug('Navbar mobile link clicked', item.href, 'userPresent:', !!user);
                      try {
                        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
                        console.debug('elementFromPoint at click:', el ? `${el.tagName} ${el.className}` : el);
                      } catch (err) {
                        console.debug('elementFromPoint error', err);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <SpeechText enableVisualFeedback={false}>
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
                          {getUserAvatar() ? (
                            <img
                              src={getUserAvatar()}
                              alt={`${getUserDisplayName()}'s Profile`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image failed to load:', getUserAvatar());
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextSibling as HTMLElement | null;
                                if (nextSibling) nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-700 rounded-full">
                              <SpeechText enableVisualFeedback={false}>
                                <span className="text-sm font-semibold">{getUserInitials()}</span>
                              </SpeechText>
                            </div>
                          )}
                        </div>
                        <SpeechText>
                          <span>{getUserDisplayName()}</span>
                        </SpeechText>
                      </div>
                    </button>
                    {isProfileOpen && (
                      <div className="w-full rounded-lg shadow-xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 transition-all duration-200 ease-in-out">
                        <div className="px-4 py-3 border-b border-gray-800">
                          <SpeechText>
                            <p className="text-sm font-medium text-white truncate">{getUserDisplayName()}</p>
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
                                onClick={(e) => {
                                  console.log('Mobile profile menu item clicked:', item.nameKey, item.href);
                                  if (item.onClick) {
                                    e.preventDefault();
                                    console.log('Executing custom onClick for:', item.nameKey);
                                    item.onClick();
                                  } else {
                                    console.log('Closing profile menu and navigating to:', item.href);
                                    setIsProfileOpen(false);
                                    setIsOpen(false); // Also close mobile menu
                                  }
                                }}
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                              >
                                <Icon className="h-4 w-4 text-gray-300" />
                                <SpeechText enableVisualFeedback={false}>
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
                    <UserIcon className="h-5 w-5" />
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