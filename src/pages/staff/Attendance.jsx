import { useState, useEffect } from 'react';
import { HiLogin, HiLogout, HiSearch, HiPrinter, HiCalendar, HiFilter } from 'react-icons/hi';
import staffService from '../../services/staffService';
import { formatDate, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { printAttendanceReport } from '../../utils/printUtils';

export default function Attendance() {
  const [staffId, setStaffId] = useState('');
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ staffId: '', startDate: '', endDate: '' });
  const [staffList, setStaffList] = useState([]);

  useEffect(() => { fetchTodayAttendance(); fetchStaffList(); }, []);

  const fetchTodayAttendance = async () => {
    try { const res = await staffService.getTodayAttendance(); setTodayAttendance(res.data?.records || []); } catch { console.error('Failed to load today attendance'); }
  };
  const fetchStaffList = async () => {
    try { const res = await staffService.getAllStaff(); setStaffList(res.data || []); } catch {}
  };
  const fetchHistory = async () => {
    if (!filters.staffId) { toast.error('Select an employee'); return; }
    setLoading(true);
    try {
      const res = await staffService.getStaffAttendance(filters.staffId, { startDate: filters.startDate, endDate: filters.endDate });
      setHistory(res.data || []);
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  };

  const handleCheckIn = async () => {
    if (!staffId) return toast.error('Enter Employee ID');
    try { await staffService.checkIn(staffId); toast.success('Checked in'); fetchTodayAttendance(); setStaffId(''); }
    catch (err) { toast.error(err.response?.data?.error || 'Check-in failed'); }
  };
  const handleCheckOut = async () => {
    if (!staffId) return toast.error('Enter Employee ID');
    try { await staffService.checkOut(staffId); toast.success('Checked out'); fetchTodayAttendance(); setStaffId(''); }
    catch (err) { toast.error(err.response?.data?.error || 'Check-out failed'); }
  };

  const handlePrint = () => {
    if (history.length === 0) return toast.error('No data to print');
    const employee = staffList.find(s => s._id === filters.staffId);
    printAttendanceReport(employee, history, filters);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>

      {/* Check In/Out Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Record Attendance</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <select className="border rounded-lg px-4 py-2 flex-1" value={staffId} onChange={e => setStaffId(e.target.value)}>
            <option value="">Select Employee</option>
            {staffList.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.employeeId})</option>)}
          </select>
          <div className="flex gap-3">
            <Button onClick={handleCheckIn} className="bg-green-600 hover:bg-green-700"><HiLogin className="mr-2" />Check In</Button>
            <Button onClick={handleCheckOut} className="bg-red-600 hover:bg-red-700"><HiLogout className="mr-2" />Check Out</Button>
          </div>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Today's Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th>Employee</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
            <tbody>{todayAttendance.map(r => (
              <tr key={r._id}><td>{r.staffId?.firstName} {r.staffId?.lastName}</td><td>{r.checkIn ? formatTime(r.checkIn) : '-'}</td><td>{r.checkOut ? formatTime(r.checkOut) : '-'}</td>
                <td><span className={`px-2 py-1 rounded-full text-xs ${r.status==='present'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{r.status}</span></td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Attendance History with Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Attendance History</h3>
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <div className="w-64">
            <label className="block text-sm font-medium mb-1">Employee</label>
            <select className="w-full border rounded-lg px-3 py-2" value={filters.staffId} onChange={e => setFilters({...filters, staffId: e.target.value})}>
              <option value="">Select Employee</option>
              {staffList.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <Input label="Start Date" type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          <Input label="End Date" type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          <Button onClick={fetchHistory}><HiSearch className="mr-1" />Search</Button>
          <Button variant="outline" onClick={handlePrint} disabled={history.length===0}><HiPrinter className="mr-1" />Print</Button>
        </div>
        {loading ? <Loader /> : (
          <table className="w-full text-sm">
            <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>{history.map(r => (
              <tr key={r._id}><td>{formatDate(r.date)}</td><td>{r.checkIn ? formatTime(r.checkIn) : '-'}</td><td>{r.checkOut ? formatTime(r.checkOut) : '-'}</td>
                <td>{r.totalHours?.toFixed(2) || '-'}</td><td><span className={`px-2 py-1 rounded-full text-xs ${r.status==='present'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{r.status}</span></td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}