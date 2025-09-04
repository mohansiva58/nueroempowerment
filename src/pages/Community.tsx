/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormattedMessage } from 'react-intl';
import { 
  Send, Smile, Search, Bell, User, MessageSquare, Users, Save, 
  ArrowLeft, LogOut, Upload, Home, PlusCircle, Heart, Share2, 
  MoreHorizontal, Bookmark, ThumbsUp, MessageCircle, Globe, 
  Hash, AtSign, Link, Image as ImageIcon, Video, FileText,
  Sparkles, TrendingUp, UserPlus, Award, Zap, Star, Filter,
  Calendar, Clock, Eye, Edit, Settings, ChevronDown, Play, X
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../pages/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseHelpers, TABLES } from '../lib/supabase';

// Modern Community Platform Styles
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
  }
  
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-glow { animation: glow 2s ease-in-out infinite; }
  .animate-gradient { animation: gradient 15s ease infinite; }
  
  .glass {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .dark .glass {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;
document.head.appendChild(style);

interface Post {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: number;
  likes?: string[];
  comments: { [key: string]: Comment };
  shares: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: number;
  likes: string[];
}

interface UserProfile {
  bio: string;
  description: string;
  connections: string[];
  displayName: string;
  lastActive: number;
  isLoggedIn: boolean;
  photoURL?: string;
  status?: string;
}

interface OtherUser {
  uid: string;
  displayName: string;
  bio: string;
  lastActive: number;
  isLoggedIn: boolean;
  photoURL?: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  read: boolean;
  fromUser?: string;
  postId?: string;
}

const SocialPlatform = () => {
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'feed' | 'messages' | 'notifications' | 'profile' | 'create'>('feed');
  const [profileData, setProfileData] = useState<UserProfile>({
    bio: '',
    description: '',
    connections: [],
    displayName: '',
    lastActive: 0,
    isLoggedIn: false,
    photoURL: '',
    status: '',
  });
  const [otherUsers, setOtherUsers] = useState<OtherUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [postMedia, setPostMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const postsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Update user status with Supabase
    const updateUserStatus = async () => {
      try {
        const timestamp = Date.now();
        await supabaseHelpers.updateUser(user.id, {
          last_active: new Date().toISOString(),
          is_logged_in: true,
          display_name: user.email || 'Anonymous',
          avatar_url: '',
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    };

    updateUserStatus();
    fetchUserProfile();
    fetchOtherUsers();
    fetchPosts();
    fetchNotifications();
  }, [user]);

  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await supabaseHelpers.getUser(user.id);
      if (profile?.data) {
        const profileData = profile.data;
        setProfileData({
          bio: profileData.bio || '',
          description: profileData.description || '',
          connections: profileData.connections || [],
          displayName: profileData.display_name || user.email || 'Anonymous',
          lastActive: profileData.last_active ? new Date(profileData.last_active).getTime() : Date.now(),
          isLoggedIn: profileData.is_logged_in || false,
          photoURL: profileData.avatar_url || '',
          status: profileData.status || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch other users from Supabase
  const fetchOtherUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from(TABLES.users)
        .select('*')
        .limit(50);
        
      if (error) throw error;
      
      const otherUsersData = users?.map(user => ({
        uid: user.id,
        displayName: user.display_name || 'Anonymous',
        bio: user.bio || '',
        lastActive: user.last_active ? new Date(user.last_active).getTime() : Date.now(),
        isLoggedIn: user.is_logged_in || false,
        photoURL: user.avatar_url || '',
      })) || [];
      
      setOtherUsers(otherUsersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch posts from Supabase
  const fetchPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from(TABLES.posts)
        .select(`
          *,
          community_comments (
            id,
            content,
            created_at,
            user_id,
            users (display_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedPosts = posts?.map(post => ({
        id: post.id,
        author: post.author || 'Anonymous',
        authorId: post.user_id,
        content: post.content,
        timestamp: new Date(post.created_at).getTime(),
        likes: post.likes || [],
        comments: post.community_comments?.reduce((acc: any, comment: any) => {
          acc[comment.id] = {
            id: comment.id,
            author: comment.users?.display_name || 'Anonymous',
            authorId: comment.user_id,
            content: comment.content,
            timestamp: new Date(comment.created_at).getTime(),
            likes: [],
          };
          return acc;
        }, {}) || {},
        shares: post.shares || 0,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    }
  };

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      // This would be implemented when notifications table is created
      // For now, just set empty notifications
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handlePostSubmit = async () => {
    if (!user || !newPostContent.trim()) {
      setError('Please enter some content');
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if exists
      if (postMedia) {
        const fileExt = postMedia.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('community-images')
          .upload(fileName, postMedia);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName);
          
        mediaUrl = publicUrl;
        mediaType = postMedia.type.startsWith('video/') ? 'video' : 'image';
      }

      // Create post
      const newPost = {
        content: newPostContent,
        author: profileData.displayName || user.email || 'Anonymous',
        user_id: user.id,
        likes: [],
        shares: 0,
        media_url: mediaUrl,
        media_type: mediaType,
      };

      const result = await supabaseHelpers.createPost(newPost);
      
      if (result) {
        setNewPostContent('');
        setPostMedia(null);
        setPreviewUrl(null);
        await fetchPosts(); // Refresh posts
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const currentLikes = post.likes || [];
      const isLiked = currentLikes.includes(user.id);
      
      let updatedLikes;
      if (isLiked) {
        updatedLikes = currentLikes.filter(id => id !== user.id);
      } else {
        updatedLikes = [...currentLikes, user.id];
      }

      const { error } = await supabase
        .from(TABLES.posts)
        .update({ likes: updatedLikes })
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes: updatedLikes } : p
      ));

      // Create notification for post author if it's a new like
      if (!isLiked && post.authorId !== user.id) {
        // This would create a notification in the notifications table
        console.log('Would create like notification');
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;

    try {
      const newCommentData = {
        post_id: postId,
        user_id: user.id,
        content: newComment,
      };

      const { data, error } = await supabase
        .from(TABLES.comments)
        .insert([newCommentData])
        .select()
        .single();

      if (error) throw error;

      setNewComment('');
      await fetchPosts(); // Refresh to get new comment

      // Create notification for post author
      const selectedPostData = posts.find(p => p.id === postId);
      if (selectedPostData && selectedPostData.authorId !== user.id) {
        console.log('Would create comment notification');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const updatedShares = (post.shares || 0) + 1;

      const { error } = await supabase
        .from(TABLES.posts)
        .update({ shares: updatedShares })
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, shares: updatedShares } : p
      ));

      // Create notification for post author
      if (post.authorId !== user.id) {
        console.log('Would create share notification');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        // Update user status to offline
        await supabaseHelpers.updateUser(user.id, {
          is_logged_in: false,
          last_active: new Date().toISOString(),
        });
      }
      
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPostMedia(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeMedia = () => {
    setPostMedia(null);
    setPreviewUrl(null);
  };

  const onEmojiClick = (emojiData: any) => {
    setNewPostContent(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    postsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            <FormattedMessage id="please_login" defaultMessage="Please log in to access the community" />
          </h1>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FormattedMessage id="login" defaultMessage="Login" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-purple-800 dark:text-purple-300">
              <FormattedMessage id="community" defaultMessage="Community" />
            </h1>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300 cursor-pointer" />
              <Search className="w-6 h-6 text-gray-600 dark:text-gray-300 cursor-pointer" />
              <button onClick={handleLogout}>
                <LogOut className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 min-h-screen bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border-r border-purple-200 dark:border-purple-800 p-6">
            <div className="sticky top-6">
              {/* Profile Section */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl animate-glow">
                    {profileData.photoURL ? (
                      <img src={profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      {profileData.displayName || user.email}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {profileData.connections.length} connections
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {profileData.bio || 'Welcome to the community!'}
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    {posts.filter(p => p.authorId === user?.id).length} posts
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    Online
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-2 mb-8">
                {[
                  { id: 'feed', icon: Home, label: 'Feed' },
                  { id: 'messages', icon: MessageSquare, label: 'Messages' },
                  { id: 'notifications', icon: Bell, label: 'Notifications' },
                  { id: 'profile', icon: User, label: 'Profile' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      currentTab === item.id
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <FormattedMessage id={item.label.toLowerCase()} defaultMessage={item.label} />
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <FormattedMessage id="logout" defaultMessage="Logout" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 max-w-2xl mx-auto p-6">
          {currentTab === 'feed' && (
            <div className="space-y-6">
              {/* Create Post */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold animate-glow">
                    {profileData.photoURL ? (
                      <img src={profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
                      rows={3}
                    />
                    
                    {previewUrl && (
                      <div className="relative mt-4">
                        {postMedia?.type.startsWith('image/') ? (
                          <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        ) : (
                          <video src={previewUrl} className="w-full h-48 object-cover rounded-lg" controls />
                        )}
                        <button
                          onClick={removeMedia}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleMediaUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full transition-colors"
                        >
                          <ImageIcon className="w-5 h-5 text-purple-600" />
                        </button>
                        <div className="relative" ref={emojiPickerRef}>
                          <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full transition-colors"
                          >
                            <Smile className="w-5 h-5 text-purple-600" />
                          </button>
                          {showEmojiPicker && (
                            <div className="absolute top-12 left-0 z-50">
                              <EmojiPicker onEmojiClick={onEmojiClick} />
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={handlePostSubmit}
                        disabled={loading || !newPostContent.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FormattedMessage id="post" defaultMessage="Post" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="glass rounded-2xl p-4 border-red-300 bg-red-50/50 dark:bg-red-900/20">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <button 
                    onClick={() => setError(null)} 
                    className="ml-2 text-red-800 dark:text-red-300 hover:text-red-600 dark:hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Posts Feed */}
              <div className="space-y-6">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6"
                  >
                    {/* Post Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {otherUsers.find(u => u.uid === post.authorId)?.photoURL ? (
                          <img 
                            src={otherUsers.find(u => u.uid === post.authorId)?.photoURL} 
                            alt="Author" 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{post.author}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(post.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-800 dark:text-white leading-relaxed">{post.content}</p>
                      
                      {post.mediaUrl && (
                        <div className="mt-4">
                          {post.mediaType === 'image' ? (
                            <img 
                              src={post.mediaUrl} 
                              alt="Post media" 
                              className="w-full h-auto max-h-96 object-cover rounded-lg"
                            />
                          ) : post.mediaType === 'video' ? (
                            <video 
                              src={post.mediaUrl} 
                              className="w-full h-auto max-h-96 object-cover rounded-lg" 
                              controls 
                            />
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                            post.likes?.includes(user.id)
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${post.likes?.includes(user.id) ? 'fill-current' : ''}`} />
                          <span className="text-sm">{post.likes?.length || 0}</span>
                        </button>
                        
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{Object.keys(post.comments || {}).length}</span>
                        </button>
                        
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-all"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm">{post.shares || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments Preview */}
                    {Object.values(post.comments || {}).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-3">
                          {Object.values(post.comments).slice(0, 2).map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                {otherUsers.find(u => u.uid === comment.authorId)?.photoURL ? (
                                  <img 
                                    src={otherUsers.find(u => u.uid === comment.authorId)?.photoURL} 
                                    alt="Commenter" 
                                    className="w-full h-full rounded-full object-cover" 
                                  />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                                  <p className="font-medium text-sm text-gray-800 dark:text-white">{comment.author}</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          {Object.values(post.comments).length > 2 && (
                            <button
                              onClick={() => setSelectedPost(post)}
                              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              View {Object.values(post.comments).length - 2} more comments
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div ref={postsEndRef} />
            </div>
          )}

          {/* Other tabs content can be added here */}
          {currentTab === 'messages' && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                <FormattedMessage id="messages" defaultMessage="Messages" />
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                <FormattedMessage id="messages_coming_soon" defaultMessage="Messages feature coming soon!" />
              </p>
            </div>
          )}

          {currentTab === 'notifications' && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                <FormattedMessage id="notifications" defaultMessage="Notifications" />
              </h2>
              {notifications.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">
                  <FormattedMessage id="no_notifications" defaultMessage="No notifications yet." />
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-800 dark:text-white">{notification.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'profile' && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                <FormattedMessage id="profile" defaultMessage="Profile" />
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl animate-glow">
                    {profileData.photoURL ? (
                      <img src={profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-10 h-10" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {profileData.displayName || user.email}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {profileData.connections.length} connections
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Bio</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {profileData.bio || 'No bio added yet.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Stats</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {posts.filter(p => p.authorId === user?.id).length}
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Posts</p>
                    </div>
                    <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {posts.filter(p => p.authorId === user?.id)
                             .reduce((sum, p) => sum + (p.likes?.length || 0), 0)}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Likes</p>
                    </div>
                    <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {profileData.connections.length}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">Connections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Active Users */}
        {!isMobile && (
          <div className="w-80 min-h-screen bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border-l border-purple-200 dark:border-purple-800 p-6">
            <div className="sticky top-6">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">
                <FormattedMessage id="active_users" defaultMessage="Active Users" />
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {otherUsers.slice(0, 10).map((otherUser) => (
                  <div key={otherUser.uid} className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {otherUser.photoURL ? (
                          <img src={otherUser.photoURL} alt={otherUser.displayName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      {otherUser.isLoggedIn && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {otherUser.displayName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {otherUser.isLoggedIn ? 'Online' : `Last seen ${new Date(otherUser.lastActive).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-around py-3">
            {[
              { id: 'feed', icon: Home },
              { id: 'messages', icon: MessageSquare },
              { id: 'create', icon: PlusCircle },
              { id: 'notifications', icon: Bell },
              { id: 'profile', icon: User },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as any)}
                className={`p-3 rounded-full transition-all ${
                  currentTab === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                <item.icon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 dark:text-white">Comments</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Post Preview */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {otherUsers.find(u => u.uid === selectedPost.authorId)?.photoURL ? (
                      <img 
                        src={otherUsers.find(u => u.uid === selectedPost.authorId)?.photoURL} 
                        alt="Author" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-white">{selectedPost.author}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(selectedPost.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800 dark:text-white text-sm">{selectedPost.content}</p>
              </div>

              {/* Comments */}
              <div className="space-y-4 mb-6">
                {Object.values(selectedPost.comments || {}).map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {otherUsers.find(u => u.uid === comment.authorId)?.photoURL ? (
                        <img 
                          src={otherUsers.find(u => u.uid === comment.authorId)?.photoURL} 
                          alt="Commenter" 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <p className="font-medium text-sm text-gray-800 dark:text-white">{comment.author}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt="You" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment(selectedPost.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleComment(selectedPost.id)}
                    disabled={!newComment.trim()}
                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPlatform;
