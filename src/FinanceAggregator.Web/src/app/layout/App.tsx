import Register from '../../features/auth/Register'
import './App.css'


const App = () => {
  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <nav className="p-6 bg-white shadow-sm mb-12">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black text-indigo-600 tracking-tighter">FINANCE.AGGREGATOR</h1>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">v1.0 Microservices</span>
          </div>
        </nav>

        <main className="container mx-auto px-4">
          <Register />
        </main>
      </div>
    </>
  );
};


export default App;
