import { useState, useEffect } from 'react';
import { HiPlus, HiCheck, HiX, HiPrinter, HiFilter } from 'react-icons/hi';
import staffService from '../../services/staffService';
import LeaveForm from '../../components/staff/LeaveForm';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { printLeaveNote } from '../../utils/printUtils';

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchLeaves(); }, []);
  useEffect(() => { applyFilter(); }, [leaves, filterStatus]);

  const fetchLeaves = async () => {
    setLoading(true);
    try { const res = await staffService.getLeaves(); setLeaves(res.data || []); } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  const applyFilter = () => {
    if (filterStatus === 'all') setFiltered(leaves);
    else setFiltered(leaves.filter(l => l.status === filterStatus));
  };

  const handleStatusUpdate = async (id, status) => {
    try { await staffService.updateLeaveStatus(id, { status }); toast.success(`Leave ${status}`); fetchLeaves(); }
    catch { toast.error('Failed'); }
  };

  const handlePrint = (leave) => {
    printLeaveNote(leave);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Leave Management</h2>
        <Button onClick={() => setModalOpen(true)}><HiPlus className="mr-2" />Apply Leave</Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3 items-center">
        <label className="text-sm font-medium">Status:</label>
        <select className="border rounded-lg px-3 py-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(l => (
            <tr key={l._id}>
              <td>{l.staffId?.firstName} {l.staffId?.lastName}</td><td>{l.leaveType}</td>
              <td>{formatDate(l.startDate)} - {formatDate(l.endDate)}</td><td>{l.daysCount}</td><td className="max-w-xs truncate">{l.reason}</td>
              <td><span className={`px-2 py-1 rounded-full text-xs ${l.status==='approved'?'bg-green-100 text-green-800':l.status==='rejected'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800'}`}>{l.status}</span></td>
              <td>
                <div className="flex space-x-2">
                  {l.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(l._id, 'approved')} className="text-green-600"><HiCheck /></button>
                      <button onClick={() => handleStatusUpdate(l._id, 'rejected')} className="text-red-600"><HiX /></button>
                    </>
                  )}
                  <button onClick={() => handlePrint(l)} className="text-purple-600"><HiPrinter /></button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <LeaveForm isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={() => { setModalOpen(false); fetchLeaves(); }} />
    </div>
  );
}