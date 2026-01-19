import React, { useState, useRef } from 'react';
import {
  User, Lock, Bell, Globe, Palette, CreditCard,
  Moon, Sun, Monitor, CheckCircle, Shield, Camera,
  ChevronRight, Save, LogOut
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // --- STATE MANAGEMENT (Kept Logic Same) ---
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: (user as any)?.location || '',
    bio: (user as any)?.bio || '',
    companyName: (user as any)?.companyName || '',
  });

  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true,
    pushNotifs: true,
    marketingEmails: false,
    newDeals: true,
  });

  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('System');

  const [billingData, setBillingData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(user?.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  // --- HANDLERS (Kept Logic Same) ---
  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(p => ({ ...p, [key]: !p[key] }));
    toast.success('Preference updated');
  };

// ---------------- SAVE PROFILE (FIXED) ----------------
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      // 1. FormData banao (Text + Image dono ke liye)
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('location', formData.location);
      fd.append('bio', formData.bio);
      fd.append('companyName', formData.companyName);

      // 2. Agar Image hai to wo bhi add karo
      if (avatarFile) {
        fd.append('avatar', avatarFile);
      }

      // 3. ✅ Context wala function call karo (Jo sahi URL /api/users/profile use karega)
      if (user?._id) {
          // TypeScript ab shikayat nahi karega kyunke humne Step 1 mein 'FormData' allow kar diya hai
          await updateProfile(user._id, fd); 
          
          // Page reload taake nayi pic nazar aaye
          window.location.reload();
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // --- SUB-COMPONENTS FOR UI ---
  const SidebarItem = ({ id, label, icon: Icon, description }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${
        activeTab === id
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${activeTab === id ? 'bg-indigo-500/30' : 'bg-gray-100 group-hover:bg-white'}`}>
           <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="font-semibold text-sm">{label}</p>
          {description && <p className={`text-xs ${activeTab === id ? 'text-indigo-200' : 'text-gray-400'}`}>{description}</p>}
        </div>
      </div>
      {activeTab === id && <ChevronRight size={18} className="text-indigo-200" />}
    </button>
  );

  const ToggleSwitch = ({ checked, onChange }: any) => (
    <div 
      onClick={onChange}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account preferences and profile details.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
             <Button onClick={handleSaveChanges} disabled={loading} leftIcon={<Save size={18}/>}>
               {loading ? 'Saving Changes...' : 'Save Changes'}
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-2 sticky top-6">
            <SidebarItem id="profile" label="My Profile" icon={User} description="Personal details & photo" />
            <SidebarItem id="security" label="Login & Security" icon={Lock} description="Password & 2FA" />
            <SidebarItem id="notifications" label="Notifications" icon={Bell} description="Email & Push alerts" />
            <SidebarItem id="appearance" label="Appearance" icon={Palette} description="Dark mode & themes" />
            <SidebarItem id="language" label="Language" icon={Globe} description="System language" />
            <SidebarItem id="billing" label="Plan & Billing" icon={CreditCard} description="Credit cards & invoices" />
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="lg:col-span-9 space-y-6">

            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
              <Card className="border-none shadow-lg ring-1 ring-black/5">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Public Profile</h2>
                  <p className="text-sm text-gray-500">This information will be displayed publicly.</p>
                </CardHeader>
                <CardBody className="space-y-8 p-6">
                  
                  {/* Avatar Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <Avatar src={previewUrl} size="2xl" className="ring-4 ring-white shadow-xl" />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-500 mb-3">Recommended: 400x400px. JPG or PNG.</p>
                      <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
                      <div className="flex gap-2 justify-center sm:justify-start">
                        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Upload New</Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">Remove</Button>
                      </div>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
                    <Input label="Email Address" value={formData.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                    <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. New York, USA" />
                    <Input label="Company / Organization" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Acme Corp" />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About</label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none resize-none"
                      placeholder="Tell us a little about yourself..."
                    />
                    <p className="text-xs text-gray-400 mt-2 text-right">{formData.bio.length}/500 characters</p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === 'security' && (
              <Card className="border-none shadow-lg ring-1 ring-black/5">
                 <CardHeader className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500">Manage your password and 2-step verification preferences.</p>
                </CardHeader>
                <CardBody className="space-y-6 p-6">
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 text-indigo-700 rounded-full">
                        <Shield size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account.</p>
                      </div>
                    </div>
                    <Button>Enable 2FA</Button>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input type="password" label="Current Password" placeholder="••••••••" />
                       <Input type="password" label="New Password" placeholder="••••••••" />
                    </div>
                    <div className="mt-4 text-right">
                       <Button variant="outline" disabled>Update Password</Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* --- NOTIFICATIONS TAB --- */}
            {activeTab === 'notifications' && (
              <Card className="border-none shadow-lg ring-1 ring-black/5">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-500">Choose what updates you want to receive.</p>
                </CardHeader>
                <CardBody className="divide-y divide-gray-100">
                  {[
                    { key: 'emailAlerts', title: 'Email Alerts', desc: 'Receive important updates via email.' },
                    { key: 'pushNotifs', title: 'Push Notifications', desc: 'Get notified in the browser.' },
                    { key: 'newDeals', title: 'New Opportunities', desc: 'Notify me when new deals match my criteria.' },
                    { key: 'marketingEmails', title: 'Marketing & Tips', desc: 'Receive tips on how to use the platform.' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-5">
                      <div>
                         <h4 className="font-medium text-gray-900">{item.title}</h4>
                         <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <ToggleSwitch 
                        checked={(notifSettings as any)[item.key]} 
                        onChange={() => toggleNotif(item.key as any)} 
                      />
                    </div>
                  ))}
                </CardBody>
              </Card>
            )}

            {/* --- LANGUAGE TAB --- */}
            {activeTab === 'language' && (
              <Card className="border-none shadow-lg ring-1 ring-black/5">
                 <CardHeader className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Language & Region</h2>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Interface Language</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        value={language}
                        onChange={(e) => {
                          setLanguage(e.target.value);
                          toast.success('Language updated');
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option>English</option>
                        <option>Urdu</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* --- APPEARANCE TAB --- */}
            {activeTab === 'appearance' && (
              <Card className="border-none shadow-lg ring-1 ring-black/5">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Theme Settings</h2>
                  <p className="text-sm text-gray-500">Customize how the application looks for you.</p>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { name: 'Light', icon: Sun, desc: 'Classic mode' },
                      { name: 'Dark', icon: Moon, desc: 'Easy on eyes' },
                      { name: 'System', icon: Monitor, desc: 'Follows device' }
                    ].map((t) => (
                      <div
                        key={t.name}
                        onClick={() => setTheme(t.name)}
                        className={`relative p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 flex flex-col items-center justify-center gap-3 h-32 ${
                          theme === t.name 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {theme === t.name && (
                          <div className="absolute top-2 right-2 text-indigo-600">
                            <CheckCircle size={18} />
                          </div>
                        )}
                        <t.icon size={28} />
                        <div className="text-center">
                          <p className="font-bold">{t.name}</p>
                          <p className="text-xs opacity-75">{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* --- BILLING TAB --- */}
            {activeTab === 'billing' && (
              <Card className="border-none shadow-lg ring-1 ring-black/5">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Payment Methods</h2>
                  <p className="text-sm text-gray-500">Securely manage your billing information.</p>
                </CardHeader>
                <CardBody className="p-6 space-y-8">
                  
                  {/* Visual Credit Card */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-2xl w-full max-w-sm shadow-xl mx-auto sm:mx-0">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-sm"></div>
                       <CreditCard size={24} className="text-white/50" />
                    </div>
                    <div className="mb-6">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Card Number</p>
                      <p className="text-xl font-mono tracking-wider">
                         {billingData.cardNumber || '•••• •••• •••• ••••'}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Card Holder</p>
                          <p className="font-medium tracking-wide">{billingData.cardName || 'YOUR NAME'}</p>
                       </div>
                       <div>
                          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Expires</p>
                          <p className="font-mono">{billingData.expiry || 'MM/YY'}</p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="col-span-1 md:col-span-2">
                        <Input 
                           label="Cardholder Name" 
                           value={billingData.cardName} 
                           onChange={(e:any) => setBillingData({...billingData, cardName: e.target.value})} 
                           placeholder="Name on card"
                        />
                     </div>
                     <Input 
                        label="Card Number" 
                        icon={CreditCard} 
                        value={billingData.cardNumber}
                        onChange={(e:any) => setBillingData({...billingData, cardNumber: e.target.value})}
                        placeholder="0000 0000 0000 0000"
                     />
                     <div className="grid grid-cols-2 gap-4">
                        <Input 
                           label="Expiry Date" 
                           placeholder="MM/YY"
                           value={billingData.expiry}
                           onChange={(e:any) => setBillingData({...billingData, expiry: e.target.value})}
                        />
                        <Input 
                           label="CVC / CVV" 
                           placeholder="123"
                           type="password"
                           value={billingData.cvc}
                           onChange={(e:any) => setBillingData({...billingData, cvc: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="flex justify-end">
                    <Button>Update Payment Method</Button>
                  </div>
                </CardBody>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};