'use client'
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  Award,
  TrendingUp,
  BarChart3,
  Star,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  Check,
  Globe,
  Clock,
  DollarSign,
  Target,
  Activity,
  Users,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Upload,
  Loader
} from 'lucide-react';
import Header from '@/components/Header/Header';
import { useProfile } from '../../hooks/userProfile';
import { useAuth } from '@/contexts/AuthContext';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [userStats, setUserStats] = useState({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isAuthenticated } = useAuth();
  const {
    profile,
    loading,
    error,
    uploadingAvatar,
    updateProfile,
    uploadAvatar,
    updateNotificationPreferences,
    updatePrivacySettings,
    setError
  } = useProfile();

  useEffect(() => {
    // Mock trading stats - in real app, fetch from API
    setUserStats({
      totalTrades: 324,
      winRate: 67.8,
      totalPnL: 23450.75,
      bestTrade: 4250.00,
      worstTrade: -850.00,
      avgTrade: 72.38,
      followersCount: 1247,
      followingCount: 89,
      signalsCreated: 156,
      signalsFollowed: 423,
      accountValue: 145670.25,
      monthlyReturn: 8.4,
      maxDrawdown: -12.3,
      sharpeRatio: 1.84
    });
  }, []);

  useEffect(() => {
    if (profile && isEditing) {
      setEditForm({
        name: profile.name,
        username: profile.username,
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || ''
      });
    }
  }, [profile, isEditing]);

  // Handler functions
  const handleCopyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await uploadAvatar(file);
      if (success) {
        // Avatar updated successfully
      }
    }
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile(editForm);
    if (success) {
      setIsEditing(false);
      setEditForm({});
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
    setError(null);
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    await updateNotificationPreferences({ [key]: value });
  };

  const handlePrivacyChange = async (key: string, value: boolean) => {
    await updatePrivacySettings({ [key]: value });
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
  // Loading and error states
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <Header />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
          <p className="text-gray-400">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <Header />
        <div className="text-center">
          <Loader className="animate-spin w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <Header />
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-gray-400">Unable to load your profile data.</p>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <Header />
      <div className="p-6 pt-24 max-w-7xl mx-auto">
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <img
                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=128&background=6366f1&color=ffffff`}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/50 shadow-xl"
              />
              <button 
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                {uploadingAvatar ? <Loader className="animate-spin" size={16} /> : <Camera size={16} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {profile.verified && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full">
                  <CheckCircle size={16} />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {profile.tier}
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-gray-300 mb-4">
                <span className="flex items-center gap-2">
                  <User size={16} />
                  @{profile.username}
                </span>
                {profile.location && (
                  <span className="flex items-center gap-2">
                    <MapPin size={16} />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  Joined {formatDate(profile.joined_at)}
                </span>
              </div>

              {profile.bio && (
                <p className="text-gray-300 mb-6 max-w-2xl leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{userStats.followersCount}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{userStats.winRate}%</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{userStats.signalsCreated}</div>
                  <div className="text-sm text-gray-400">Signals</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{userStats.totalTrades}</div>
                  <div className="text-sm text-gray-400">Trades</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
              
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2">
                <Settings size={16} />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          <TabButton 
            id="overview" 
            label="Overview" 
            icon={BarChart3} 
            isActive={activeTab === 'overview'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="performance" 
            label="Performance" 
            icon={TrendingUp} 
            isActive={activeTab === 'performance'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="account" 
            label="Account" 
            icon={User} 
            isActive={activeTab === 'account'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="preferences" 
            label="Preferences" 
            icon={Settings} 
            isActive={activeTab === 'preferences'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="security" 
            label="Security" 
            icon={Shield} 
            isActive={activeTab === 'security'} 
            onClick={setActiveTab} 
          />
        </div>
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Trading Performance */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Activity className="text-green-400" />
                Trading Performance
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(userStats.totalPnL)}
                  </div>
                  <div className="text-sm text-gray-400">Total P&L</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(userStats.accountValue)}
                  </div>
                  <div className="text-sm text-gray-400">Account Value</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    +{userStats.monthlyReturn}%
                  </div>
                  <div className="text-sm text-gray-400">Monthly Return</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {userStats.sharpeRatio}
                  </div>
                  <div className="text-sm text-gray-400">Sharpe Ratio</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Clock className="text-blue-400" />
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-white">Opened position in AAPL</div>
                    <div className="text-sm text-gray-400">2 hours ago</div>
                  </div>
                  <div className="text-green-400 font-semibold">+$125.50</div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-white">Created signal for TSLA</div>
                    <div className="text-sm text-gray-400">5 hours ago</div>
                  </div>
                  <div className="text-blue-400 font-semibold">15 followers</div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-white">Closed position in BTC</div>
                    <div className="text-sm text-gray-400">1 day ago</div>
                  </div>
                  <div className="text-red-400 font-semibold">-$45.20</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Detailed Performance Metrics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-lg font-semibold text-white mb-2">Best Trade</div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(userStats.bestTrade)}
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-lg font-semibold text-white mb-2">Worst Trade</div>
                  <div className="text-2xl font-bold text-red-400">
                    {formatCurrency(userStats.worstTrade)}
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-lg font-semibold text-white mb-2">Average Trade</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(userStats.avgTrade)}
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-lg font-semibold text-white mb-2">Max Drawdown</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {userStats.maxDrawdown}%
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-lg font-semibold text-white mb-2">Signals Followed</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {userStats.signalsFollowed}
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-lg font-semibold text-white mb-2">Following</div>
                  <div className="text-2xl font-bold text-gray-300">
                    {userStats.followingCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Account Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.name || '' : profile.name}
                    onChange={(e) => isEditing && setEditForm({...editForm, name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.username || '' : profile.username}
                    onChange={(e) => isEditing && setEditForm({...editForm, username: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled={true}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={isEditing ? editForm.phone || '' : profile.phone || ''}
                    onChange={(e) => isEditing && setEditForm({...editForm, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.location || '' : profile.location || ''}
                    onChange={(e) => isEditing && setEditForm({...editForm, location: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={isEditing ? editForm.bio || '' : profile.bio || ''}
                    onChange={(e) => isEditing && setEditForm({...editForm, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              {/* Referral Code */}
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                <h3 className="text-lg font-semibold text-white mb-3">Referral Code</h3>
                <div className="flex items-center gap-3">
                  <code className="bg-gray-700/50 text-blue-400 px-4 py-2 rounded font-mono text-lg">
                    {profile.referral_code}
                  </code>
                  <button
                    onClick={handleCopyReferral}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Share your referral code to earn rewards when friends join!
                </p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Bell className="text-yellow-400" />
                Notification Preferences
              </h2>
              
              <div className="space-y-4">
                {Object.entries(profile.notification_preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'push' && 'Browser and mobile push notifications'}
                        {key === 'sms' && 'SMS alerts for important updates'}
                        {key === 'tradeAlerts' && 'Alerts for trade executions and updates'}
                        {key === 'marketNews' && 'Daily market news and analysis'}
                        {key === 'weeklyReports' && 'Weekly performance summaries'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        className="sr-only peer"
                        onChange={(e) => handleNotificationChange(key, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Eye className="text-blue-400" />
                Privacy Settings
              </h2>
              
              <div className="space-y-4">
                {Object.entries(profile.privacy_settings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {key === 'profileVisible' && 'Allow others to view your profile'}
                        {key === 'tradesVisible' && 'Show your trading history publicly'}
                        {key === 'followersVisible' && 'Display follower and following counts'}
                        {key === 'portfolioVisible' && 'Share portfolio performance data'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        className="sr-only peer"
                        onChange={(e) => handlePrivacyChange(key, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="text-green-400" />
                Security Settings
              </h2>
              
              <div className="space-y-6">
                {/* Password Change */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none pr-12"
                          placeholder="Enter current password"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="pt-6 border-t border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <div className="text-white font-medium">2FA Status</div>
                      <div className="text-sm text-gray-400">Add an extra layer of security to your account</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Disabled
                      </span>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="pt-6 border-t border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div>
                        <div className="text-white font-medium">Current Session</div>
                        <div className="text-sm text-gray-400">Chrome on Windows • New York, NY</div>
                      </div>
                      <span className="text-green-400 text-sm">Active now</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div>
                        <div className="text-white font-medium">Mobile App</div>
                        <div className="text-sm text-gray-400">iPhone • Last seen 2 hours ago</div>
                      </div>
                      <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Changes Button (shown when editing) */}
        {isEditing && (
          <div className="fixed bottom-6 right-6 flex gap-3">
            <button
              onClick={handleCancelEdit}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 shadow-lg"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;