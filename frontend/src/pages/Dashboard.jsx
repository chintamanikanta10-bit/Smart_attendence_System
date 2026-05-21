import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Calendar, Briefcase, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_BASE = 'http://localhost:8000/api';

const Dashboard = () => {

  const [stats, setStats] = useState({
    total_employees: 0,
    total_holidays: 0,
    total_departments: 0
  });

  useEffect(() => {
    axios
      .get(`${API_BASE}/dashboard_stats/`)
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.total_employees,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Total Holidays',
      value: stats.total_holidays,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Departments',
      value: stats.total_departments,
      icon: Briefcase,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'System Status',
      value: 'Active',
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        System Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {statCards.map((s) => (
          <div
            key={s.title}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow"
          >

            <div className={`p-4 rounded-xl ${s.bg} ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                {s.title}
              </p>

              <h3 className="text-2xl font-bold text-slate-900">
                {s.value}
              </h3>
            </div>

          </div>
        ))}

      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 gap-6 mt-8">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">

          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              Quick Stats Overview
            </h2>
            <p className="text-slate-500">
              Dashboard analytics preview
            </p>
          </div>

          <div className="w-full h-72 min-h-[18rem]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Employees', value: stats.total_employees },
                  { name: 'Holidays', value: stats.total_holidays },
                  { name: 'Departments', value: stats.total_departments }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;