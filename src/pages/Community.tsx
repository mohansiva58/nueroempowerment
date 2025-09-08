/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FormattedMessage } from 'react-intl';
import { Send, Smile, Search, Bell, User, MessageSquare, LogOut, Home, PlusCircle, Heart, Share2, MoreHorizontal, MessageCircle, Image as ImageIcon, X } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useAuth } from '../pages/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseHelpers, TABLES } from '../lib/supabase';

// Black and White Theme Styles
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); }
    50% { box-shadow: 0 0 20px rgba(0, 0, 0, 0.4); }
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
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  /* Force light theme on pages where applied */
  .force-light, .force-light * {
    background-color: #ffffff !important;
    color: #000000 !important;
    border-color: rgba(229, 231, 235, 1) !important; /* gray-200 */
  }
`;
document.head.appendChild(style);

interface Post {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: number;
  likes: string[];
  comments: Record<string, Comment>;
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

const SocialPlatform: React.FC = () => {
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

    const updateUserStatus = async () => {
      try {
        await supabaseHelpers.updateUser(user.id, {
          last_active: new Date().toISOString(),
          is_logged_in: true,
          display_name: user.email || 'Anonymous',
          avatar_url: '',
        } as any);
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
      } else {
        setProfileData({
          bio: '',
          description: 'Community member',
          connections: [],
          displayName: user.email?.split('@')[0] || 'Anonymous',
          lastActive: Date.now(),
          isLoggedIn: true,
          photoURL: '',
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchOtherUsers = async () => {
    try {
      if (!TABLES || !TABLES.users) {
        console.error('TABLES.users is not defined. Check src/lib/supabase.ts');
        setError('Users table not configured. See console for details.');
        setOtherUsers([{
          uid: 'mock-user', displayName: 'Community Member', bio: '', lastActive: Date.now(), isLoggedIn: false, photoURL: ''
        }]);
        return;
      }

      const response = await supabase
        .from(TABLES.users)
        .select('id, display_name, bio, last_active, is_logged_in, avatar_url')
        .limit(50);

      // Log the full response safely
      try {
        console.debug('Supabase fetch users response:', JSON.stringify(response, Object.getOwnPropertyNames(response), 2));
      } catch {
        console.debug('Supabase fetch users response (non-serializable)', response);
      }

  const { data: users, error } = response;

  if (error || !users) {
        // Safely stringify the Supabase error object for clearer logs
        let errStr: string;
        try {
          errStr = typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
        } catch {
          errStr = String(error);
        }

        console.error('Supabase error fetching users: ' + errStr);
        // setError(`Failed to load users (check Supabase env/permissions). ${error?.message ?? ''}`);
        // Provide a small mock fallback so the UI remains usable
        setOtherUsers([{
          uid: 'mock-user',
          displayName: 'Community Member',
          bio: '',
          lastActive: Date.now(),
          isLoggedIn: false,
          photoURL: ''
        }]);
        return;
      }

  const otherUsersData = (users as any)?.map((user: any) => ({
        uid: user.id,
        displayName: user.display_name || 'Anonymous',
        bio: user.bio || '',
        lastActive: user.last_active ? new Date(user.last_active).getTime() : Date.now(),
        isLoggedIn: user.is_logged_in || false,
        photoURL: user.avatar_url || '',
      })) || [];
      
      setOtherUsers(otherUsersData);
    } catch (error) {
      let errStr: string;
      try {
        errStr = typeof error === 'object' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : String(error);
      } catch {
        errStr = String(error);
      }
      console.error('Error fetching users: ' + errStr);
      setError('Failed to load users (see console for details)');
    }
  };

  const fetchPosts = async () => {
    try {
      const { data: posts, error } = await supabase
        .from(TABLES.posts)
        .select(`
          id,
          content,
          created_at,
          user_id,
          author:users!user_id(display_name),
          likes,
          shares,
          media_url,
          media_type,
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

      const formattedPosts = (posts as any)?.map((post: any) => ({
        id: post.id,
        author: Array.isArray(post.author) ? (post.author[0]?.display_name || 'Anonymous') : (post.author?.display_name || 'Anonymous'),
        authorId: post.user_id,
        content: post.content,
        timestamp: new Date(post.created_at).getTime(),
        likes: post.likes || [],
        comments: post.community_comments?.reduce((acc: Record<string, Comment>, comment: any) => {
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
      // setError('Failed to load posts');
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
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
      let mediaUrl: string | null = null;
      let mediaType: 'image' | 'video' | null = null;

      if (postMedia) {
        const fileExt = postMedia.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('community-images')
          .upload(fileName, postMedia);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('community-images')
          .getPublicUrl(fileName);
          
        mediaUrl = publicUrl;
        mediaType = postMedia.type.startsWith('video/') ? 'video' : 'image';
      }

      const newPost = {
        content: newPostContent,
        author: profileData.displayName || user.email || 'Anonymous',
        user_id: user.id,
        likes: [],
        shares: 0,
        media_url: mediaUrl,
        media_type: mediaType,
      };

  const result = await supabaseHelpers.createPost(newPost as any);
      
      if (result) {
        setNewPostContent('');
        setPostMedia(null);
        setPreviewUrl(null);
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // setError('Failed to create post');
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
      
      const updatedLikes = isLiked
        ? currentLikes.filter(id => id !== user.id)
        : [...currentLikes, user.id];

      const { error } = await supabase
        .from(TABLES.posts)
        .update({ likes: updatedLikes })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes: updatedLikes } : p
      ));

      if (!isLiked && post.authorId !== user.id) {
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
        .from('community_comments')
        .insert([newCommentData])
        .select()
        .single();

      if (error) throw error;

      setNewComment('');
      await fetchPosts();

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

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, shares: updatedShares } : p
      ));

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
        await supabaseHelpers.updateUser(user.id, {
          is_logged_in: false,
          last_active: new Date().toISOString(),
        } as any);
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

  const onEmojiClick = (emojiData: EmojiClickData) => {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">
            <FormattedMessage id="please_login" defaultMessage="Please log in to access the community" />
          </h1>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-white text-black rounded-lg border border-black hover:bg-gray-200 transition-colors"
          >
            <FormattedMessage id="login" defaultMessage="Login" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-black">
              <FormattedMessage id="community" defaultMessage="Community" />
            </h1>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-black cursor-pointer" />
              <Search className="w-6 h-6 text-black cursor-pointer" />
              <button onClick={handleLogout}>
                <LogOut className="w-6 h-6 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 min-h-screen bg-white/90 backdrop-blur-md border-r border-black p-6">
            <div className="sticky top-6">
              {/* Profile Section */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white font-bold text-xl animate-glow">
                    {profileData.photoURL ? (
                      <img src={profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-black">
                      {profileData.displayName || user.email}
                    </h3>
                    <p className="text-sm text-black">
                      {profileData.connections.length} connections
                    </p>
                  </div>
                </div>
                <p className="text-sm text-black mb-4">
                  {profileData.bio || 'Welcome to the community!'}
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="px-3 py-1 bg-gray-200 text-black rounded-full">
                    {posts.filter(p => p.authorId === user?.id).length} posts
                  </span>
                  <span className="px-3 py-1 bg-gray-200 text-black rounded-full">
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
                        ? 'bg-black text-white shadow-lg'
                        : 'text-black hover:bg-gray-200'
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
                className="w-full flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-200 rounded-xl transition-all"
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
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold animate-glow">
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
                      className="w-full bg-transparent text-black placeholder-gray-500 resize-none focus:outline-none"
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
                          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <ImageIcon className="w-5 h-5 text-black" />
                        </button>
                        <div className="relative" ref={emojiPickerRef}>
                          <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Smile className="w-5 h-5 text-black" />
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
                        className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="glass rounded-2xl p-4 border-black bg-gray-100">
                  <p className="text-black">{error}</p>
                  <button 
                    onClick={() => setError(null)} 
                    className="ml-2 text-black hover:text-gray-700"
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
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold">
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
                            <p className="font-semibold text-black">{post.author}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(post.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-black" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-black leading-relaxed">{post.content}</p>
                      
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
                    <div className="flex items-center justify-between pt-4 border-t border-black">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                            post.likes?.includes(user.id)
                              ? 'bg-gray-200 text-black'
                              : 'hover:bg-gray-200 text-black'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${post.likes?.includes(user.id) ? 'fill-current' : ''}`} />
                          <span className="text-sm">{post.likes?.length || 0}</span>
                        </button>
                        
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-200 text-black transition-all"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{Object.keys(post.comments || {}).length}</span>
                        </button>
                        
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-200 text-black transition-all"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm">{post.shares || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments Preview */}
                    {Object.values(post.comments || {}).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-black">
                        <div className="space-y-3">
                          {Object.values(post.comments).slice(0, 2).map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
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
                                <div className="bg-gray-100 rounded-lg px-3 py-2">
                                  <p className="font-medium text-sm text-black">{comment.author}</p>
                                  <p className="text-sm text-black">{comment.content}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          {Object.values(post.comments).length > 2 && (
                            <button
                              onClick={() => setSelectedPost(post)}
                              className="text-sm text-black hover:underline"
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

          {currentTab === 'messages' && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-black mb-4">
                <FormattedMessage id="messages" defaultMessage="Messages" />
              </h2>
              <p className="text-black">
                <FormattedMessage id="messages_coming_soon" defaultMessage="Messages feature coming soon!" />
              </p>
            </div>
          )}

          {currentTab === 'notifications' && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-black mb-4">
                <FormattedMessage id="notifications" defaultMessage="Notifications" />
              </h2>
              {notifications.length === 0 ? (
                <p className="text-black">
                  <FormattedMessage id="no_notifications" defaultMessage="No notifications yet." />
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-black">{notification.message}</p>
                      <p className="text-sm text-gray-500">
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
              <h2 className="text-2xl font-bold text-black mb-4">
                <FormattedMessage id="profile" defaultMessage="Profile" />
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white font-bold text-2xl animate-glow">
                    {profileData.photoURL ? (
                      <img src={profileData.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-10 h-10" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black">
                      {profileData.displayName || user.email}
                    </h3>
                    <p className="text-black">
                      {profileData.connections.length} connections
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2">Bio</h4>
                  <p className="text-black">
                    {profileData.bio || 'No bio added yet.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-2">Stats</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <p className="text-2xl font-bold text-black">
                        {posts.filter(p => p.authorId === user?.id).length}
                      </p>
                      <p className="text-sm text-black">Posts</p>
                    </div>
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <p className="text-2xl font-bold text-black">
                        {posts.filter(p => p.authorId === user?.id)
                             .reduce((sum, p) => sum + (p.likes?.length || 0), 0)}
                      </p>
                      <p className="text-sm text-black">Likes</p>
                    </div>
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <p className="text-2xl font-bold text-black">
                        {profileData.connections.length}
                      </p>
                      <p className="text-sm text-black">Connections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Active Users */}
        {!isMobile && (
          <div className="w-80 min-h-screen bg-white/90 backdrop-blur-md border-l border-black p-6">
            <div className="sticky top-6">
              <h3 className="font-bold text-black mb-4">
                <FormattedMessage id="active_users" defaultMessage="Active Users" />
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {otherUsers.slice(0, 10).map((otherUser) => (
                  <div key={otherUser.uid} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold">
                        {otherUser.photoURL ? (
                          <img src={otherUser.photoURL} alt={otherUser.displayName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      {otherUser.isLoggedIn && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-black rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black truncate">
                        {otherUser.displayName}
                      </p>
                      <p className="text-sm text-gray-500">
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-black">
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
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-gray-200'
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
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-black p-4 flex items-center justify-between">
              <h3 className="font-bold text-black">Comments</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            
            <div className="p-4">
              {/* Post Preview */}
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
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
                    <p className="font-semibold text-sm text-black">{selectedPost.author}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedPost.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-black text-sm">{selectedPost.content}</p>
              </div>

              {/* Comments */}
              <div className="space-y-4 mb-6">
                {Object.values(selectedPost.comments || {}).map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
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
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="font-medium text-sm text-black">{comment.author}</p>
                        <p className="text-sm text-black">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
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
                    className="flex-1 px-3 py-2 bg-gray-100 text-black placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                    className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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