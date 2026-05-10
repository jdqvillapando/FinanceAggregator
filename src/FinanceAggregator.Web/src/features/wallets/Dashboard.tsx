import { useEffect, useState } from 'react';
import agent from '../../app/api/agent';
import type { Wallet } from '../../app/models/wallet';


const Dashboard = () => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        agent.walletService.getWallets()
            .then(response => {
                if (response.isSuccess) setWallets(response.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center">Loading your finances...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">Your Wallets</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wallets.map(wallet => (
                    <div key={wallet.id} className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-xl text-white">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Default Wallet</span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{wallet.currency}</span>
                        </div>
                        <div className="text-4xl font-black mb-1">
                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(wallet.balance)}
                        </div>
                        <p className="text-xs opacity-60 font-mono">ID: {wallet.id}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default Dashboard;