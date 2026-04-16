import { useState, useEffect } from 'react';
import { HiSave, HiCog, HiMail, HiDocumentText, HiCash, HiCalendar, HiClock } from 'react-icons/hi';
import { useModuleSettings } from '../../hooks/useModuleSettings';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function StaffSettings() {
  const { settings, loading, logo, updateSettings, uploadLogo, refreshSettings } = useModuleSettings('staff', 'Staff Manager');
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    general: { appName: 'Staff Manager', currency: 'KES', timezone: 'Africa/Nairobi', dateFormat: 'DD/MM/YYYY' },
    contact: { email: '', phone: '', address: '' },
    payroll: { paymentDay: 25, overtimeRate: 1.5, weekendRate: 2.0, holidayRate: 2.5, taxEnabled: true, pensionEnabled: true },
    leave: { annualLeaveDays: 21, sickLeaveDays: 10, casualLeaveDays: 5, carryForward: true, maxCarryForward: 10 },
    attendance: { workStartTime: '08:00', workEndTime: '17:00', gracePeriod: 15, halfDayHours: 4, weekendDays: [0, 6] },
    payslip: { header: '', footer: 'This is a computer-generated payslip.', showLogo: true, showBreakdown: true }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        general: { ...formData.general, ...settings.general },
        contact: { ...formData.contact, ...settings.contact },
        payroll: { ...formData.payroll, ...settings.payroll },
        leave: { ...formData.leave, ...settings.leave },
        attendance: { ...formData.attendance, ...settings.attendance },
        payslip: { ...formData.payslip, ...settings.payslip }
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadLogo(file);
      toast.success('Logo uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateSection = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const tabs = [
    { id: 'general', name: 'General', icon: HiCog },
    { id: 'contact', name: 'Contact', icon: HiMail },
    { id: 'payroll', name: 'Payroll', icon: HiCash },
    { id: 'leave', name: 'Leave', icon: HiCalendar },
    { id: 'attendance', name: 'Attendance', icon: HiClock },
    { id: 'payslip', name: 'Payslip', icon: HiDocumentText }
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Staff Settings</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshSettings}>Refresh</Button>
          <Button onClick={handleSave} loading={saving}><HiSave className="mr-2" />Save Changes</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex px-4 pt-2 min-w-max">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-t-lg font-medium text-sm transition flex items-center whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <tab.icon className="h-4 w-4 mr-2" />{tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Application Name" value={formData.general.appName} onChange={e => updateSection('general', 'appName', e.target.value)} />
              <div>
                <label className="block text-sm font-medium mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {logo && <img src={logo} alt="Logo" className="h-12 w-auto border rounded" />}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="text-sm" />
                </div>
              </div>
              <Input label="Currency" value={formData.general.currency} onChange={e => updateSection('general', 'currency', e.target.value)} />
              <Input label="Date Format" value={formData.general.dateFormat} onChange={e => updateSection('general', 'dateFormat', e.target.value)} />
            </div>
          )}

          {/* Payroll Tab */}
          {activeTab === 'payroll' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Payment Day of Month" type="number" min="1" max="31" value={formData.payroll.paymentDay} onChange={e => updateSection('payroll', 'paymentDay', parseInt(e.target.value))} />
              <Input label="Overtime Rate (x)" type="number" step="0.1" value={formData.payroll.overtimeRate} onChange={e => updateSection('payroll', 'overtimeRate', parseFloat(e.target.value))} />
              <Input label="Weekend Rate (x)" type="number" step="0.1" value={formData.payroll.weekendRate} onChange={e => updateSection('payroll', 'weekendRate', parseFloat(e.target.value))} />
              <Input label="Holiday Rate (x)" type="number" step="0.1" value={formData.payroll.holidayRate} onChange={e => updateSection('payroll', 'holidayRate', parseFloat(e.target.value))} />
              <label className="flex items-center"><input type="checkbox" checked={formData.payroll.taxEnabled} onChange={e => updateSection('payroll', 'taxEnabled', e.target.checked)} className="rounded" /><span className="ml-2">Enable Tax (PAYE)</span></label>
              <label className="flex items-center"><input type="checkbox" checked={formData.payroll.pensionEnabled} onChange={e => updateSection('payroll', 'pensionEnabled', e.target.checked)} className="rounded" /><span className="ml-2">Enable Pension</span></label>
            </div>
          )}

          {/* Leave Tab */}
          {activeTab === 'leave' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Annual Leave (days)" type="number" value={formData.leave.annualLeaveDays} onChange={e => updateSection('leave', 'annualLeaveDays', parseInt(e.target.value))} />
              <Input label="Sick Leave (days)" type="number" value={formData.leave.sickLeaveDays} onChange={e => updateSection('leave', 'sickLeaveDays', parseInt(e.target.value))} />
              <Input label="Casual Leave (days)" type="number" value={formData.leave.casualLeaveDays} onChange={e => updateSection('leave', 'casualLeaveDays', parseInt(e.target.value))} />
              <label className="flex items-center"><input type="checkbox" checked={formData.leave.carryForward} onChange={e => updateSection('leave', 'carryForward', e.target.checked)} className="rounded" /><span className="ml-2">Allow Carry Forward</span></label>
              {formData.leave.carryForward && <Input label="Max Carry Forward (days)" type="number" value={formData.leave.maxCarryForward} onChange={e => updateSection('leave', 'maxCarryForward', parseInt(e.target.value))} />}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Work Start Time" type="time" value={formData.attendance.workStartTime} onChange={e => updateSection('attendance', 'workStartTime', e.target.value)} />
                <Input label="Work End Time" type="time" value={formData.attendance.workEndTime} onChange={e => updateSection('attendance', 'workEndTime', e.target.value)} />
              </div>
              <Input label="Grace Period (minutes)" type="number" value={formData.attendance.gracePeriod} onChange={e => updateSection('attendance', 'gracePeriod', parseInt(e.target.value))} />
              <Input label="Half Day Hours" type="number" value={formData.attendance.halfDayHours} onChange={e => updateSection('attendance', 'halfDayHours', parseInt(e.target.value))} />
              <div>
                <label className="block text-sm font-medium mb-2">Weekend Days</label>
                <div className="grid grid-cols-4 gap-2">
                  {weekdays.map((day, i) => (
                    <label key={i} className="flex items-center">
                      <input type="checkbox" checked={formData.attendance.weekendDays?.includes(i)} onChange={e => { const days = formData.attendance.weekendDays || []; const newDays = e.target.checked ? [...days, i] : days.filter(d => d !== i); updateSection('attendance', 'weekendDays', newDays); }} className="rounded" />
                      <span className="ml-2 text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payslip Tab */}
          {activeTab === 'payslip' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Payslip Header" value={formData.payslip.header} onChange={e => updateSection('payslip', 'header', e.target.value)} />
              <label className="block"><span className="text-sm font-medium">Payslip Footer</span>
                <textarea value={formData.payslip.footer} onChange={e => updateSection('payslip', 'footer', e.target.value)} rows={3} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="flex items-center"><input type="checkbox" checked={formData.payslip.showLogo} onChange={e => updateSection('payslip', 'showLogo', e.target.checked)} className="rounded" /><span className="ml-2">Show Logo on Payslip</span></label>
              <label className="flex items-center"><input type="checkbox" checked={formData.payslip.showBreakdown} onChange={e => updateSection('payslip', 'showBreakdown', e.target.checked)} className="rounded" /><span className="ml-2">Show Detailed Breakdown</span></label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}