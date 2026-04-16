import { useState, useEffect } from 'react';
import { HiCheck, HiClock } from 'react-icons/hi';
import staffService from '../../services/staffService';
import Loader from '../common/Loader';
import { formatDate } from '../../utils/helpers';

export default function AttendanceTracker() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffService.getTodayAttendance()
      .then(res => setAttendance(res.data?.records || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Today's Attendance</h3>
      <div className="space-y-2">
        {attendance.map((record) => (
          <div key={record._id} className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">{record.staffId?.firstName} {record.staffId?.lastName}</p>
              <p className="text-xs text-gray-500">{record.staffId?.employeeId}</p>
            </div>
            <div className="text-right">
              {record.checkIn && <p className="text-xs text-gray-600">In: {formatDate(record.checkIn, 'datetime')}</p>}
              {record.checkOut && <p className="text-xs text-gray-600">Out: {formatDate(record.checkOut, 'datetime')}</p>}
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {record.status}
              </span>
            </div>
          </div>
        ))}
        {attendance.length === 0 && <p className="text-gray-500 text-sm">No records for today</p>}
      </div>
    </div>
  );
}