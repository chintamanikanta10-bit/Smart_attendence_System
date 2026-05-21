import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle, Trash2, Eye } from 'lucide-react';

const UploadAttendance = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  React.useEffect(() => {
    fetchAttendance();
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/uploaded_files/');
      console.log(res.data);
      setUploadedFiles(res.data);
    } catch (e) {
      console.error("Failed to load uploaded files");
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/attendance/');
      setAttendance(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance");
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this uploaded attendance file? This will remove all related attendance and salary records.")) return;
    try {
      await axios.delete(`http://localhost:8000/api/uploaded_files/${id}`);
      fetchUploadedFiles();
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  const handleFile = (e) => setFiles(Array.from(e.target.files));

  const handleUpload = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setMsg('');
    setError('');
    const form = new FormData();
    files.forEach(f => {
      form.append('files', f);
    });

    try {
      const res = await axios.post('http://localhost:8000/api/upload_attendance/', form);
      setMsg(res.data.message);
      fetchAttendance();
      fetchUploadedFiles();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Upload Monthly Attendance</h1>

      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Select Excel File</h3>
          <p className="text-sm text-slate-500 mt-2">Upload your monthly biometric extraction (.xlsx)</p>
        </div>

        <input
          type="file"
          accept=".xlsx, .xls"
          multiple
          onChange={handleFile}
          className="block w-full max-w-sm mx-auto text-sm text-slate-500
            file:mr-4 file:py-2.5 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 mb-6"
        />

        <button
          onClick={handleUpload}
          disabled={files.length === 0 || loading}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full shadow-md shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 transition-all w-full max-w-sm"
        >
          {loading ? 'Processing...' : 'Upload Data'}
        </button>

        {files.length > 0 && (
          <div className="mt-4 text-sm text-slate-500 text-left max-w-sm mx-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="font-bold mb-2">Selected Files ({files.length}):</p>
            <ul className="list-disc list-inside space-y-1">
              {files.map((f, idx) => (
                <li key={idx} className="truncate">{f.name}</li>
              ))}
            </ul>
          </div>
        )}

        {msg && (
          <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-center space-x-2 max-w-sm mx-auto text-sm font-medium">
            <CheckCircle className="w-5 h-5" /> <span>{msg}</span>
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center justify-center space-x-2 max-w-sm mx-auto text-sm font-medium">
            <AlertCircle className="w-5 h-5" /> <span>{error}</span>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
        <h3 className="font-bold text-slate-800 mb-4">Instructions</h3>
        <ul className="list-disc list-inside text-slate-600 text-sm space-y-2">
          <li>Ensure the file contains exactly these column headers: <b>Employee ID, Employee Name, Date 1, Time In 1, Time Out 1</b></li>
          <li>Dates should be valid (YYYY-MM-DD or DD/MM/YYYY)</li>
          <li>Times should be in proper format (HH:MM)</li>
          <li>No missing headers or merged cells</li>
        </ul>
      </div>

      {
        uploadedFiles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50">
              <h2 className="text-lg font-bold text-slate-800">Previously Uploaded Files</h2>
            </div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Month/Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Emp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Uploaded At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {uploadedFiles.map((file, i) => (
                    <tr key={file.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{file.filename}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{file.month}/{file.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{file.total_employees}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{file.upload_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={`http://localhost:8000/api/download_file/${file.id}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50" title="View/Download">
                          <Eye className="w-5 h-5 inline-block" />
                        </a>
                        <button onClick={() => handleDeleteFile(file.id)} className="text-red-500 hover:text-red-900 ml-2 p-2 rounded-full hover:bg-red-50" title="Delete">
                          <Trash2 className="w-5 h-5 inline-block" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {
        attendance.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Recent Attendance Records</h2>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">In Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Out Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {attendance.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.employee_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.employee_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.in_time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.out_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div >
  );
};
export default UploadAttendance;
