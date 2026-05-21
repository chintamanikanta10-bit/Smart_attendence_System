import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, X, Trash2, Edit2 } from 'lucide-react';

const Employees = () => {
    const [emps, setEmps] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEmp, setEditingEmp] = useState(null);
    const [form, setForm] = useState({ employee_id: '', employee_name: '', department: 'General', salary: 30000, email: '' });
    const [editForm, setEditForm] = useState({});

    const fetchEmps = () => {
        axios.get('http://localhost:8000/api/employees/').then(res => setEmps(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchEmps();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/employees/', form);
            setShowModal(false);
            setForm({ employee_id: '', employee_name: '', department: 'General', salary: 30000, email: '' });
            fetchEmps();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to add employee");
        }
    };

    const handleEdit = (emp) => {
        setEditingEmp(emp);
        setEditForm({ ...emp });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/employees/${editingEmp.employee_id}`, editForm);
            setShowEditModal(false);
            setEditingEmp(null);
            fetchEmps();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to update employee");
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Employees Directory</h1>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700">
                    <PlusCircle className="w-5 h-5" /> <span>Add Employee</span>
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAdd} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
                        <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Employee ID</label>
                                <input required type="text" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <input required type="text" value={form.employee_name} onChange={e => setForm({ ...form, employee_name: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email (Optional)</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Department</label>
                                <input required type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Salary</label>
                                <input required type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700">Save Employee</button>
                        </div>
                    </form>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
                        <button type="button" onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Employee ID</label>
                                <input disabled type="text" value={editForm.employee_id || ''} onChange={e => setEditForm({ ...editForm, employee_id: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2 bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <input type="text" value={editForm.employee_name || ''} onChange={e => setEditForm({ ...editForm, employee_name: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email (Optional)</label>
                                <input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Department</label>
                                <input type="text" value={editForm.department || ''} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Salary</label>
                                <input type="number" value={editForm.salary || ''} onChange={e => setEditForm({ ...editForm, salary: e.target.value })} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm border p-2" />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700">Update Employee</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {emps.length === 0 ? <div className="p-8 text-center text-slate-500">No employees found.</div> : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dept</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salary</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {emps.map((emp, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{emp.employee_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{emp.employee_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{emp.email || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{emp.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">₹{emp.salary}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                            title="Edit Employee"
                                        >
                                            <Edit2 className="w-5 h-5 inline" />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to remove this employee? This will also delete their attendance and salary records.')) {
                                                    try {
                                                        await axios.delete(`http://localhost:8000/api/employees/${emp.employee_id}`);
                                                        fetchEmps();
                                                    } catch (err) {
                                                        alert('Failed to delete employee: ' + (err.response?.data?.detail || err.message));
                                                    }
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete Employee"
                                        >
                                            <Trash2 className="w-5 h-5 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
export default Employees;
