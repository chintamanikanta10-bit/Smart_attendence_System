import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, DownloadCloud } from 'lucide-react';

const Holidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchHolidays = () => {
        axios.get('http://localhost:8000/api/holidays/')
            .then(res => setHolidays(res.data))
            .catch(console.error);
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const importHolidays = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`http://localhost:8000/api/fetch_holidays/?year=${year}&country=IN`);
            alert(res.data.message);
            fetchHolidays();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to import holidays");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Holiday Management</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-end space-x-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                    <input type="number" value={year} onChange={e => setYear(e.target.value)}
                        className="mt-1 block w-24 rounded-lg border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <button onClick={importHolidays} disabled={loading}
                    className="px-6 py-2 h-[42px] bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2">
                    <DownloadCloud className="w-4 h-4" /> <span>{loading ? 'Importing...' : 'Auto-Import Calendar Holidays'}</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {holidays.length === 0 ? <div className="p-8 text-center text-slate-500">No holidays loaded for this system. Click the import button.</div> : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Holiday Name</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {holidays.map((h, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                                        <span>{h.holiday_date}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{h.holiday_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default Holidays;
