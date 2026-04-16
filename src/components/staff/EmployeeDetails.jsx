import { useState, useEffect } from 'react';
import { HiX, HiMail, HiPhone, HiCalendar, HiCash, HiOfficeBuilding, HiUser } from 'react-icons/hi';
import Modal from '../common/Modal';
import staffService from '../../services/staffService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loader from '../common/Loader';

export default function EmployeeDetails({ employee, onClose }) {
  const [attendance, setAttendance] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [attendanceRes, leaveRes] = await Promise.all([
          staffService.getStaffAttendance(employee._id, { limit: 5 }),
          staffService.getLeaveBalance(employee._id)
        ]);
        setAttendance(attendanceRes.data || []);
        setLeaveBalance(leaveRes.data);
      } catch (error) {
        console.error('Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [employee._id]);

  return (
    <Modal isOpen={true} onClose={onClose} title="Employee Details" size="lg">
      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700">
              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-gray-500">{employee.employeeId}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                employee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {employee.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Contact & Job Details */}
          <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <p className="flex items-center text-sm"><HiMail className="mr-2 text-gray-400" />{employee.email}</p>
              <p className="flex items-center text-sm"><HiPhone className="mr-2 text-gray-400" />{employee.phone || 'N/A'}</p>
              <p className="flex items-center text-sm"><HiCalendar className="mr-2 text-gray-400" />Joined: {formatDate(employee.joinDate)}</p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center text-sm"><HiOfficeBuilding className="mr-2 text-gray-400" />{employee.department?.name || 'N/A'}</p>
              <p className="flex items-center text-sm"><HiUser className="mr-2 text-gray-400" />{employee.position || 'N/A'}</p>
              <p className="flex items-center text-sm"><HiCash className="mr-2 text-gray-400" />{formatCurrency(employee.baseSalary)}/month</p>
            </div>
          </div>

          {/* Leave Balance */}
          {leaveBalance && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Leave Balance</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{leaveBalance.entitled || 0}</p>
                  <p className="text-xs text-gray-600">Entitled</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-orange-700">{leaveBalance.taken || 0}</p>
                  <p className="text-xs text-gray-600">Taken</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{leaveBalance.remaining || 0}</p>
                  <p className="text-xs text-gray-600">Remaining</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Attendance */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Recent Attendance</h4>
            {attendance.length === 0 ? (
              <p className="text-gray-500 text-sm">No attendance records</p>
            ) : (
              <div className="space-y-2">
                {attendance.map(record => (
                  <div key={record._id} className="flex justify-between text-sm border-b pb-2">
                    <span>{formatDate(record.date)}</span>
                    <span className={record.status === 'present' ? 'text-green-600' : 'text-red-600'}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bank Details */}
          {employee.bankAccount && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Bank Details</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><span className="text-gray-600">Bank:</span> {employee.bankAccount.bankName}</p>
                <p><span className="text-gray-600">Account:</span> {employee.bankAccount.accountNumber}</p>
                <p><span className="text-gray-600">Name:</span> {employee.bankAccount.accountName}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}