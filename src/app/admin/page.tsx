"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Users,
    Activity,
    Clock,
    MousePointer2,
    TrendingUp,
    Globe,
    ChevronRight,
    Search
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

const ADMIN_EMAIL = "soumyabiswas2004@gmail.com";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const [interactions, setInteractions] = useState<any[]>([]);
    const [userList, setUserList] = useState<any[]>([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user?.email !== ADMIN_EMAIL) {
            router.push("/dashboard");
            return;
        }

        const fetchData = async () => {
            try {
                const [statsRes, onlineRes, interactRes, usersRes] = await Promise.all([
                    fetch("/api/admin/stats"),
                    fetch("/api/admin/online-users"),
                    fetch("/api/admin/interactions"),
                    fetch("/api/admin/users")
                ]);

                setStats(await statsRes.json());
                setOnlineUsers(await onlineRes.json());
                setInteractions(await interactRes.json());
                setUserList(await usersRes.json());
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [session, status, router]);

    if (loading || status === "loading") {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, onClick }: any) => (
        <div
            onClick={onClick}
            className={`bg-[#111] border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-all group ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/50 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-8 relative">
            {/* User List Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowUserModal(false)}></div>
                    <div className="relative bg-[#111] border border-white/10 w-full max-w-4xl max-h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#161616]">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Users className="text-blue-500" /> System Users
                            </h2>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-white/30 text-xs border-b border-white/5 uppercase tracking-widest font-bold">
                                        <th className="pb-4">User</th>
                                        <th className="pb-4">Email</th>
                                        <th className="pb-4">Joined</th>
                                        <th className="pb-4">Logins</th>
                                        <th className="pb-4 text-right">Last Login</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {userList.map((user, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center text-sm font-bold border border-white/5 overflow-hidden">
                                                        {user.avatarUrl ? (
                                                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : user.name?.[0] || 'U'}
                                                    </div>
                                                    <span className="text-sm font-semibold">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-white/50">{user.email}</td>
                                            <td className="py-4 text-sm text-white/40 italic">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 text-sm font-mono text-blue-400">{user.loginCount || 0}</td>
                                            <td className="py-4 text-right text-sm text-white/30">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Admin Command Center</h1>
                    <p className="text-white/40 flex items-center gap-2">
                        <Globe size={16} /> Live monitoring and deep analytics
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                        <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Active Now</p>
                        <p className="text-xl font-bold">{stats?.usersOnlineNow || 0}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    color="text-blue-500 bg-blue-500"
                    onClick={() => setShowUserModal(true)}
                />
                <StatCard title="Total Logins" value={stats?.totalLogins || 0} icon={Activity} color="text-purple-500 bg-purple-500" />
                <StatCard title="Total Interactions" value={stats?.totalInteractions || 0} icon={MousePointer2} color="text-orange-500 bg-orange-500" />
                <StatCard title="Avg Session" value={`${Math.round((stats?.averageSessionDuration || 0) / 60)}m`} icon={Clock} color="text-green-500 bg-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-8">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-500" /> Interaction Velocity
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { name: 'Mon', count: 400 },
                                { name: 'Tue', count: 300 },
                                { name: 'Wed', count: 600 },
                                { name: 'Thu', count: 800 },
                                { name: 'Fri', count: 500 },
                                { name: 'Sat', count: 900 },
                                { name: 'Sun', count: stats?.totalInteractions % 1000 || 1200 },
                            ]}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fff" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#ffffff40" axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#ffffff40" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#fff" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">Live Feed</h2>
                        <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-lg text-white/40">Latest 5</span>
                    </div>
                    <div className="space-y-6">
                        {interactions.slice(0, 5).map((inter, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold border border-white/10">
                                    {inter.email[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/80 truncate">{inter.action}</p>
                                    <p className="text-xs text-white/30 truncate">{inter.email}</p>
                                </div>
                                <div className="text-[10px] text-white/20 whitespace-nowrap mt-1">
                                    {new Date(inter.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 text-white/60">
                        View All Activity <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Users size={20} className="text-blue-500" /> Online Users
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-white/30 text-xs border-b border-white/5 uppercase tracking-widest font-bold">
                                    <th className="pb-4">User</th>
                                    <th className="pb-4">Email</th>
                                    <th className="pb-4">Last Active</th>
                                    <th className="pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {onlineUsers.map((user, i) => (
                                    <tr key={i} className="group">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                                    {user.name?.[0] || 'U'}
                                                </div>
                                                <span className="text-sm font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-white/40">{user.email}</td>
                                        <td className="py-4 text-sm text-white/40">
                                            {Math.round((Date.now() - new Date(user.lastActive).getTime()) / 1000)}s ago
                                        </td>
                                        <td className="py-4 text-right">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-colors">
                                                <Search size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 rotate-12 group-hover:rotate-0 transition-transform">
                        <TrendingUp size={40} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Most Active User</h3>
                    <p className="text-white/40 text-sm mb-6 max-w-[200px]">Top contributor since system launch</p>
                    <div className="bg-white p-6 rounded-2xl w-full max-w-[300px]">
                        <p className="text-black/50 text-xs font-bold uppercase tracking-widest mb-1">Impact Award</p>
                        <p className="text-black text-lg font-bold truncate">{stats?.mostActiveUser?.email || "N/A"}</p>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5">
                            <MousePointer2 size={16} className="text-black/30" />
                            <span className="text-black font-bold">{stats?.mostActiveUser?.interactions || 0} Actions</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
