import { TriangleAlert } from 'lucide-react';


export const MaintenanceModeMain = () => {
    return <div className="bg-amber-400 text-white p-4 text-center font-bold shadow-md sticky top-0 z-50">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <TriangleAlert className="w-4 h-4 shrink-0" /> System is currently in maintenance mode.
        </span>
    </div>;
};