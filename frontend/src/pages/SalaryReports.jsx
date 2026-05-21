import React, { useState } from 'react';
import axios from 'axios';
import { Calculator, Download, Mail } from 'lucide-react';

const SalaryReports = () => {
    const [salaryData, setSalaryData] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState('5');
    const [year, setYear] = useState('2026');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [sendEmails, setSendEmails] = useState(false);

    React.useEffect(() => {
        fetchUploadedFiles();
    }, []);

    const fetchUploadedFiles = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/uploaded_files/');
            console.log(res.data);
            setUploadedFiles(res.data);
            if (res.data.length > 0) {
                setSelectedFile(res.data[0].filename);
            }
        } catch (e) {
            console.error("Failed to load uploaded files", e);
        }
    };

    const onCalculate = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`http://localhost:8000/api/calculate_salary/?month=${month}&year=${year}&send_email=${sendEmails}`);
            setSalaryData(res.data);

            const req = await axios.get(`http://localhost:8000/api/leave_balances/?month=${month}&year=${year}`);
            setLeaveBalances(req.data);
        } catch (e) {
            alert("Error calculating salary");
        }
        setLoading(false);
    };

    const onCalculateByFile = async () => {
        if (!selectedFile) return;
        setLoading(true);
        try {
            const res = await axios.post(`http://localhost:8000/api/calculate_salary_file/?filename=${encodeURIComponent(selectedFile)}&send_email=${sendEmails}`);
            const { month: fileMonth, year: fileYear, results } = res.data;
            setMonth(String(fileMonth));
            setYear(String(fileYear));
            setSalaryData(results);

            const req = await axios.get(`http://localhost:8000/api/leave_balances/?month=${fileMonth}&year=${fileYear}`);
            setLeaveBalances(req.data);
        } catch (e) {
            alert(e.response?.data?.detail || "Error calculating salary by file");
        }
        setLoading(false);
    };

    const handleExportCSV = () => {
        if (!salaryData || salaryData.length === 0) {
            alert('No salary data to export.');
            return;
        }

        const headers = [
            'Employee ID', 'Employee Name', 'Present Days', 'Leave Days', 'Previous CL Balance', 'Current CL',
            'Total Available CL', 'Used CL', 'Remaining CL', 'Previous Comp-Off', 'Earned Comp-Off', 'Available Comp-Off',
            'Used Comp-Off', 'Remaining Comp-Off', 'LOP Days', 'Salary Deduction', 'Final Salary'
        ];

        const rows = salaryData.map(r => [
            r.employee_id,
            r.employee_name,
            r.present_days,
            r.leave_days,
            r.previous_cl ?? 0,
            r.current_cl ?? 0,
            r.total_available_cl ?? 0,
            r.used_cl ?? 0,
            r.remaining_cl ?? 0,
            r.previous_comp_off ?? 0,
            r.monthly_comp_off_earned ?? 0,
            r.total_available_comp_off ?? 0,
            r.used_comp_off ?? 0,
            r.remaining_comp_off ?? 0,
            r.lop_days ?? 0,
            r.deduction != null ? Number(r.deduction).toFixed(2) : 0,
            r.final_salary != null ? Number(r.final_salary).toFixed(2) : 0
        ]);

        const csvContent = [headers, ...rows].map(e => e.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary_${month}_${year}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Salary & Leave Reports</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="sendEmails"
                        checked={sendEmails}
                        onChange={e => setSendEmails(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="sendEmails" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                        <Mail className="w-4 h-4" />
                        <span>Send salary slips via email to employees</span>
                    </label>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Calculate from Uploaded Excel</h2>
                    <div className="flex items-end space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Excel File</label>
                            <select value={selectedFile} onChange={e => setSelectedFile(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                                {uploadedFiles.map(f => {
                                    const monthNames = {
                                        1: "January", 2: "February", 3: "March", 4: "April",
                                        5: "May", 6: "June", 7: "July", 8: "August",
                                        9: "September", 10: "October", 11: "November", 12: "December"
                                    };
                                    const monthStr = monthNames[f.month] || f.month;
                                    return (
                                        <option key={f.filename} value={f.filename}>
                                            {f.filename} ({monthStr} {f.year})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <button onClick={onCalculateByFile} disabled={loading || !selectedFile}
                            className="px-6 py-2 h-[42px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
                            <Calculator className="w-4 h-4" /> <span>{loading ? 'Processing...' : 'Calculate via Excel'}</span>
                        </button>
                    </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Calculate Manually by Month</h2>
                    <div className="flex items-end space-x-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                            <select value={month} onChange={e => setMonth(e.target.value)}
                                className="mt-1 block w-44 rounded-lg border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                            <input type="number" value={year} onChange={e => setYear(e.target.value)}
                                className="mt-1 block w-32 rounded-lg border-slate-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <button onClick={onCalculate} disabled={loading}
                            className="px-6 py-2 h-[42px] bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center space-x-2">
                            <Calculator className="w-4 h-4" /> <span>{loading ? 'Processing...' : 'Run Processing'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {salaryData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Salary Summary ({month}/{year})</h2>
                        <button onClick={handleExportCSV} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                            <Download className="w-4 h-4" /> <span>Export CSV</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Present Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Leave Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Previous CL Balance</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current CL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Available CL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Used CL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Remaining CL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Previous Comp-Off</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Earned Comp-Off</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Available Comp-Off</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Used Comp-Off</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Remaining Comp-Off</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">LOP Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salary Deduction</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Final Salary</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {salaryData.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.employee_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.employee_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{row.present_days}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.leave_days}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.previous_cl || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.current_cl || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.total_available_cl || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.used_cl || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{row.remaining_cl || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.previous_comp_off || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.monthly_comp_off_earned || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.total_available_comp_off || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.used_comp_off || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{row.remaining_comp_off || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">{row.lop_days}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">₹{row.deduction?.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">₹{row.final_salary?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SalaryReports;
