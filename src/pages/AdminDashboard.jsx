import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Eye,
  Repeat,
  Calendar,
  Search,
  Download,
  LogOut,
  SlidersHorizontal,
  Heart,
  BarChart2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Check,
  History,
  X,
  Smartphone,
  Monitor,
  RefreshCw,
  MessageSquare,
  Settings,
  Key,
  Save,
  FileJson,
  RotateCcw,
  Globe,
  Lock,
  Layers,
  MapPin,
  CalendarCheck,
  Trash2
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  getAdminVisitors,
  getAdminBlessings,
  updateBlessingStatus,
  deleteVisitorRecord,
  clearAllVisitors,
  deleteBlessingRecord,
  clearAllBlessings,
  restoreDemoRecords,
  isSupabaseConfigured
} from '../lib/supabase';
import { invitationConfig } from '../data/invitationConfig';

export default function AdminDashboard({ user, onLogout, onBackToHome }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.hash.includes('settings') || window.location.search.includes('settings'))) return 'settings';
    if (typeof window !== 'undefined' && window.location.hash.includes('blessings')) return 'blessings';
    if (typeof window !== 'undefined' && window.location.hash.includes('visitors')) return 'visitors';
    return 'overview';
  });
  const [visitors, setVisitors] = useState([]);
  const [blessings, setBlessings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'blessings' | 'new' | 'returning'
  const [sortField, setSortField] = useState('last_visit');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedVisitorForHistory, setSelectedVisitorForHistory] = useState(null);

  // Time Range & Timezone interactive controls
  const [timeRange, setTimeRange] = useState('30days'); // 'today' | '7days' | '30days' | 'all'
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata'); // 'Asia/Kolkata' | 'UTC' | 'local'
  const [timezoneOpen, setTimezoneOpen] = useState(false);

  // Settings tab state
  const [blessingsEnabled, setBlessingsEnabled] = useState(() => localStorage.getItem('nc_setting_blessings_open') !== 'false');
  const [autoApprove, setAutoApprove] = useState(() => localStorage.getItem('nc_setting_auto_approve') !== 'false');
  const [portalLang, setPortalLang] = useState(() => localStorage.getItem('nc_setting_lang') || 'mr');
  const [ambientMotion, setAmbientMotion] = useState(() => localStorage.getItem('nc_setting_motion') !== 'false');

  const [eventDate, setEventDate] = useState(() => localStorage.getItem('nc_ceremony_date') || 'Saturday, 19 December 2026');
  const [eventTime, setEventTime] = useState(() => localStorage.getItem('nc_ceremony_time') || '10:30 AM (सकाळी १०:३० वा. शुभ मुहूर्त)');
  const [eventVenue, setEventVenue] = useState(() => localStorage.getItem('nc_ceremony_venue') || 'Supreme Banquets Hall, Manpada, Thane West, Thane - 400610');

  const [adminUsername, setAdminUsername] = useState(() => localStorage.getItem('nc_admin_username') || 'admin');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passStatus, setPassStatus] = useState(null);
  const [settingsToast, setSettingsToast] = useState(null);

  // Load dashboard data with optional silent background refresh
  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [vRes, bRes] = await Promise.all([
        getAdminVisitors(),
        getAdminBlessings(),
      ]);

      if (vRes.success) {
        setVisitors(vRes.data || []);
        // If a visitor modal is currently open, keep its details updated
        setSelectedVisitorForHistory((current) => {
          if (!current) return null;
          const updated = (vRes.data || []).find(
            (v) => (v.id && v.id === current.id) || 
                   (`${v.first_name}_${v.surname}`.toLowerCase() === `${current.first_name}_${current.surname}`.toLowerCase())
          );
          return updated || current;
        });
      }
      if (bRes.success) setBlessings(bRes.data || []);
    } catch (err) {
      console.warn('Dashboard refresh note:', err);
    } finally {
      setLoading(false);
      if (!isSilent) {
        setTimeout(() => setIsRefreshing(false), 350);
      }
    }
  };

  // Fetch data on mount, setup real-time auto-sync and cross-tab storage listeners
  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 4 seconds so admin sees visitors and blessings live
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 4000);

    // Live cross-tab / window synchronization
    const handleStorage = (e) => {
      if (!e.key || e.key.startsWith('nc_')) {
        loadDashboardData(true);
      }
    };
    const handleVisitorUpdate = () => loadDashboardData(true);
    const handleBlessingUpdate = () => loadDashboardData(true);

    window.addEventListener('storage', handleStorage);
    window.addEventListener('nc_visitor_updated', handleVisitorUpdate);
    window.addEventListener('nc_blessing_updated', handleBlessingUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('nc_visitor_updated', handleVisitorUpdate);
      window.removeEventListener('nc_blessing_updated', handleBlessingUpdate);
    };
  }, []);

  // Format timestamps according to active timezone
  const formatIST = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      const opts = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      if (timezone !== 'local') {
        opts.timeZone = timezone;
      }
      return d.toLocaleString('en-IN', opts);
    } catch {
      return isoString;
    }
  };

  // Aggregated Stats based on active date range
  const stats = useMemo(() => {
    const tz = timezone === 'local' ? undefined : timezone;
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', tz ? { timeZone: tz } : undefined);

    let filteredForStats = visitors;
    if (timeRange === 'today') {
      filteredForStats = visitors.filter((v) => {
        if (!v.last_visit) return false;
        return new Date(v.last_visit).toLocaleDateString('en-CA', tz ? { timeZone: tz } : undefined) === todayStr;
      });
    } else if (timeRange === '7days') {
      const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
      filteredForStats = visitors.filter((v) => new Date(v.last_visit || 0).getTime() >= cutoff);
    } else if (timeRange === '30days') {
      const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
      filteredForStats = visitors.filter((v) => new Date(v.last_visit || 0).getTime() >= cutoff);
    }

    const totalVisits = filteredForStats.reduce((acc, v) => acc + (v.visit_count || 1), 0);
    const uniqueVisitors = filteredForStats.length;
    const repeatVisitors = filteredForStats.filter((v) => (v.visit_count || 1) > 1).length;

    const todayVisits = visitors.filter((v) => {
      if (!v.last_visit) return false;
      const vDate = new Date(v.last_visit).toLocaleDateString('en-CA', tz ? { timeZone: tz } : undefined);
      return vDate === todayStr;
    }).length;

    return { totalVisits, uniqueVisitors, repeatVisitors, todayVisits };
  }, [visitors, timeRange, timezone]);

  // Daily Chart Data (Based on selected time range)
  const dailyChartData = useMemo(() => {
    const tz = timezone === 'local' ? undefined : timezone;
    const daysCount = timeRange === 'today' ? 1 : timeRange === '7days' ? 7 : 14;
    const daysMap = {};
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', tz ? { timeZone: tz, month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric' });
      daysMap[key] = { date: key, visits: 0, unique: 0 };
    }

    visitors.forEach((v) => {
      if (v.last_visit) {
        const key = new Date(v.last_visit).toLocaleDateString('en-IN', tz ? { timeZone: tz, month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric' });
        if (daysMap[key]) {
          daysMap[key].visits += (v.visit_count || 1);
          daysMap[key].unique += 1;
        }
      }
    });

    return Object.values(daysMap);
  }, [visitors, timeRange, timezone]);

  // Monthly Chart Data
  const monthlyChartData = useMemo(() => {
    const monthsMap = {};
    visitors.forEach((v) => {
      if (v.first_visit) {
        const mKey = new Date(v.first_visit).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', year: 'numeric' });
        if (!monthsMap[mKey]) monthsMap[mKey] = { month: mKey, count: 0 };
        monthsMap[mKey].count += (v.visit_count || 1);
      }
    });
    return Object.values(monthsMap);
  }, [visitors]);

  // Filtered & Sorted Visitors
  const filteredVisitors = useMemo(() => {
    return visitors
      .filter((v) => {
        const fullName = `${v.first_name || ''} ${v.surname || ''}`.toLowerCase();
        const matchesName = fullName.includes(searchTerm.toLowerCase());
        const matchesBlessing = Array.isArray(v.blessings) && v.blessings.some((b) => (b.message || '').toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSearch = matchesName || matchesBlessing;

        const isRepeat = (v.visit_count || 1) > 1;
        const hasBlessings = (v.blessings_count || (v.blessings && v.blessings.length) || 0) > 0;

        if (filterType === 'blessings') return matchesSearch && hasBlessings;
        if (filterType === 'new') return matchesSearch && !isRepeat;
        if (filterType === 'returning') return matchesSearch && isRepeat;
        return matchesSearch;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'name') {
          valA = `${a.first_name} ${a.surname}`.toLowerCase();
          valB = `${b.first_name} ${b.surname}`.toLowerCase();
        } else if (sortField === 'first_visit' || sortField === 'last_visit') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        } else if (sortField === 'blessings') {
          valA = a.blessings_count || 0;
          valB = b.blessings_count || 0;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [visitors, searchTerm, filterType, sortField, sortAsc]);

  // CSV Export
  const exportToCsv = () => {
    if (visitors.length === 0) {
      alert('No visitor records to export.');
      return;
    }

    const headers = ['Guest Name', 'Total Visits', 'Blessings Count', 'Visitor Type', 'First Visit (IST)', 'Last Visit (IST)', 'Blessing Messages'];
    const rows = visitors.map((v) => [
      `"${v.first_name} ${v.surname}"`,
      v.visit_count || 1,
      v.blessings_count || (v.blessings?.length) || 0,
      (v.visit_count || 1) > 1 ? 'Returning' : 'New',
      `"${formatIST(v.first_visit)}"`,
      `"${formatIST(v.last_visit)}"`,
      `"${((v.blessings || []).map(b => b.message).join(' | ')).replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Neha_Chinmay_Visitors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Blessings CSV Export
  const exportBlessingsToCsv = () => {
    if (blessings.length === 0) {
      alert('No blessings to export.');
      return;
    }

    const headers = ['Guest Name', 'Blessing Message', 'Status', 'Date & Time (IST)'];
    const rows = blessings.map((b) => [
      `"${b.guest_name || 'Guest'}"`,
      `"${(b.message || '').replace(/"/g, '""')}"`,
      b.approval_status || 'approved',
      `"${formatIST(b.created_at)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Neha_Chinmay_Blessings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Individual Visitor Visit History & Blessings to CSV
  const exportVisitorHistoryToCsv = (visitor) => {
    if (!visitor) {
      alert('No visitor selected.');
      return;
    }

    let csv = `Visitor Profile & History Report\n`;
    csv += `Guest Name:,"${visitor.first_name} ${visitor.surname}"\n`;
    csv += `Total Visits:,${visitor.visit_count || 1}\n`;
    csv += `Total Blessings:,${visitor.blessings_count || (visitor.blessings?.length) || 0}\n`;
    csv += `First Visit:,"${formatIST(visitor.first_visit)}"\n`;
    csv += `Latest Visit:,"${formatIST(visitor.last_visit)}"\n\n`;

    csv += `--- CHRONOLOGICAL VISIT SESSIONS ---\n`;
    csv += `Visit #,Date & Time (IST),Device / Platform,Session ID\n`;
    (visitor.visit_history || []).forEach((h, idx) => {
      csv += `${h.visit_number || ((visitor.visit_history?.length || 1) - idx)},"${formatIST(h.timestamp)}","${h.device || 'Browser'}","${h.session_id || 'session'}"\n`;
    });

    csv += `\n--- GUEST BLESSINGS & WISHES ---\n`;
    csv += `Blessing #,Message,Date & Time (IST),Status\n`;
    (visitor.blessings || []).forEach((b, idx) => {
      csv += `${idx + 1},"${(b.message || '').replace(/"/g, '""')}","${formatIST(b.created_at)}","${b.approval_status || 'approved'}"\n`;
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${visitor.first_name}_${visitor.surname}_Full_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBlessingStatus = async (id, newStatus) => {
    const res = await updateBlessingStatus(id, newStatus);
    if (res.success) {
      setBlessings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, approval_status: newStatus } : b))
      );
    }
  };

  const handleDeleteVisitor = async (visitor) => {
    const fullName = `${visitor.first_name || ''} ${visitor.surname || ''}`.trim() || 'this visitor';
    if (!window.confirm(`Are you sure you want to delete the visitor record for "${fullName}"? This action cannot be undone.`)) {
      return;
    }
    // Immediate optimistic removal from state
    setVisitors((prev) => prev.filter((v) => {
      if (visitor.id && v.id === visitor.id) return false;
      const vName = `${v.first_name || ''} ${v.surname || ''}`.trim().toLowerCase();
      if (fullName && vName === fullName.toLowerCase()) return false;
      return true;
    }));
    const res = await deleteVisitorRecord(visitor.id || visitor.browser_id, fullName);
    if (res.success) {
      await loadDashboardData(true);
      setSettingsToast(`Visitor record for "${fullName}" deleted.`);
      setTimeout(() => setSettingsToast(null), 3000);
    } else {
      alert(`Could not delete visitor record: ${res.error || 'Unknown error'}`);
      await loadDashboardData(true);
    }
  };

  const handleClearAllVisitors = async () => {
    if (!window.confirm('WARNING: Are you sure you want to clear ALL visitor records from the database? This cannot be undone.')) {
      return;
    }
    setVisitors([]);
    const res = await clearAllVisitors();
    if (res.success) {
      await loadDashboardData(true);
      setSettingsToast('All visitor records have been cleared.');
      setTimeout(() => setSettingsToast(null), 3000);
    }
  };

  const handleDeleteBlessing = async (id, guestName) => {
    if (!window.confirm(`Are you sure you want to delete this blessing from ${guestName || 'the guest'}?`)) {
      return;
    }
    setBlessings((prev) => prev.filter((b) => b.id !== id));
    const res = await deleteBlessingRecord(id);
    if (res.success) {
      await loadDashboardData(true);
      setSettingsToast('Blessing record deleted.');
      setTimeout(() => setSettingsToast(null), 3000);
    } else {
      alert(`Could not delete blessing: ${res.error || 'Unknown error'}`);
      await loadDashboardData(true);
    }
  };

  const handleClearAllBlessings = async () => {
    if (!window.confirm('WARNING: Are you sure you want to clear ALL blessings? This cannot be undone.')) {
      return;
    }
    setBlessings([]);
    const res = await clearAllBlessings();
    if (res.success) {
      await loadDashboardData(true);
      setSettingsToast('All blessings have been cleared.');
      setTimeout(() => setSettingsToast(null), 3000);
    }
  };

  const handleRestoreDemoRecords = async () => {
    if (!window.confirm('Restore sample demonstration records for visitors and blessings?')) {
      return;
    }
    await restoreDemoRecords();
    await loadDashboardData(false);
    setSettingsToast('Sample demo records restored successfully!');
    setTimeout(() => setSettingsToast(null), 3000);
  };

  // Settings Handlers
  const handleSaveCeremonyDetails = (e) => {
    e.preventDefault();
    localStorage.setItem('nc_ceremony_date', eventDate);
    localStorage.setItem('nc_ceremony_time', eventTime);
    localStorage.setItem('nc_ceremony_venue', eventVenue);
    setSettingsToast('Ceremony details saved successfully!');
    setTimeout(() => setSettingsToast(null), 3500);
  };

  const handleUpdateCredentials = (e) => {
    e.preventDefault();
    setPassStatus(null);
    const validCurrent = localStorage.getItem('nc_admin_password') || 'admin123';

    if (!currentPass) {
      setPassStatus({ success: false, msg: 'Please enter your current password to authorize changes.' });
      return;
    }

    if (currentPass !== validCurrent) {
      setPassStatus({ success: false, msg: 'Current password is incorrect.' });
      return;
    }

    const trimmedUser = newAdminUsername.trim();
    const trimmedPass = newPass.trim();

    if (!trimmedUser && !trimmedPass) {
      setPassStatus({ success: false, msg: 'Please provide a new username or new password to update.' });
      return;
    }

    let userUpdated = false;
    let passUpdated = false;

    if (trimmedUser) {
      if (trimmedUser.length < 3) {
        setPassStatus({ success: false, msg: 'New username must be at least 3 characters long.' });
        return;
      }
      localStorage.setItem('nc_admin_username', trimmedUser);
      setAdminUsername(trimmedUser);
      userUpdated = true;
    }

    if (trimmedPass) {
      if (trimmedPass.length < 6) {
        setPassStatus({ success: false, msg: 'New password must be at least 6 characters long.' });
        return;
      }
      if (trimmedPass !== confirmPass.trim()) {
        setPassStatus({ success: false, msg: 'New password and confirmation do not match.' });
        return;
      }
      localStorage.setItem('nc_admin_password', trimmedPass);
      passUpdated = true;
    }

    let msg = 'Admin credentials updated successfully!';
    if (userUpdated && passUpdated) {
      msg = `Username updated to "${trimmedUser}" and password updated! Use these on next login.`;
    } else if (userUpdated) {
      msg = `Admin username updated to "${trimmedUser}" successfully!`;
    } else if (passUpdated) {
      msg = 'Admin password updated successfully! Use your new password on next login.';
    }

    setPassStatus({ success: true, msg });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setNewAdminUsername('');
    setTimeout(() => setPassStatus(null), 5000);
  };

  const handleExportFullBackup = () => {
    const backupData = {
      system: "Neha & Chinmay Sakharpuda Portal",
      backup_timestamp: new Date().toISOString(),
      visitors: visitors,
      blessings: blessings,
      total_visitors: visitors.length,
      total_blessings: blessings.length,
      settings: {
        blessingsEnabled,
        autoApprove,
        portalLang,
        ambientMotion,
        eventDate,
        eventTime,
        eventVenue,
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `Neha_Chinmay_Portal_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    document.body.removeChild(dlAnchorElem);
  };

  const handleResetSampleData = () => {
    if (window.confirm("Restore default family visitors and authentic blessings? Your recent visits will be preserved and merged cleanly.")) {
      localStorage.removeItem('nc_local_visitors_log');
      loadDashboardData(false);
      setSettingsToast('Default family visitors and blessings re-synchronized!');
      setTimeout(() => setSettingsToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F040A] text-ivory flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#2B060D] border-r-2 border-gold-champagne/30 p-5 flex flex-col justify-between shadow-2xl">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-gold-champagne/20">
            <div className="w-auto px-3.5 h-11 rounded-full bg-gradient-to-br from-[#641D2B] to-[#310912] border-2 border-gold-champagne flex items-center justify-center text-gold-champagne font-serif font-bold text-sm sm:text-base shadow-gold-glow whitespace-nowrap flex-shrink-0">
              {invitationConfig.couple.monogram}
            </div>
            <div>
              <h1 className="font-serif font-bold text-gold-champagne text-base tracking-wide whitespace-nowrap">
                Neha &amp; Chinmay
              </h1>
              <span className="text-xs text-ivory/70 tracking-wider uppercase font-mono block">
                Admin Dashboard
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-serif font-bold tracking-wide transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-[#641D2B] to-[#4A101D] text-gold-champagne border border-gold-champagne/50 shadow-md'
                  : 'text-ivory/80 hover:text-gold-champagne hover:bg-maroon/60'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('visitors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-serif font-bold tracking-wide transition-all ${
                activeTab === 'visitors'
                  ? 'bg-gradient-to-r from-[#641D2B] to-[#4A101D] text-gold-champagne border border-gold-champagne/50 shadow-md'
                  : 'text-ivory/80 hover:text-gold-champagne hover:bg-maroon/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Visitors ({visitors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('blessings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-serif font-bold tracking-wide transition-all ${
                activeTab === 'blessings'
                  ? 'bg-gradient-to-r from-[#641D2B] to-[#4A101D] text-gold-champagne border border-gold-champagne/50 shadow-md'
                  : 'text-ivory/80 hover:text-gold-champagne hover:bg-maroon/60'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Blessings ({blessings.length})</span>
            </button>

            <button
              onClick={exportToCsv}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-serif font-bold tracking-wide text-ivory/80 hover:text-gold-champagne hover:bg-maroon/60 transition-all"
            >
              <Download className="w-4 h-4 text-gold-champagne" />
              <span>Export (CSV)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-serif font-bold tracking-wide transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[#641D2B] to-[#4A101D] text-gold-champagne border border-gold-champagne/50 shadow-md'
                  : 'text-ivory/80 hover:text-gold-champagne hover:bg-maroon/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="pt-6 border-t border-gold-champagne/20 space-y-2">
          <button
            onClick={onBackToHome}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gold-champagne hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Invitation</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        {/* Top Bar with Title + Interactive Date Range & Timezone Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-gold-champagne/30 mb-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-gold-shimmer">
              {activeTab === 'settings' ? 'Portal & Security Settings' : 'Engagement Website Analytics'}
            </h2>
            <p className="text-xs text-gold-champagne/80 uppercase tracking-widest font-mono mt-1">
              Bride &amp; Groom Private Dashboard (Only for Neha &amp; Chinmay)
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-30">
            {/* Interactive Date Range Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTimeRangeOpen(!timeRangeOpen);
                  setTimezoneOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-full bg-maroon-wine hover:bg-[#4E101D] border border-gold-champagne/50 text-xs text-gold-champagne font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span>
                  {timeRange === 'today' ? 'Today' : timeRange === '7days' ? 'Last 7 Days' : timeRange === '30days' ? 'Last 30 Days' : 'All Time'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gold-champagne/80 transition-transform ${timeRangeOpen ? 'rotate-180' : ''}`} />
              </button>

              {timeRangeOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#24060C] border-2 border-gold-champagne/60 rounded-xl shadow-2xl py-1 z-50 text-xs font-mono">
                  <div className="px-3 py-1.5 text-xs uppercase tracking-wider text-gold-champagne/60 border-b border-gold-champagne/20">
                    Filter Analytics
                  </div>
                  {[
                    { id: 'today', label: 'Today (Last 24h)' },
                    { id: '7days', label: 'Last 7 Days' },
                    { id: '30days', label: 'Last 30 Days' },
                    { id: 'all', label: 'All Time' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setTimeRange(opt.id);
                        setTimeRangeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-maroon-wine transition-colors cursor-pointer ${
                        timeRange === opt.id ? 'text-gold-champagne font-bold bg-maroon-wine/50' : 'text-ivory/80'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {timeRange === opt.id && <Check className="w-3.5 h-3.5 text-gold-champagne" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Timezone Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTimezoneOpen(!timezoneOpen);
                  setTimeRangeOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-maroon-wine/60 hover:bg-maroon-wine border border-gold-champagne/40 text-xs text-ivory/90 hover:text-gold-champagne transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-gold-champagne" />
                <span>{timezone === 'Asia/Kolkata' ? 'Asia/Kolkata' : timezone === 'UTC' ? 'UTC' : 'Local Time'}</span>
                <ChevronDown className={`w-3 h-3 text-gold-champagne/60 transition-transform ${timezoneOpen ? 'rotate-180' : ''}`} />
              </button>

              {timezoneOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#24060C] border-2 border-gold-champagne/60 rounded-xl shadow-2xl py-1 z-50 text-xs font-mono">
                  <div className="px-3 py-1.5 text-xs uppercase tracking-wider text-gold-champagne/60 border-b border-gold-champagne/20">
                    Display Timezone
                  </div>
                  {[
                    { id: 'Asia/Kolkata', label: 'Asia/Kolkata (IST +05:30)' },
                    { id: 'UTC', label: 'UTC (Coordinated Universal)' },
                    { id: 'local', label: 'Device Local Time' },
                  ].map((tzOpt) => (
                    <button
                      key={tzOpt.id}
                      type="button"
                      onClick={() => {
                        setTimezone(tzOpt.id);
                        setTimezoneOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-maroon-wine transition-colors cursor-pointer ${
                        timezone === tzOpt.id ? 'text-gold-champagne font-bold bg-maroon-wine/50' : 'text-ivory/80'
                      }`}
                    >
                      <span>{tzOpt.label}</span>
                      {timezone === tzOpt.id && <Check className="w-3.5 h-3.5 text-gold-champagne" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== OVERVIEW / VISITORS / BLESSINGS MAIN VIEW ==================== */}
        {activeTab !== 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left/Center Columns: Analytics & Tables */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* 5 KPI Summary Cards (Matching Storyboard + Blessings Count) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#310912] border-2 border-gold-champagne/40 shadow-royal">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-ivory/80 font-bold">Total Visits</span>
                  <Eye className="w-4 h-4 text-gold-champagne" />
                </div>
                <span className="text-2xl sm:text-4xl font-serif font-bold text-gold-shimmer">
                  {stats.totalVisits}
                </span>
                <p className="text-xs text-ivory/60 mt-1">Total sessions</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#310912] border-2 border-gold-champagne/40 shadow-royal">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-ivory/80 font-bold">Unique Guests</span>
                  <Users className="w-4 h-4 text-gold-champagne" />
                </div>
                <span className="text-2xl sm:text-4xl font-serif font-bold text-gold-shimmer">
                  {stats.uniqueVisitors}
                </span>
                <p className="text-xs text-ivory/60 mt-1">Browser profiles</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#310912] border-2 border-gold-champagne/40 shadow-royal">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-ivory/80 font-bold">Repeat Visits</span>
                  <Repeat className="w-4 h-4 text-gold-champagne" />
                </div>
                <span className="text-2xl sm:text-4xl font-serif font-bold text-gold-shimmer">
                  {stats.repeatVisitors}
                </span>
                <p className="text-xs text-ivory/60 mt-1">Returned 2+ times</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#310912] border-2 border-gold-champagne/40 shadow-royal">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-ivory/80 font-bold">Today's Visits</span>
                  <Calendar className="w-4 h-4 text-gold-champagne" />
                </div>
                <span className="text-2xl sm:text-4xl font-serif font-bold text-gold-shimmer">
                  {stats.todayVisits}
                </span>
                <p className="text-xs text-ivory/60 mt-1">Last 24h IST</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#310912] border-2 border-gold-champagne/40 shadow-royal col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-ivory/80 font-bold">Blessings</span>
                  <Heart className="w-4 h-4 text-red-400 fill-red-400/40" />
                </div>
                <span className="text-2xl sm:text-4xl font-serif font-bold text-gold-shimmer">
                  {blessings.length}
                </span>
                <p className="text-xs text-ivory/60 mt-1">Wishes in database</p>
              </div>
            </div>

            {/* Charts Section (Visible in Overview) */}
            {(activeTab === 'overview') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Trend Line Chart */}
                <div className="p-6 rounded-2xl bg-[#310912] border-2 border-gold-champagne/40 shadow-royal">
                  <h3 className="font-serif font-bold text-lg text-gold-champagne mb-4">
                    Daily Visits
                  </h3>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A101D" />
                        <XAxis dataKey="date" stroke="#D7B66F" fontSize={11} />
                        <YAxis stroke="#D7B66F" fontSize={11} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#24060C', borderColor: '#D7B66F', borderRadius: '8px' }}
                          labelStyle={{ color: '#D7B66F' }}
                        />
                        <Line type="monotone" dataKey="visits" stroke="#E82C48" strokeWidth={2.5} dot={{ fill: '#FFF3D4', r: 4 }} name="Daily Visits" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Bar Chart */}
                <div className="p-6 rounded-2xl bg-[#310912] border-2 border-gold-champagne/40 shadow-royal">
                  <h3 className="font-serif font-bold text-lg text-gold-champagne mb-4">
                    Visitor Trend (Monthly)
                  </h3>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData.length > 0 ? monthlyChartData : [{ month: 'Nov 2026', count: stats.totalVisits || 1 }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A101D" />
                        <XAxis dataKey="month" stroke="#D7B66F" fontSize={11} />
                        <YAxis stroke="#D7B66F" fontSize={11} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#24060C', borderColor: '#D7B66F', borderRadius: '8px' }}
                          labelStyle={{ color: '#D7B66F' }}
                        />
                        <Bar dataKey="count" fill="#8A182E" radius={[4, 4, 0, 0]} name="Visits" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Visitors List Table with Visit Count & Blessings (Visible in Overview and Visitors Tab) */}
            {(activeTab === 'overview' || activeTab === 'visitors') && (
              <div className="rounded-3xl border-2 border-gold-champagne/40 bg-[#310912] shadow-2xl p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-5 border-b border-gold-champagne/20 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-maroon-wine border border-gold-champagne/50 flex items-center justify-center text-gold-champagne shadow-sm">
                      <Users className="w-5 h-5 text-gold-champagne" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-xl text-gold-champagne">
                          Visitors List – All Guests &amp; Blessings
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-maroon-wine text-xs text-gold-champagne font-mono font-bold">
                          {visitors.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-green-300 font-mono">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                          Live Real-Time Sync Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => loadDashboardData(false)}
                      disabled={isRefreshing}
                      title="Refresh guest logs and blessings"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-champagne/15 hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne font-serif font-bold text-xs uppercase tracking-wider border border-gold-champagne/40 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-gold-champagne' : ''}`} />
                      <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
                    </button>

                    <button
                      onClick={exportToCsv}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={handleClearAllVisitors}
                      title="Clear all visitor records from database"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/50 font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar & Quick Filters */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search visitor by name or blessing text..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory text-xs placeholder-ivory/40 focus:outline-none focus:ring-1 focus:ring-gold-champagne"
                    />
                    <Search className="w-4 h-4 text-gold-champagne/60 absolute left-3.5 top-3" />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all whitespace-nowrap ${
                        filterType === 'all'
                          ? 'bg-gold-champagne text-maroon-dark font-bold shadow-sm'
                          : 'bg-[#24060C] text-ivory/80 hover:text-gold-champagne border border-gold-champagne/30'
                      }`}
                    >
                      All ({visitors.length})
                    </button>
                    <button
                      onClick={() => setFilterType('blessings')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                        filterType === 'blessings'
                          ? 'bg-gold-champagne text-maroon-dark font-bold shadow-sm'
                          : 'bg-[#24060C] text-ivory/80 hover:text-gold-champagne border border-gold-champagne/30'
                      }`}
                    >
                      <Heart className="w-3 h-3 text-red-400 fill-red-400/50" />
                      <span>With Blessings ({visitors.filter(v => (v.blessings_count || (v.blessings?.length) || 0) > 0).length})</span>
                    </button>
                    <button
                      onClick={() => setFilterType('returning')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all whitespace-nowrap ${
                        filterType === 'returning'
                          ? 'bg-gold-champagne text-maroon-dark font-bold shadow-sm'
                          : 'bg-[#24060C] text-ivory/80 hover:text-gold-champagne border border-gold-champagne/30'
                      }`}
                    >
                      Returning ({stats.repeatVisitors})
                    </button>
                    <button
                      onClick={() => setFilterType('new')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold transition-all whitespace-nowrap ${
                        filterType === 'new'
                          ? 'bg-gold-champagne text-maroon-dark font-bold shadow-sm'
                          : 'bg-[#24060C] text-ivory/80 hover:text-gold-champagne border border-gold-champagne/30'
                      }`}
                    >
                      New ({visitors.length - stats.repeatVisitors})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#24060C] border-b border-gold-champagne/30 text-gold-champagne uppercase font-serif tracking-wider">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Visitor Name</th>
                        <th className="p-3">Total Visits</th>
                        <th className="p-3">Blessings Submitted</th>
                        <th className="p-3">First Visit</th>
                        <th className="p-3">Last Visit</th>
                        <th className="p-3">History &amp; Blessings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-champagne/15 text-ivory/90">
                      {filteredVisitors.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-ivory/60 italic">
                            <p className="mb-3 text-sm">No visitor records found.</p>
                            <button
                              onClick={handleRestoreDemoRecords}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-champagne text-maroon-dark font-serif font-bold text-xs uppercase tracking-wider hover:bg-gold-light transition-all cursor-pointer shadow-md"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore Demo Records</span>
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredVisitors.map((v, i) => {
                          const blessingsList = v.blessings || [];
                          const hasBlessings = blessingsList.length > 0;
                          return (
                            <tr key={v.id || v.browser_id || `${v.first_name}_${v.surname}`} className="hover:bg-maroon-wine/40 transition-colors">
                              <td className="p-3 font-mono text-gold-champagne">{i + 1}</td>
                              <td className="p-3 font-semibold text-ivory">
                                <div className="flex items-center gap-2">
                                  <span>{v.first_name} {v.surname}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider ${
                                    (v.visit_count || 1) > 1 
                                      ? 'bg-amber-950/70 border border-amber-500/40 text-amber-300' 
                                      : 'bg-blue-950/70 border border-blue-500/40 text-blue-300'
                                  }`}>
                                    {(v.visit_count || 1) > 1 ? 'Returning' : 'New'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-gold-champagne font-bold text-sm">
                                {v.visit_count || 1}
                              </td>
                              <td className="p-3">
                                {hasBlessings ? (
                                  <button
                                    onClick={() => setSelectedVisitorForHistory(v)}
                                    title="Click to view full blessing text in history modal"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 hover:bg-rose-900/80 transition-colors text-xs font-serif font-semibold text-left max-w-xs truncate cursor-pointer"
                                  >
                                    <Heart className="w-3 h-3 text-rose-400 fill-rose-400 flex-shrink-0" />
                                    <span>
                                      {blessingsList.length} {blessingsList.length === 1 ? 'Blessing' : 'Blessings'}: "{blessingsList[0].message}"
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-ivory/40 italic font-mono text-xs">— None yet</span>
                                )}
                              </td>
                              <td className="p-3 font-mono text-ivory/70 whitespace-nowrap">{formatIST(v.first_visit)}</td>
                              <td className="p-3 font-mono text-ivory/70 whitespace-nowrap">{formatIST(v.last_visit)}</td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedVisitorForHistory(v)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-champagne/15 hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne text-xs font-semibold border border-gold-champagne/40 transition-all cursor-pointer shadow-sm"
                                  >
                                    <History className="w-3.5 h-3.5" />
                                    <span>History ({v.visit_count || 1}V / {blessingsList.length}B)</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVisitor(v)}
                                    title="Delete this visitor record"
                                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white border border-red-500/40 transition-colors cursor-pointer shadow-sm"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Guest Blessings & Wishes Database Table (Visible in Overview and Blessings Tab) */}
            {(activeTab === 'overview' || activeTab === 'blessings') && (
              <div className="rounded-3xl border-2 border-gold-champagne/40 bg-[#310912] shadow-2xl p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-5 border-b border-gold-champagne/20 mb-5">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400 fill-red-400/40" />
                    <h3 className="font-serif font-bold text-xl text-gold-champagne">
                      Guest Blessings &amp; Wishes Database
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-maroon-wine text-xs text-gold-champagne font-mono font-bold">
                      {blessings.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => loadDashboardData(false)}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-champagne/15 hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne font-serif font-bold text-xs uppercase tracking-wider border border-gold-champagne/40 transition-all cursor-pointer shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>Sync</span>
                    </button>

                    <button
                      onClick={exportBlessingsToCsv}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Blessings</span>
                    </button>

                    <button
                      onClick={handleClearAllBlessings}
                      title="Clear all blessings from database"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/50 font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#24060C] border-b border-gold-champagne/30 text-gold-champagne uppercase font-serif tracking-wider">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Guest Name</th>
                        <th className="p-3">Blessing Message</th>
                        <th className="p-3">Date &amp; Time (IST)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-champagne/15 text-ivory/90">
                      {blessings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-ivory/60 italic">
                            <p className="mb-3 text-sm">No blessings submitted yet.</p>
                            <button
                              onClick={handleRestoreDemoRecords}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-champagne text-maroon-dark font-serif font-bold text-xs uppercase tracking-wider hover:bg-gold-light transition-all cursor-pointer shadow-md"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore Demo Records</span>
                            </button>
                          </td>
                        </tr>
                      ) : (
                        blessings.map((b, i) => {
                          const matchedVisitor = visitors.find(v => 
                            `${v.first_name || ''} ${v.surname || ''}`.trim().toLowerCase() === (b.guest_name || '').trim().toLowerCase()
                          );
                          return (
                            <tr key={b.id || i} className="hover:bg-maroon-wine/40 transition-colors">
                              <td className="p-3 font-mono text-gold-champagne">{i + 1}</td>
                              <td className="p-3 font-semibold text-ivory whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span>{b.guest_name || 'Esteemed Guest'}</span>
                                  {matchedVisitor && (
                                    <button
                                      onClick={() => setSelectedVisitorForHistory(matchedVisitor)}
                                      title="View this guest's full visit and blessings history"
                                      className="px-1.5 py-0.5 rounded text-xs bg-gold-champagne/20 text-gold-champagne hover:bg-gold-champagne hover:text-maroon-dark border border-gold-champagne/40 font-mono transition-colors"
                                    >
                                      {matchedVisitor.visit_count || 1} visits
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 font-serif text-sm text-ivory/95 leading-relaxed max-w-md">
                                "{b.message}"
                              </td>
                              <td className="p-3 font-mono text-ivory/70 whitespace-nowrap">
                                {formatIST(b.created_at)}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  b.approval_status === 'approved'
                                    ? 'bg-green-900/60 text-green-300 border border-green-600/50'
                                    : 'bg-amber-900/60 text-amber-300 border border-amber-600/50'
                                }`}>
                                  {b.approval_status || 'approved'}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleBlessingStatus(b.id, b.approval_status === 'approved' ? 'pending' : 'approved')}
                                    className="px-3 py-1 rounded-lg bg-maroon-wine hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne text-xs font-semibold border border-gold-champagne/40 transition-colors cursor-pointer"
                                  >
                                    {b.approval_status === 'approved' ? 'Mark Pending' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBlessing(b.id, b.guest_name)}
                                    title="Delete this blessing record"
                                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-300 hover:text-white border border-red-500/40 transition-colors cursor-pointer shadow-sm"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: "Key Features" Card */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border-2 border-gold-champagne/40 bg-[#310912] p-6 shadow-2xl space-y-4">
              <h3 className="font-serif font-bold text-lg text-gold-champagne pb-3 border-b border-gold-champagne/20">
                Key Features
              </h3>
              
              <ul className="space-y-3.5 text-xs text-ivory/90 font-serif">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold-champagne flex-shrink-0 mt-0.5" />
                  <span>Records Every Visitor &amp; Guest Session Accurately</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold-champagne flex-shrink-0 mt-0.5" />
                  <span>Tracks Returning Guests with Multi-Visit Increments</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold-champagne flex-shrink-0 mt-0.5" />
                  <span>Links All Guest Blessings to Respective Visitor Profiles</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold-champagne flex-shrink-0 mt-0.5" />
                  <span>First &amp; Last Visit Date &amp; Time (IST)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold-champagne flex-shrink-0 mt-0.5" />
                  <span>Daily &amp; Monthly Analytics Visualizations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold-champagne flex-shrink-0 mt-0.5" />
                  <span>Export Visitors &amp; Blessings to CSV in 1 Click</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gold-champagne flex-shrink-0 mt-0.5" />
                  <span>Access Restricted Exclusively for Bride &amp; Groom</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-gold-champagne/20">
                <div className="flex items-center gap-2 text-xs text-gold-champagne/70 font-mono">
                  <ShieldCheck className="w-4 h-4 text-gold-champagne" />
                  <span>Protected by Row Level Security</span>
                </div>
              </div>
            </div>
          </div>

        </div>
        )}

        {/* ==================== SETTINGS MANAGEMENT PANEL ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Success Toast */}
            {settingsToast && (
              <div className="p-4 rounded-2xl bg-green-950/80 border-2 border-green-500/60 text-green-300 font-serif flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{settingsToast}</span>
                </div>
                <button onClick={() => setSettingsToast(null)} className="p-1 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Guest Interaction & Blessings Controls */}
              <div className="rounded-3xl border-2 border-gold-champagne/40 bg-[#310912] p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b border-gold-champagne/20 mb-5">
                    <div className="w-10 h-10 rounded-full bg-maroon-wine border border-gold-champagne/50 flex items-center justify-center text-gold-champagne shadow-sm">
                      <SlidersHorizontal className="w-5 h-5 text-gold-champagne" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-gold-champagne">
                        Guest &amp; Blessings Controls
                      </h3>
                      <p className="text-xs text-ivory/60 font-mono">
                        Configure public website interaction rules
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-serif">
                    {/* Toggle: Blessings Module */}
                    <div className="p-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ivory block text-sm">Accept Guest Blessings</span>
                        <span className="text-xs text-ivory/60">Allow guests to write and submit blessings</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !blessingsEnabled;
                          setBlessingsEnabled(next);
                          localStorage.setItem('nc_setting_blessings_open', next.toString());
                          setSettingsToast(`Guest blessings are now ${next ? 'enabled' : 'paused'}.`);
                          setTimeout(() => setSettingsToast(null), 3000);
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          blessingsEnabled ? 'bg-gold-champagne' : 'bg-maroon-wine border border-gold-champagne/30'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full transition-transform ${
                          blessingsEnabled ? 'bg-maroon-dark translate-x-7' : 'bg-ivory/50 translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle: Auto-Approve */}
                    <div className="p-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ivory block text-sm">Auto-Approve Blessings</span>
                        <span className="text-xs text-ivory/60">Instantly publish blessings without manual moderation</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !autoApprove;
                          setAutoApprove(next);
                          localStorage.setItem('nc_setting_auto_approve', next.toString());
                          setSettingsToast(`Auto-approval is now ${next ? 'active' : 'disabled (manual review required)'}.`);
                          setTimeout(() => setSettingsToast(null), 3000);
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          autoApprove ? 'bg-gold-champagne' : 'bg-maroon-wine border border-gold-champagne/30'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full transition-transform ${
                          autoApprove ? 'bg-maroon-dark translate-x-7' : 'bg-ivory/50 translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Toggle: Royal Animations */}
                    <div className="p-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ivory block text-sm">Royal Animations &amp; Petals</span>
                        <span className="text-xs text-ivory/60">Falling marigold petals, glowing diyas &amp; 3D effects</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !ambientMotion;
                          setAmbientMotion(next);
                          localStorage.setItem('nc_setting_motion', next.toString());
                          setSettingsToast(`Visual animation mode updated.`);
                          setTimeout(() => setSettingsToast(null), 3000);
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          ambientMotion ? 'bg-gold-champagne' : 'bg-maroon-wine border border-gold-champagne/30'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full transition-transform ${
                          ambientMotion ? 'bg-maroon-dark translate-x-7' : 'bg-ivory/50 translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Default Language Selector */}
                    <div className="p-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ivory block text-sm">Default Language</span>
                        <span className="text-xs text-ivory/60">Initial language when guest opens website</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPortalLang('mr');
                            localStorage.setItem('nc_setting_lang', 'mr');
                            setSettingsToast('Default language set to Marathi (मराठी).');
                            setTimeout(() => setSettingsToast(null), 3000);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            portalLang === 'mr' ? 'bg-gold-champagne text-maroon-dark font-bold' : 'bg-maroon-wine text-ivory/70 hover:text-gold-champagne'
                          }`}
                        >
                          मराठी
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPortalLang('en');
                            localStorage.setItem('nc_setting_lang', 'en');
                            setSettingsToast('Default language set to English.');
                            setTimeout(() => setSettingsToast(null), 3000);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            portalLang === 'en' ? 'bg-gold-champagne text-maroon-dark font-bold' : 'bg-maroon-wine text-ivory/70 hover:text-gold-champagne'
                          }`}
                        >
                          English
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Sakharpuda Ceremony Details Quick Edit */}
              <div className="rounded-3xl border-2 border-gold-champagne/40 bg-[#310912] p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b border-gold-champagne/20 mb-5">
                    <div className="w-10 h-10 rounded-full bg-maroon-wine border border-gold-champagne/50 flex items-center justify-center text-gold-champagne shadow-sm">
                      <CalendarCheck className="w-5 h-5 text-gold-champagne" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-gold-champagne">
                        Ceremony Schedule &amp; Venue
                      </h3>
                      <p className="text-xs text-ivory/60 font-mono">
                        Quickly update key ceremony information
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveCeremonyDetails} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-gold-champagne font-serif font-bold mb-1">
                        Ceremony Date
                      </label>
                      <input
                        type="text"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory font-serif focus:outline-none focus:ring-1 focus:ring-gold-champagne"
                      />
                    </div>

                    <div>
                      <label className="block text-gold-champagne font-serif font-bold mb-1">
                        Auspicious Muhurat Time
                      </label>
                      <input
                        type="text"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory font-serif focus:outline-none focus:ring-1 focus:ring-gold-champagne"
                      />
                    </div>

                    <div>
                      <label className="block text-gold-champagne font-serif font-bold mb-1">
                        Ceremony Venue &amp; Location
                      </label>
                      <input
                        type="text"
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory font-serif focus:outline-none focus:ring-1 focus:ring-gold-champagne"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Ceremony Details</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Card 3: Admin Password & Security Change */}
              <div className="rounded-3xl border-2 border-gold-champagne/40 bg-[#310912] p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b border-gold-champagne/20 mb-5">
                    <div className="w-10 h-10 rounded-full bg-maroon-wine border border-gold-champagne/50 flex items-center justify-center text-gold-champagne shadow-sm">
                      <Key className="w-5 h-5 text-gold-champagne" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-gold-champagne">
                        Admin Security &amp; Credentials
                      </h3>
                      <p className="text-xs text-ivory/60 font-mono">
                        Change private username &amp; password
                      </p>
                    </div>
                  </div>

                  {passStatus && (
                    <div className={`p-3 rounded-xl mb-4 text-xs font-mono border ${
                      passStatus.success 
                        ? 'bg-green-950/80 border-green-500/60 text-green-300' 
                        : 'bg-red-950/80 border-red-500/60 text-red-300'
                    }`}>
                      {passStatus.msg}
                    </div>
                  )}

                  <form onSubmit={handleUpdateCredentials} className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-gold-champagne font-serif font-bold">
                            Current Username
                          </label>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gold-champagne/20 text-gold-champagne border border-gold-champagne/40">
                            {adminUsername}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={adminUsername}
                          disabled
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A0307] border border-gold-champagne/20 text-ivory/60 font-mono cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-gold-champagne font-serif font-bold mb-1">
                          New Username (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. neha_chinmay"
                          value={newAdminUsername}
                          onChange={(e) => setNewAdminUsername(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory font-mono focus:outline-none focus:ring-1 focus:ring-gold-champagne"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gold-champagne font-serif font-bold mb-1">
                        Current Password <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        placeholder="Enter current password (default: admin123)"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory font-mono focus:outline-none focus:ring-1 focus:ring-gold-champagne"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gold-champagne font-serif font-bold mb-1">
                          New Password (Optional)
                        </label>
                        <input
                          type="password"
                          placeholder="Min 6 characters"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory font-mono focus:outline-none focus:ring-1 focus:ring-gold-champagne"
                        />
                      </div>
                      <div>
                        <label className="block text-gold-champagne font-serif font-bold mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Repeat new password"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#24060C] border border-gold-champagne/40 text-ivory font-mono focus:outline-none focus:ring-1 focus:ring-gold-champagne"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Update Username &amp; Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Card 4: Database Tools, Backups & Reset */}
              <div className="rounded-3xl border-2 border-gold-champagne/40 bg-[#310912] p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b border-gold-champagne/20 mb-5">
                    <div className="w-10 h-10 rounded-full bg-maroon-wine border border-gold-champagne/50 flex items-center justify-center text-gold-champagne shadow-sm">
                      <FileJson className="w-5 h-5 text-gold-champagne" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-gold-champagne">
                        Data Management &amp; Backups
                      </h3>
                      <p className="text-xs text-ivory/60 font-mono">
                        Export database snapshot or manage logs
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs font-serif">
                    <div className="p-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ivory block text-sm">System Backup (JSON)</span>
                        <span className="text-xs text-ivory/60">Complete export of visitors, sessions, and blessings</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportFullBackup}
                        className="px-3.5 py-1.5 rounded-lg bg-gold-champagne/15 hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne text-xs font-semibold border border-gold-champagne/40 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export JSON</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ivory block text-sm">Reset Sample Visitors &amp; Blessings</span>
                        <span className="text-xs text-ivory/60">Restore pre-seeded family guests while keeping current test sessions</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetSampleData}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Seed</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#24060C] border border-gold-champagne/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ivory block text-sm">Clear Active Guest Session</span>
                        <span className="text-xs text-ivory/60">Allows testing as a fresh first-time guest</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('nc_guest_profile');
                          localStorage.removeItem('nc_current_session_id');
                          setSettingsToast('Current guest profile cleared! You can test as a new guest on the home page.');
                          setTimeout(() => setSettingsToast(null), 3500);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-600/40 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Clear Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== VISITOR VISIT HISTORY & BLESSINGS MODAL ==================== */}
        <AnimatePresence>
          {selectedVisitorForHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-gradient-to-b from-[#3D0B16] via-[#2B060D] to-[#1F040A] border-3 border-gold-champagne/70 rounded-3xl p-6 sm:p-8 shadow-2xl text-ivory my-auto max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedVisitorForHistory(null)}
                  className="absolute top-4 right-4 p-2 text-gold-champagne/70 hover:text-gold-champagne rounded-full hover:bg-maroon-wine/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-gold-champagne/30 mb-5">
                  <div className="w-13 h-13 rounded-full bg-maroon-wine border-2 border-gold-champagne flex items-center justify-center text-gold-champagne shadow-gold-glow flex-shrink-0">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-2xl sm:text-3xl text-gold-shimmer">
                      {selectedVisitorForHistory.first_name} {selectedVisitorForHistory.surname}
                    </h3>
                    <p className="text-xs text-ivory/70 font-mono mt-0.5">
                      Visitor Record ID: {selectedVisitorForHistory.id || selectedVisitorForHistory.browser_id}
                    </p>
                  </div>
                </div>

                {/* Summary Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[#24060C] border border-gold-champagne/30 text-center">
                    <span className="block text-xs uppercase tracking-wider text-gold-champagne/80 font-bold">Total Visits</span>
                    <span className="text-xl sm:text-2xl font-serif font-bold text-gold-champagne">
                      {selectedVisitorForHistory.visit_count || selectedVisitorForHistory.visit_history?.length || 1}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#24060C] border border-gold-champagne/30 text-center">
                    <span className="block text-xs uppercase tracking-wider text-rose-300 font-bold flex items-center justify-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> Blessings
                    </span>
                    <span className="text-xl sm:text-2xl font-serif font-bold text-rose-300">
                      {selectedVisitorForHistory.blessings_count || selectedVisitorForHistory.blessings?.length || 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#24060C] border border-gold-champagne/30 text-center">
                    <span className="block text-xs uppercase tracking-wider text-gold-champagne/80 font-bold">First Visit</span>
                    <span className="text-xs font-mono text-ivory/90 block mt-1">
                      {formatIST(selectedVisitorForHistory.first_visit)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#24060C] border border-gold-champagne/30 text-center">
                    <span className="block text-xs uppercase tracking-wider text-gold-champagne/80 font-bold">Latest Visit</span>
                    <span className="text-xs font-mono text-ivory/90 block mt-1">
                      {formatIST(selectedVisitorForHistory.last_visit)}
                    </span>
                  </div>
                </div>

                {/* Section 1: Detailed Chronological Visit Sessions */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-champagne" />
                      <h4 className="font-serif font-bold text-sm text-gold-champagne uppercase tracking-wider">
                        1. Chronological Visit Sessions Log
                      </h4>
                    </div>
                    <button
                      onClick={() => exportVisitorHistoryToCsv(selectedVisitorForHistory)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold-champagne/20 hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne text-xs font-serif font-bold border border-gold-champagne/40 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Full History CSV</span>
                    </button>
                  </div>

                  <div className="max-h-52 overflow-y-auto rounded-xl border border-gold-champagne/30 bg-[#24060C]/90">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1A0307] border-b border-gold-champagne/30 text-gold-champagne uppercase font-serif tracking-wider sticky top-0">
                        <tr>
                          <th className="p-2.5">Visit #</th>
                          <th className="p-2.5">Date &amp; Time (IST)</th>
                          <th className="p-2.5">Device / Platform</th>
                          <th className="p-2.5">Session Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-champagne/15 text-ivory/90">
                        {(!selectedVisitorForHistory.visit_history || selectedVisitorForHistory.visit_history.length === 0) ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-ivory/50 italic">
                              Initial visit recorded.
                            </td>
                          </tr>
                        ) : (
                          selectedVisitorForHistory.visit_history.map((hist, idx) => (
                            <tr key={idx} className="hover:bg-maroon-wine/30 transition-colors">
                              <td className="p-2.5 font-mono text-gold-champagne font-bold">
                                #{hist.visit_number || ((selectedVisitorForHistory.visit_history?.length || 1) - idx)}
                              </td>
                              <td className="p-2.5 font-mono text-ivory/90">
                                {formatIST(hist.timestamp)}
                              </td>
                              <td className="p-2.5 flex items-center gap-1.5 text-ivory/80">
                                {hist.device?.includes('Mobile') ? (
                                  <Smartphone className="w-3.5 h-3.5 text-gold-champagne/80" />
                                ) : (
                                  <Monitor className="w-3.5 h-3.5 text-gold-champagne/80" />
                                )}
                                <span>{hist.device || 'Web Browser'}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-green-950/70 border border-green-500/50 text-green-300">
                                  Tracked Session
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 2: Blessings Submitted by This Specific Visitor */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                      <h4 className="font-serif font-bold text-sm text-gold-champagne uppercase tracking-wider">
                        2. Blessings &amp; Wishes Submitted by {selectedVisitorForHistory.first_name}
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-xs font-mono text-rose-300 font-bold">
                      {selectedVisitorForHistory.blessings?.length || 0} Blessings
                    </span>
                  </div>

                  {(!selectedVisitorForHistory.blessings || selectedVisitorForHistory.blessings.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-gold-champagne/30 bg-[#24060C]/60 text-center text-xs text-ivory/60 italic">
                      This guest has visited the invitation website but has not yet submitted a blessing message.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-52 overflow-y-auto">
                      {selectedVisitorForHistory.blessings.map((b, idx) => (
                        <div key={b.id || idx} className="p-3.5 rounded-xl border border-gold-champagne/30 bg-[#24060C]/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-serif text-sm text-ivory leading-relaxed italic">
                              "{b.message}"
                            </p>
                            <span className="font-mono text-xs text-ivory/60 mt-1 block">
                              Submitted: {formatIST(b.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              b.approval_status === 'approved'
                                ? 'bg-green-900/60 text-green-300 border border-green-600/50'
                                : 'bg-amber-900/60 text-amber-300 border border-amber-600/50'
                            }`}>
                              {b.approval_status || 'approved'}
                            </span>

                            <button
                              onClick={async () => {
                                const nextStatus = b.approval_status === 'approved' ? 'pending' : 'approved';
                                await handleBlessingStatus(b.id, nextStatus);
                                setSelectedVisitorForHistory(curr => {
                                  if (!curr) return null;
                                  return {
                                    ...curr,
                                    blessings: (curr.blessings || []).map(item => item.id === b.id ? { ...item, approval_status: nextStatus } : item)
                                  };
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-maroon-wine hover:bg-gold-champagne hover:text-maroon-dark text-gold-champagne text-xs font-semibold border border-gold-champagne/40 transition-colors cursor-pointer"
                            >
                              {b.approval_status === 'approved' ? 'Mark Pending' : 'Approve'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gold-champagne/20">
                  <span className="text-xs text-ivory/60 font-mono">
                    Updated live as guest visits or submits wishes
                  </span>

                  <button
                    onClick={() => setSelectedVisitorForHistory(null)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-antique via-gold-champagne to-gold-antique text-maroon-dark font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
