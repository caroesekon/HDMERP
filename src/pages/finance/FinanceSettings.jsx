import { useState, useEffect } from 'react';
import { HiSave, HiCog, HiMail, HiDocumentText, HiCash, HiChartBar, HiReceiptTax } from 'react-icons/hi';
import { useModuleSettings } from '../../hooks/useModuleSettings';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function FinanceSettings() {
  const { settings, loading, logo, updateSettings, uploadLogo, refreshSettings } = useModuleSettings('finance', 'Finance Manager');
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    general: { appName: 'Finance Manager', currency: 'KES', timezone: 'Africa/Nairobi', fiscalYearStart: '01-01', fiscalYearEnd: '12-31' },
    contact: { email: '', phone: '', address: '' },
    accounting: { taxRate: 16, multipleTaxRates: false, enableDepartments: false, enableProjects: false },
    invoice: { prefix: 'INV', nextNumber: 1001, dueDays: 30, terms: 'Payment due within 30 days.', footer: 'Thank you for your business!' },
    expense: { requireReceipt: true, approvalRequired: true, maxAmountWithoutApproval: 10000 },
    budget: { alertThreshold: 80, restrictOverspending: false, rollingBudget: true },
    report: { header: '', footer: '', showLogo: true, defaultPeriod: 'month' }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        general: { ...formData.general, ...settings.general },
        contact: { ...formData.contact, ...settings.contact },
        accounting: { ...formData.accounting, ...settings.accounting },
        invoice: { ...formData.invoice, ...settings.invoice },
        expense: { ...formData.expense, ...settings.expense },
        budget: { ...formData.budget, ...settings.budget },
        report: { ...formData.report, ...settings.report }
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

  const tabs = [
    { id: 'general', name: 'General', icon: HiCog },
    { id: 'contact', name: 'Contact', icon: HiMail },
    { id: 'accounting', name: 'Accounting', icon: HiChartBar },
    { id: 'invoice', name: 'Invoice', icon: HiDocumentText },
    { id: 'expense', name: 'Expense', icon: HiReceiptTax },
    { id: 'budget', name: 'Budget', icon: HiCash },
    { id: 'report', name: 'Reports', icon: HiDocumentText }
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Finance Settings</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshSettings}>Refresh</Button>
          <Button onClick={handleSave} loading={saving}><HiSave className="mr-2" />Save Changes</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex px-4 pt-2 min-w-max">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-t-lg font-medium text-sm transition flex items-center whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-purple-700 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
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
              <div className="grid grid-cols-2 gap-4">
                <Input label="Fiscal Year Start (MM-DD)" value={formData.general.fiscalYearStart} onChange={e => updateSection('general', 'fiscalYearStart', e.target.value)} />
                <Input label="Fiscal Year End (MM-DD)" value={formData.general.fiscalYearEnd} onChange={e => updateSection('general', 'fiscalYearEnd', e.target.value)} />
              </div>
            </div>
          )}

          {/* Accounting Tab */}
          {activeTab === 'accounting' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Default Tax Rate (%)" type="number" step="0.1" value={formData.accounting.taxRate} onChange={e => updateSection('accounting', 'taxRate', parseFloat(e.target.value))} />
              <label className="flex items-center"><input type="checkbox" checked={formData.accounting.multipleTaxRates} onChange={e => updateSection('accounting', 'multipleTaxRates', e.target.checked)} className="rounded" /><span className="ml-2">Enable Multiple Tax Rates</span></label>
              <label className="flex items-center"><input type="checkbox" checked={formData.accounting.enableDepartments} onChange={e => updateSection('accounting', 'enableDepartments', e.target.checked)} className="rounded" /><span className="ml-2">Enable Department Tracking</span></label>
              <label className="flex items-center"><input type="checkbox" checked={formData.accounting.enableProjects} onChange={e => updateSection('accounting', 'enableProjects', e.target.checked)} className="rounded" /><span className="ml-2">Enable Project Tracking</span></label>
            </div>
          )}

          {/* Invoice Tab */}
          {activeTab === 'invoice' && (
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Invoice Prefix" value={formData.invoice.prefix} onChange={e => updateSection('invoice', 'prefix', e.target.value)} />
                <Input label="Next Invoice Number" type="number" value={formData.invoice.nextNumber} onChange={e => updateSection('invoice', 'nextNumber', parseInt(e.target.value))} />
              </div>
              <Input label="Payment Due (days)" type="number" value={formData.invoice.dueDays} onChange={e => updateSection('invoice', 'dueDays', parseInt(e.target.value))} />
              <label className="block"><span className="text-sm font-medium">Default Terms</span>
                <textarea value={formData.invoice.terms} onChange={e => updateSection('invoice', 'terms', e.target.value)} rows={2} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <Input label="Invoice Footer" value={formData.invoice.footer} onChange={e => updateSection('invoice', 'footer', e.target.value)} />
            </div>
          )}

          {/* Expense Tab */}
          {activeTab === 'expense' && (
            <div className="space-y-4 max-w-2xl">
              <label className="flex items-center"><input type="checkbox" checked={formData.expense.requireReceipt} onChange={e => updateSection('expense', 'requireReceipt', e.target.checked)} className="rounded" /><span className="ml-2">Require Receipt for Expenses</span></label>
              <label className="flex items-center"><input type="checkbox" checked={formData.expense.approvalRequired} onChange={e => updateSection('expense', 'approvalRequired', e.target.checked)} className="rounded" /><span className="ml-2">Require Approval for Expenses</span></label>
              {formData.expense.approvalRequired && <Input label="Max Amount Without Approval" type="number" value={formData.expense.maxAmountWithoutApproval} onChange={e => updateSection('expense', 'maxAmountWithoutApproval', parseFloat(e.target.value))} />}
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Budget Alert Threshold (%)" type="number" value={formData.budget.alertThreshold} onChange={e => updateSection('budget', 'alertThreshold', parseInt(e.target.value))} />
              <label className="flex items-center"><input type="checkbox" checked={formData.budget.restrictOverspending} onChange={e => updateSection('budget', 'restrictOverspending', e.target.checked)} className="rounded" /><span className="ml-2">Restrict Overspending</span></label>
              <label className="flex items-center"><input type="checkbox" checked={formData.budget.rollingBudget} onChange={e => updateSection('budget', 'rollingBudget', e.target.checked)} className="rounded" /><span className="ml-2">Enable Rolling Budget</span></label>
            </div>
          )}

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Report Header" value={formData.report.header} onChange={e => updateSection('report', 'header', e.target.value)} />
              <Input label="Report Footer" value={formData.report.footer} onChange={e => updateSection('report', 'footer', e.target.value)} />
              <label className="flex items-center"><input type="checkbox" checked={formData.report.showLogo} onChange={e => updateSection('report', 'showLogo', e.target.checked)} className="rounded" /><span className="ml-2">Show Logo on Reports</span></label>
              <div>
                <label className="block text-sm font-medium mb-1">Default Report Period</label>
                <select value={formData.report.defaultPeriod} onChange={e => updateSection('report', 'defaultPeriod', e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option><option value="quarter">Quarterly</option><option value="year">Yearly</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}