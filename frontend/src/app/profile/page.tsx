'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Lock, ShoppingBag, 
  Heart, LogOut, Shield, Plus, Trash2, Edit2, 
  CheckCircle2, ChevronRight, Package, CreditCard,
  Clock, Star, Settings, Bell, SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { userAPI, addressAPI, authAPI, orderAPI } from '@/lib/api';

/* ─── Components ────────────────────────────────────────── */

const StatBlock = ({ icon: Icon, label, value, color, onClick }: any) => (
  <motion.button 
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex-1 min-w-[150px] p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all text-left relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 blur-3xl -mr-12 -mt-12 group-hover:bg-accent/20 transition-all`} />
    <Icon className={`w-5 h-5 mb-4 ${color === 'accent' ? 'text-accent' : 'text-white/20'}`} />
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">{label}</p>
    <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
  </motion.button>
);

const SectionHeader = ({ title, desc, action }: any) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <h2 className="text-3xl font-serif font-black text-white uppercase tracking-tight">{title}</h2>
      <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black mt-2">{desc}</p>
    </div>
    {action}
  </div>
);

/* ─── Main Page ─────────────────────────────────────────── */

function ProfileContent() {
  const { token, user, logout, setAuth } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'orders', 'addresses', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Data State
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  
  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', addressLine1: '', city: '', state: '', pincode: '', type: 'home', landmark: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'Profile Details', icon: Settings },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'security', label: 'Security Settings', icon: Shield },
  ];

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return; }
    
    const loadDashboard = async () => {
      try {
        const [profRes, orderRes, addrRes] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getMyOrders(),
          addressAPI.getAll()
        ]);
        
        const u = profRes.data?.data?.user || profRes.data?.data || profRes.data?.user;
        setProfile(u);
        setName(u?.name || '');
        setEmail(u?.email || '');
        setPhone(u?.phone || '');
        
        setOrders(orderRes.data?.data || []);
        setAddresses(addrRes.data?.data || []);
        fetchWishlist();
      } catch (err) {
        console.error('Dashboard Load Error:', err);
      }
      setLoading(false);
    };
    
    loadDashboard();
  }, [token, router]);



  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await addressAPI.update(editingId, addrForm);
        toast.success('Address Updated');
      } else {
        await addressAPI.create(addrForm);
        toast.success('Address Saved');
      }
      const { data } = await addressAPI.getAll();
      setAddresses(data.data || []);
      setShowAddAddress(false);
      setEditingId(null);
      setAddrForm({ name: '', phone: '', addressLine1: '', city: '', state: '', pincode: '', type: 'home', landmark: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally { setSaving(false); }
  };

  const handleEditInitiate = (addr: any) => {
    setEditingId(addr.id.toString());
    setAddrForm({
      name: addr.name || addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || addr.zipCode || '',
      type: addr.type?.toLowerCase() || 'home',
      landmark: addr.landmark || ''
    });
    setShowAddAddress(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await addressAPI.delete(id);
      setAddresses(addresses.filter(a => a.id.toString() !== id));
      toast.success('Address Deleted');
    } catch { toast.error('Failed to delete address'); }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await addressAPI.setDefault(id);
      const { data } = await addressAPI.getAll();
      setAddresses(data.data || []);
      toast.success('Default Address Updated');
    } catch { toast.error('Failed to set default address'); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({ name, email, phone });
      setAuth(data.data?.user || data.data || data.user, token!);
      toast.success('Identity Updated');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); router.push('/'); };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black">
      <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] text-white/20 uppercase tracking-[0.6em]">Authorizing Access</p>
    </div>
  );

  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-black pt-24 lg:pt-32 pb-32 overflow-hidden">
      {/* Visual Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Elite Identity Header */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent to-red-900 p-[2px] shadow-2xl glow-red">
                  <div className="w-full h-full rounded-[22px] bg-black flex items-center justify-center text-3xl font-black text-white">
                    {name?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-accent flex items-center justify-center border-4 border-black">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.5em] mb-2">Member • Platinum Tier</p>
                <h1 className="text-4xl lg:text-5xl font-serif font-black text-white uppercase tracking-tight">{name}</h1>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
              <button onClick={handleLogout} className="px-8 py-4 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-black text-white/40 uppercase tracking-[0.4em] hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-3 group">
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
              </button>
            </motion.div>
          </div>
        </header>

        {/* The Metrics Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatBlock icon={Package} label="Open Orders" value={activeOrdersCount} color="accent" onClick={() => setActiveTab('orders')} />
          <StatBlock icon={Heart} label="Saved Pieces" value={wishlistItems.length} color="white" onClick={() => router.push('/wishlist')} />
          <StatBlock icon={MapPin} label="Saved Addresses" value={addresses.length} color="white" onClick={() => setActiveTab('addresses')} />
          <StatBlock icon={Shield} label="Security" value="Encrypted" color="white" onClick={() => setActiveTab('security')} />
        </div>

          {/* Command Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            {/* Desktop Vertical Sidebar */}
            <div className="hidden lg:block space-y-4 sticky top-32">
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1">
                {tabs.map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] transition-all ${
                      activeTab === tab.id ? 'bg-accent text-white glow-red shadow-2xl' : 'text-white/20 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'fill-white/20' : ''}`} /> {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="p-8 rounded-3xl bg-accent/5 border border-accent/10 relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 w-24 h-24 text-accent/10 group-hover:scale-125 transition-transform">
                  <Star className="w-full h-full fill-current" />
                </div>
                <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-2">Elite Perk</h4>
                <p className="text-xs text-white/50 leading-relaxed font-black uppercase tracking-tight">Enjoy free concierge delivery on your next 3 orders.</p>
              </div>
            </div>

            {/* Mobile Horizontal Omni-Dock */}
            <div className="lg:hidden sticky top-20 z-40 bg-black/80 backdrop-blur-xl -mx-4 px-4 py-4 mb-8 overflow-x-auto no-scrollbar scroll-smooth flex gap-3 border-b border-white/5">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-500 ${
                    activeTab === tab.id ? 'bg-accent text-white shadow-2xl glow-red' : 'bg-white/5 text-white/40'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Feed */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                  
                  {/* Personal Information */}
                  <section>
                    <SectionHeader title="Personal Information" desc="Manage your profile settings" 
                      action={
                        <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black text-accent uppercase tracking-[0.4em] hover:underline">
                          {isEditing ? 'Cancel Edit' : 'Edit Details'}
                        </button>
                      } 
                    />
                    
                    <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5">
                      <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Full Name</label>
                          {isEditing ? (
                            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-sm text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide" />
                          ) : (
                            <p className="text-xl font-black text-white tracking-tight">{name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Email Address</label>
                          {isEditing ? (
                            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-sm text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide" />
                          ) : (
                            <p className="text-xl font-black text-white tracking-tight">{email}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Phone Number</label>
                          {isEditing ? (
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-sm text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide" />
                          ) : (
                            <p className="text-xl font-black text-white tracking-tight">{phone || 'Not Connected'}</p>
                          )}
                        </div>
                        {isEditing && (
                          <div className="md:col-span-2 flex justify-end">
                            <button type="submit" disabled={saving} className="px-12 py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-2xl glow-red-hover">
                              {saving ? 'Syncing...' : 'Save Profile'}
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  </section>

                  {/* Recent Activity Snippet */}
                  <section>
                    <SectionHeader title="Recent Activity" desc="Last interactions in the showroom" 
                      action={<button onClick={() => setActiveTab('orders')} className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white">View History</button>} 
                    />
                    {orders.length > 0 ? (
                      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                            <Package className="w-8 h-8 text-accent" />
                          </div>
                          <div>
                            <p className="text-xl font-black text-white tracking-tight">Order #{orders[0].id.toString().slice(-6)}</p>
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black mt-1">Status: <span className="text-accent">{orders[0].status}</span></p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20" />
                      </div>
                    ) : (
                      <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">No showroom activity yet</p>
                      </div>
                    )}
                  </section>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  <SectionHeader title="Order History" desc="Complete archive of your collections" />
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 relative">
                              {order.OrderItems?.[0]?.Product?.images?.[0]?.url ? (
                                <Image src={order.OrderItems[0].Product.images[0].url} alt="" fill className="object-cover" />
                              ) : <Package className="w-8 h-8 text-white/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Order #{order.id.toString().slice(-8)}</p>
                              <p className="text-xl font-black text-white tracking-tight">{order.OrderItems?.[0]?.Product?.name || 'Multiple Pieces'}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.4em] ${
                                  order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-accent/10 text-accent'
                                }`}>{order.status}</span>
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">{new Date(order.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] mb-1">Total Value</p>
                              <p className="text-2xl font-black text-white tracking-tighter">₹{order.totalAmount.toLocaleString()}</p>
                            </div>
                            <Link href={`/orders/${order.id}`} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                              <ChevronRight className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <ShoppingBag className="w-12 h-12 text-white/5 mx-auto mb-6" />
                        <p className="text-[11px] text-white/20 uppercase tracking-[0.6em] font-black">Your archive is empty</p>
                        <Link href="/shop" className="mt-8 inline-block px-10 py-4 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent hover:text-white transition-all">Enter Showroom</Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  <SectionHeader title="Saved Addresses" desc="Manage your shipping addresses" 
                    action={
                      <button 
                        onClick={() => setShowAddAddress(!showAddAddress)} 
                        className="px-8 py-4 rounded-2xl bg-accent text-white text-[10px] font-black uppercase tracking-[0.3em] glow-red shadow-2xl hover:bg-accent-hover transition-all"
                      >
                        {showAddAddress ? 'Cancel' : 'Add New Address'}
                      </button>
                    } 
                  />

                  <AnimatePresence>
                    {showAddAddress && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="p-10 rounded-3xl bg-white/[0.02] border border-accent/20 shadow-2xl mb-12">
                          <h3 className="text-xl font-black text-white tracking-tight mb-8 uppercase">
                            {editingId ? 'Edit Address Details' : 'Add New Shipping Address'}
                          </h3>
                          <form onSubmit={handleAddAddress} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Recipient Name</label>
                                <input value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} required placeholder="Full Name" className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide font-semibold" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Phone Number</label>
                                <input value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} required placeholder="Phone Number" className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide font-semibold" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Street Address / Building</label>
                                <input value={addrForm.addressLine1} onChange={(e) => setAddrForm({ ...addrForm, addressLine1: e.target.value })} required placeholder="Street address or building details..." className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide font-semibold" />
                              </div>
                              <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Address Type</label>
                                <div className="flex gap-4">
                                  {['home', 'office'].map((type) => (
                                    <button 
                                      key={type}
                                      type="button"
                                      onClick={() => setAddrForm({ ...addrForm, type })}
                                      className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        addrForm.type === type ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-white/40 hover:border-white/30'
                                      }`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">City</label>
                                <input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} required placeholder="City" className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide font-semibold" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">State</label>
                                <input value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} required placeholder="State" className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide font-semibold" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Zip Code</label>
                                <input value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })} required placeholder="Zip Code" className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide font-semibold" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Landmark</label>
                              <input value={addrForm.landmark} onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })} placeholder="E.g. Near Sovereign Tower (Optional)..." className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-wide font-semibold" />
                            </div>

                            <button type="submit" disabled={saving} className="px-12 py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-2xl glow-red-hover">
                              {saving ? 'Syncing...' : (editingId ? 'Update Address' : 'Save Address')}
                            </button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`p-10 rounded-3xl border transition-all relative overflow-hidden group ${addr.isDefault ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                        <div className="flex items-center justify-between mb-8">
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">{addr.type || 'Home'}</span>
                          {addr.isDefault && <CheckCircle2 className="w-4 h-4 text-accent" />}
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight mb-2">{addr.name || addr.fullName}</h3>
                        <div className="text-[11px] text-white/40 font-black uppercase tracking-[0.4em] space-y-1 mb-10 leading-relaxed">
                          <p>{addr.addressLine1 || addr.street}</p>
                          <p>{addr.city}, {addr.state} • {addr.pincode || addr.zipCode}</p>
                          <p className="pt-2 text-white/20 italic">{addr.phone}</p>
                        </div>
                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                          <div className="flex gap-6">
                            <button onClick={() => handleEditInitiate(addr)} className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-all">Edit Address</button>
                            {!addr.isDefault && (
                              <button onClick={() => handleSetDefaultAddress(addr.id.toString())} className="text-[10px] font-black text-accent/50 uppercase tracking-[0.4em] hover:text-accent transition-all">Set Default</button>
                            )}
                          </div>
                          <button onClick={() => handleDeleteAddress(addr.id.toString())} className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.4em] hover:text-red-500 transition-all">Delete</button>
                        </div>
                      </div>
                    ))}
                    {addresses.length === 0 && !showAddAddress && (
                      <div className="md:col-span-2 py-32 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <MapPin className="w-12 h-12 text-white/5 mx-auto mb-6" />
                        <p className="text-[11px] text-white/20 uppercase tracking-[0.4em] font-black">No saved addresses found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                  <SectionHeader title="Security Settings" desc="Protect your account security" />
                  <div className="max-w-xl p-12 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl">
                    <form className="space-y-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Current Password</label>
                        <input type="password" placeholder="••••••••••••" className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-widest font-semibold" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">New Password</label>
                        <input type="password" placeholder="••••••••••••" className="w-full rounded-2xl bg-white/5 border border-white/5 py-4 px-5 text-xs text-white placeholder:text-white/10 outline-none focus:border-accent/30 transition-all shadow-inner tracking-widest font-semibold" />
                      </div>
                      <button className="w-full py-5 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-2xl glow-red-hover">Update Password</button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-white/20 uppercase tracking-[0.6em]">Authorizing Access</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
