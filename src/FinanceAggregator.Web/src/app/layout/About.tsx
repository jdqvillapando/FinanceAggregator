import React from 'react';
import { useNavigate } from 'react-router';
import parse from 'html-react-parser';
import { ChevronLeft } from 'lucide-react'; 

import licenseText from '../../../../../LICENSE?raw';

import { useAppSelector } from '../../app/store/configureStore';

import { Button } from '../../common/components/Button';
import { about } from '../../common/lib';
import { MAINTENANCE_MODE_ENABLED } from '../../common/utils/constants';

import { MaintenanceModeMain } from './Maintenance';


const About: React.FC = () => {
    const { user } = useAppSelector(state => state.auth);
    const navigate = useNavigate();

    const location = user ? 'Dashboard' : 'Landing Page'

    
    return <>
        { MAINTENANCE_MODE_ENABLED ? <MaintenanceModeMain /> : <></> }
        <div className = 'max-w-4xl mx-auto p-6'>
            { /* Main Card Panel */ }
            <div className = 'bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 flex flex-col gap-8 text-slate-600'>
            
                { /* Header Block */ }
                <div className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6'>
                    <div>
                        <h1 className = 'text-2xl font-bold text-slate-700'>About this Project</h1>
                        <p className = 'text-sm text-slate-400 mt-1'>
                            { about.subtitle }
                        </p>
                    </div>
                    <Button
                        variant = 'secondary'
                        className = 'self-start sm:self-auto py-1 px-2 text-xs'
                        onClick = {() => navigate('/')}
                    >
                        <ChevronLeft />Back to { location }
                    </Button>
                </div>

                { /* System Overview */ }
                <div className = 'flex flex-col gap-2'>
                    <h2 className = 'text-base font-semibold text-slate-700 uppercase tracking-wide text-xs'>
                        { about.introduction.sectionTitle }
                    </h2>
                    <p className = 'text-sm leading-relaxed text-slate-500'>
                        { parse(about.introduction.description) }
                    </p>
                </div>

                <hr className = 'border-slate-100' />

                { /* Deployed Cloud Workflow */ }
                <div className = 'flex flex-col gap-3'>
                    <h2 className = 'text-base font-semibold text-slate-700 uppercase tracking-wide text-xs'>
                        { about.workflow.sectionTitle }
                    </h2>
                    <ol className = 'list-decimal list-inside text-sm text-slate-500 flex flex-col gap-2.5 leading-relaxed'>
                        { about.workflow.items.map((item) => <li key = { item.name }><strong className = 'text-slate-600 font-medium'>{ item.name }:</strong> { parse(item.description) }</li>) }
                    </ol>
                </div>

                <hr className = 'border-slate-100' />

                { /* Cloud Microservices Mesh */ }
                <div className = 'flex flex-col gap-3'>
                    <h2 className = 'text-base font-semibold text-slate-700 uppercase tracking-wide text-xs'>
                        { about.microservices.sectionTitle }
                    </h2>
                    <div className = 'grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {
                            about.microservices.items.map((svc) => (
                                <div
                                    key = { svc.name } 
                                    className = 'p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1'
                                >
                                    <h3 className = 'text-sm font-semibold text-indigo-900/80'>{ svc.name }</h3>
                                    <p className = 'text-xs text-slate-500 leading-normal'>{ svc.description }</p>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <hr className = 'border-slate-100' />

                { /* Tech Stack Table */ }
                <div className = 'flex flex-col gap-3'>
                    <h2 className = 'text-base font-semibold text-slate-700 uppercase tracking-wide text-xs'>
                        { about.techStack.sectionTitle }
                    </h2>
                    <div className = 'overflow-x-auto'>
                        <table className = 'w-full text-left border-collapse text-xs'>
                            <thead>
                                <tr className = 'border-b border-slate-100 text-slate-400 font-medium'>
                                    { about.techStack.tableHeaders.map((item, index) => <th className = 'py-2 px-2' key = { index }>{ item }</th>) }
                                </tr>
                            </thead>
                            <tbody className = 'divide-y divide-slate-50'>
                                {
                                    about.techStack.items.map((item) => (
                                        <tr
                                            key = { item.category }
                                            className = 'hover:bg-slate-50/60 transition-colors'
                                        >
                                            <td className = 'py-2.5 px-2 font-medium text-slate-600'>{ item.category }</td>
                                            <td className = 'py-2.5 px-2 text-slate-500'>{ item.detail }</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr className = 'border-slate-100' />

                <div className = 'flex flex-col gap-3'>
                    <h2 className = 'text-base font-semibold text-slate-700 uppercase tracking-wide text-xs'>
                        Repository & Usage License
                    </h2>
                    <pre className = 'bg-slate-300 text-xs leading-relaxed text-slate-500 p-2'>
                        { licenseText }
                    </pre>
                </div>
            </div>
        </div>
    </>;
};


export default About;