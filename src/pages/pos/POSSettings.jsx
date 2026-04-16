import { useState, useEffect } from 'react';
import { HiSave, HiCog, HiMail, HiDocumentText, HiPhotograph } from 'react-icons/hi';
import { useModuleSettings } from '../../hooks/useModuleSettings';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function POSSettings() {
  const { settings, loading, appName, logo, updateSettings, uploadLogo, refreshSettings } = useModuleSettings('pos', 'POS System');
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    general: { appName: 'POS System', currency: 'KES', taxRate: 16 },
    contact: { email: '', phone: '', address: '' },
    receipt: { header: '', footer: 'Thank you for your business!', showLogo: true, showTax: true },
    invoice: { prefix: 'INV', nextNumber: 1001, terms: '' }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        general: { ...formData.general, ...settings.general },
        contact: { ...formData.contact, ...settings.contact },
        receipt: { ...formData.receipt, ...settings.receipt },
        invoice: { ...formData.invoice, ...settings.invoice }
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
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
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateSection = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: HiCog },
    { id: 'contact', name: 'Contact', icon: HiMail },
    { id: 'receipt', name: 'Receipt', icon: HiDocumentText },
    { id: 'invoice', name: 'Invoice', icon: HiDocumentText }
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">POS Settings</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshSettings}>Refresh</Button>
          <Button onClick={handleSave} loading={saving}>
            <HiSave className="mr-2" />Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex px-4 pt-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition flex items-center whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-2xl">
              <Input
                label="Application Name"
                value={formData.general.appName}
                onChange={e => updateSection('general', 'appName', e.target.value)}
                placeholder="POS System"
              />
              <div>
                <label className="block text-sm font-medium mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {logo && <img src={logo} alt="Logo" className="h-12 w-auto border rounded" />}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    disabled={uploading}
                    className="text-sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Currency"
                  value={formData.general.currency}
                  onChange={e => updateSection('general', 'currency', e.target.value)}
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.1"
                  value={formData.general.taxRate}
                  onChange={e => updateSection('general', 'taxRate', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Email" value={formData.contact.email} onChange={e => updateSection('contact', 'email', e.target.value)} />
              <Input label="Phone" value={formData.contact.phone} onChange={e => updateSection('contact', 'phone', e.target.value)} />
              <Input label="Address" value={formData.contact.address} onChange={e => updateSection('contact', 'address', e.target.value)} />
            </div>
          )}

          {/* Receipt Tab */}
          {activeTab === 'receipt' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Receipt Header" value={formData.receipt.header} onChange={e => updateSection('receipt', 'header', e.target.value)} />
              <Input label="Receipt Footer" value={formData.receipt.footer} onChange={e => updateSection('receipt', 'footer', e.target.value)} />
              <label className="flex items-center">
                <input type="checkbox" checked={formData.receipt.showLogo} onChange={e => updateSection('receipt', 'showLogo', e.target.checked)} className="rounded" />
                <span className="ml-2">Show Logo on Receipt</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={formData.receipt.showTax} onChange={e => updateSection('receipt', 'showTax', e.target.checked)} className="rounded" />
                <span className="ml-2">Show Tax on Receipt</span>
              </label>
            </div>
          )}

          {/* Invoice Tab */}
          {activeTab === 'invoice' && (
            <div className="space-y-4 max-w-2xl">
              <Input label="Invoice Prefix" value={formData.invoice.prefix} onChange={e => updateSection('invoice', 'prefix', e.target.value)} />
              <Input label="Next Invoice Number" type="number" value={formData.invoice.nextNumber} onChange={e => updateSection('invoice', 'nextNumber', parseInt(e.target.value))} />
              <label className="block">
                <span className="text-sm font-medium">Invoice Terms</span>
                <textarea value={formData.invoice.terms} onChange={e => updateSection('invoice', 'terms', e.target.value)} rows={3} className="mt-1 w-full border rounded-lg p-2" />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}