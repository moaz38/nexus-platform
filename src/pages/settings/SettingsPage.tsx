import React, { useState, useRef } from 'react';
import { 
  User, Lock, Bell, Globe, Palette, CreditCard, 
  Upload, Moon, Sun, Monitor, CheckCircle, Shield 
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, login } = useAuth();
  
  // ✅ TAB STATE
  const [activeTab, setActiveTab] = useState('profile');

  // ✅ STATES FOR ALL TABS
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
    newDeals: true
  });

  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('System');

  const [billingData, setBillingData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(user?.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preference updated");
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingData({ ...billingData, [e.target.name]: e.target.value });
  };

  // 🔥 MAIN SAVE FUNCTION
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const data = new FormData();

        data.append('name', formData.name);
        data.append('location', formData.location);
        data.append('bio', formData.bio);
        data.append('companyName', formData.companyName);

        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        const res = await fetch('http://localhost:5001/api/users/profile', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: data
        });

        const updatedUser = await res.json();

        if (res.ok) {
            toast.success("Profile Updated Successfully!");
            
            // ✅ ULTIMATE FIX: TypeScript ko ignore karo aur dono cheezein bhejo
            // @ts-ignore
            login(token, updatedUser); 
            
            setTimeout(() => window.location.reload(), 1000);
        } else {
            toast.error(updatedUser.message || "Update Failed");
        }
    } catch (error) {
        toast.error("Server Error");
    } finally {
        setLoading(false);
    }
  };

  const handleSaveBilling = () => {
    if(!billingData.cardNumber || !billingData.cvc) {
        toast.error("Please enter valid card details");
        return;
    }
    toast.success("Billing Method Saved Successfully!");
  };

  // --- MENU BUTTON ---
  const MenuButton = ({ id, label, icon: Icon }: any) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1 ${
            activeTab === id 
            ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
        <Icon size={18} className={`mr-3 ${activeTab === id ? 'text-indigo-600' : 'text-gray-400'}`} />
        {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600">Manage your profile, preferences, and billing</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* --- LEFT SIDEBAR --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sticky top-24">
            <nav>
              <MenuButton id="profile" label="Profile" icon={User} />
              <MenuButton id="security" label="Security" icon={Lock} />
              <MenuButton id="notifications" label="Notifications" icon={Bell} />
              <MenuButton id="language" label="Language" icon={Globe} />
              <MenuButton id="appearance" label="Appearance" icon={Palette} />
              <MenuButton id="billing" label="Billing & Plans" icon={CreditCard} />
            </nav>
          </div>
        </div>
        
        {/* --- RIGHT CONTENT --- */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1️⃣ PROFILE */}
          {activeTab === 'profile' && (
            <Card>
                <CardHeader>
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                </CardHeader>
                <CardBody className="space-y-8">
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Avatar src={previewUrl} alt={formData.name} size="xl" />
                    <div>
                        <h3 className="font-medium text-gray-900">Profile Photo</h3>
                        <p className="text-sm text-gray-500 mb-3">Min 400x400px, PNG or JPG</p>
                        <div className="flex gap-3">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                    <Input label="Email Address" value={formData.email} disabled />
                    <Input label="Role" value={user.role} disabled />
                    <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Lahore, Pakistan" />
                    <div className="md:col-span-2">
                         <Input label="Company / Startup Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your Company Name" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea name="bio" className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border outline-none min-h-[120px]" 
                      value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..."
                    ></textarea>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button onClick={handleSaveChanges} disabled={loading} className="px-8">{loading ? "Saving..." : "Save Changes"}</Button>
                </div>
                </CardBody>
            </Card>
          )}

          {/* 2️⃣ SECURITY */}
          {activeTab === 'security' && (
            <Card>
                <CardHeader><h2 className="text-lg font-bold text-gray-900">Login & Security</h2></CardHeader>
                <CardBody className="space-y-6">
                <div className="p-4 border border-indigo-100 bg-indigo-50 rounded-xl flex items-start gap-3">
                    <Shield className="text-indigo-600 mt-1" size={20}/>
                    <div>
                        <h3 className="font-bold text-indigo-900">Secure Your Account</h3>
                        <p className="text-sm text-indigo-700">Two-factor authentication adds an extra layer of security.</p>
                    </div>
                    <Button size="sm" className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white">Enable 2FA</Button>
                </div>
                <div className="pt-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                        <Input label="Current Password" type="password" placeholder="••••••••" />
                        <Input label="New Password" type="password" placeholder="••••••••" />
                        <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                        <div className="flex justify-start"><Button variant="outline">Update Password</Button></div>
                    </div>
                </div>
                </CardBody>
            </Card>
          )}

          {/* 3️⃣ NOTIFICATIONS */}
          {activeTab === 'notifications' && (
             <Card>
                <CardHeader><h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2></CardHeader>
                <CardBody className="space-y-0 divide-y divide-gray-100">
                    {[
                        { id: 'emailAlerts', title: 'Email Alerts', desc: 'Receive emails about new messages and meetings.' },
                        { id: 'pushNotifs', title: 'Push Notifications', desc: 'Receive real-time push notifications.' },
                        { id: 'newDeals', title: 'New Deals', desc: 'Get notified when a new investor matches your profile.' },
                        { id: 'marketingEmails', title: 'Marketing', desc: 'Receive news about platform features.' }
                    ].map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between py-4">
                            <div><h3 className="font-medium text-gray-900">{item.title}</h3><p className="text-sm text-gray-500">{item.desc}</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={(notifSettings as any)[item.id]} onChange={() => toggleNotif(item.id)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    ))}
                </CardBody>
             </Card>
          )}

          {/* 4️⃣ LANGUAGE */}
          {activeTab === 'language' && (
             <Card>
                <CardHeader><h2 className="text-lg font-bold text-gray-900">Language & Region</h2></CardHeader>
                <CardBody className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Language</label>
                        <select 
                            value={language} 
                            onChange={(e) => { setLanguage(e.target.value); toast.success(`Language changed to ${e.target.value}`) }}
                            className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="English">English (United States)</option>
                            <option value="Urdu">Urdu (Pakistan)</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                        </select>
                    </div>
                </CardBody>
             </Card>
          )}

          {/* 5️⃣ APPEARANCE */}
          {activeTab === 'appearance' && (
             <Card>
                <CardHeader><h2 className="text-lg font-bold text-gray-900">Appearance</h2></CardHeader>
                <CardBody>
                    <div className="grid grid-cols-3 gap-4">
                        {[ { name: 'Light', icon: Sun }, { name: 'Dark', icon: Moon }, { name: 'System', icon: Monitor } ].map((t) => (
                            <div key={t.name} onClick={() => { setTheme(t.name); toast.success(`Theme set to ${t.name}`) }}
                                className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${theme === t.name ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <t.icon size={24} className={theme === t.name ? 'text-indigo-600' : 'text-gray-500'} />
                                <span className={`font-medium ${theme === t.name ? 'text-indigo-900' : 'text-gray-700'}`}>{t.name}</span>
                                {theme === t.name && <CheckCircle size={16} className="text-indigo-600" />}
                            </div>
                        ))}
                    </div>
                </CardBody>
             </Card>
          )}

          {/* 6️⃣ BILLING */}
          {activeTab === 'billing' && (
             <div className="space-y-6">
                 <Card>
                    <CardHeader className="flex justify-between items-center"><h2 className="text-lg font-bold text-gray-900">Payment Method</h2><div className="flex gap-2"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">VISA</span><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">MASTERCARD</span></div></CardHeader>
                    <CardBody className="space-y-4">
                        <Input label="Name on Card" name="cardName" placeholder="MUHAMMAD MOAZ" value={billingData.cardName} onChange={handleBillingChange} />
                        <Input label="Card Number" name="cardNumber" placeholder="0000 0000 0000 0000" value={billingData.cardNumber} onChange={handleBillingChange} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Expiry Date" name="expiry" placeholder="MM/YY" value={billingData.expiry} onChange={handleBillingChange} />
                            <Input label="CVC" name="cvc" placeholder="123" type="password" value={billingData.cvc} onChange={handleBillingChange} />
                        </div>
                        <Button fullWidth onClick={handleSaveBilling}>Save Payment Method</Button>
                    </CardBody>
                 </Card>
                 <Card>
                     <CardHeader><h2 className="text-lg font-bold text-gray-900">Billing History</h2></CardHeader>
                     <CardBody><p className="text-gray-500 text-sm text-center py-4">No past invoices found.</p></CardBody>
                 </Card>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};