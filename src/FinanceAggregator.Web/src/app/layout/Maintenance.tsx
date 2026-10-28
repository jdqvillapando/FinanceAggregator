import { TriangleAlert } from 'lucide-react';


const Banner = () => (
    <div className = 'bg-amber-400 text-white p-1 m-0 text-center font-bold shadow-md sticky top-0 z-50'>
        <span className = 'inline-flex items-center gap-1.5 whitespace-nowrap'>
            <TriangleAlert className = 'w-4 h-4 shrink-0' /> System is currently in maintenance mode.
        </span>
    </div>
);

const Notice = () => (
    <div className = 'max-w-lg mx-auto mt-10 w-full'>
        <div className = 'bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 flex flex-col gap-2 text-slate-600'>
            {/* Header Block */}
            <div className = 'pb-1'>
                <h3 className = 'text-base font-semibold text-slate-700 tracking-wide'>
                    Apologies in advance for the inconvenience!
                </h3>
            </div>

            {/* Content Body */}
            <p className = 'text-sm leading-relaxed text-slate-500'>
                In a noble effort <span className = 'italic'>to conserve data center water<span className = 'font-bold text-rose-600'>*</span></span>, a daily scheduled maintenance window<span className = 'font-bold text-rose-600'>**</span> is running every weekday:
            </p>
            
            <ul className = 'list-disc list-inside text-sm text-slate-500 flex flex-col gap-2.5 leading-relaxed'>
                <li>
                    <strong className = 'text-slate-600 font-medium'>Starting 1:00 PM PST (UTC +8):</strong> The system boots into active mode (automatically).
                </li>
                <li>
                    <strong className = 'text-slate-600 font-medium'>Starting 3:00 PM PST (UTC +8):</strong> The system kicks into maintenance mode (automatically). Any active sessions will be terminated on the spot.
                </li>
            </ul>
            
            <p className = 'text-sm leading-relaxed text-slate-500'>
                As for weekends? Maintenance mode stays on full-time so the servers(?) can rest.
            </p>
            
            <hr className = 'border-slate-100' />
            
            {/* Footnote / Disclaimer */}
            <span className = 'text-[0.6rem] text-slate-500 leading-normal block'>
                <span className = 'font-bold text-rose-600'>*</span> Just kidding about the water saving thing <span className = 'italic'>*cries in data center cooling requirements*</span>... I&apos;m just being stingy on cloud bills because I&apos;m unemployed. Serious about the hiring part though, please hire me :)
            </span>
            <span className = 'text-[0.6rem] text-slate-500 leading-normal block'>
                <span className = 'font-bold text-rose-600'>**</span> As you may know, the schedules don&apos;t trigger on time. Based on my research and discussions with my colleagues (a.k.a. Cl**d* &amp; G*m*n*), GitHub Actions&apos; scheduled workflows run on shared, best-effort infrastructure which often causes delays during peak load times. I'll try to solve this issue in the future.
            </span>
        </div>
    </div>
);

const Maintenance = { Banner, Notice };


export default Maintenance;
