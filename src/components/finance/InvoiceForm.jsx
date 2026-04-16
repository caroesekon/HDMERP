import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { HiPlus, HiTrash, HiMail, HiPhone } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';

export default function InvoiceForm({ isOpen, onClose, invoice, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMethod, setSendMethod] = useState('email');
  
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      customerName: invoice?.customerName || '',
      customerEmail: invoice?.customerEmail || '',
      customerPhone: invoice?.customerPhone || '',
      customerAddress: invoice?.customerAddress || '',
      invoiceDate: invoice?.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: invoice?.items?.length ? invoice.items : [{ description: '', quantity: 1, unitPrice: 0 }],
      tax: invoice?.tax || 0,
      discount: invoice?.discount || 0,
      notes: invoice?.notes || '',
      terms: invoice?.terms || 'Payment due within 30 days',
      status: invoice?.status || 'pending',
      sendInvoice: false
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = watch('items');
  const watchTax = watch('tax');
  const watchDiscount = watch('discount');
  const watchSendInvoice = watch('sendInvoice');
  const watchCustomerEmail = watch('customerEmail');
  const watchCustomerPhone = watch('customerPhone');

  useEffect(() => {
    if (invoice) {
      reset({
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName || '',
        customerEmail: invoice.customerEmail || '',
        customerPhone: invoice.customerPhone || '',
        customerAddress: invoice.customerAddress || '',
        invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        items: invoice.items?.length ? invoice.items : [{ description: '', quantity: 1, unitPrice: 0 }],
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
        notes: invoice.notes || '',
        terms: invoice.terms || 'Payment due within 30 days',
        status: invoice.status || 'pending',
        sendInvoice: false
      });
    }
  }, [invoice, reset, isOpen]);

  const calculateSubtotal = () => {
    return watchItems?.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (qty * price);
    }, 0) || 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(watchTax) || 0;
    const discount = parseFloat(watchDiscount) || 0;
    return subtotal + tax - discount;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
  };

  const handleSendInvoice = async (invoiceId, invoiceData) => {
    setSending(true);
    try {
      if (sendMethod === 'email' && invoiceData.customerEmail) {
        await financeService.sendInvoiceEmail(invoiceId, invoiceData);
        toast.success(`Invoice sent to ${invoiceData.customerEmail}`);
        return true;
      } else if (sendMethod === 'whatsapp' && invoiceData.customerPhone) {
        await financeService.sendInvoiceWhatsApp(invoiceId, invoiceData);
        toast.success(`Invoice sent to ${invoiceData.customerPhone} via WhatsApp`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Send error:', error);
      toast.error(`Failed to send invoice: ${error.response?.data?.error || 'Unknown error'}`);
      return false;
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (data) => {
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    
    const formattedData = {
      ...data,
      subtotal,
      total,
      items: data.items.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        total: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
      }))
    };

    setLoading(true);
    try {
      let response;
      if (invoice) {
        response = await financeService.updateInvoice(invoice._id, formattedData);
        toast.success('Invoice updated successfully');
        
        // Send if requested
        if (data.sendInvoice) {
          await handleSendInvoice(invoice._id, { ...formattedData, _id: invoice._id });
        }
      } else {
        response = await financeService.createInvoice(formattedData);
        toast.success('Invoice created successfully');
        
        // Send if requested (use the newly created invoice ID)
        if (data.sendInvoice && response.data?._id) {
          await handleSendInvoice(response.data._id, response.data);
        }
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  const canSend = (watchSendInvoice && sendMethod === 'email' && watchCustomerEmail) || 
                  (watchSendInvoice && sendMethod === 'whatsapp' && watchCustomerPhone);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={invoice ? 'Edit Invoice' : 'Create Invoice'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Invoice Number"
            {...register('invoiceNumber', { required: 'Invoice number is required' })}
            error={errors.invoiceNumber?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="w-full border rounded-lg px-3 py-2">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-gray-800">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Name *"
              {...register('customerName', { required: 'Customer name is required' })}
              error={errors.customerName?.message}
            />
            <Input
              label="Customer Email"
              type="email"
              icon={<HiMail className="h-4 w-4" />}
              {...register('customerEmail')}
              placeholder="customer@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              icon={<HiPhone className="h-4 w-4" />}
              {...register('customerPhone')}
              placeholder="+254 7XX XXX XXX"
            />
            <Input
              label="Address"
              {...register('customerAddress')}
              placeholder="Billing address"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Invoice Date" type="date" {...register('invoiceDate', { required: true })} />
          <Input label="Due Date" type="date" {...register('dueDate', { required: true })} />
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Line Items</label>
            <button type="button" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })} className="text-sm text-purple-600 hover:text-purple-700 flex items-center">
              <HiPlus className="mr-1" /> Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-lg">
                <div className="col-span-5"><Input placeholder="Description" {...register(`items.${index}.description`, { required: true })} /></div>
                <div className="col-span-2"><Input type="number" placeholder="Qty" min="1" {...register(`items.${index}.quantity`, { required: true, min: 1 })} /></div>
                <div className="col-span-3"><Input type="number" step="0.01" placeholder="Price" {...register(`items.${index}.unitPrice`, { required: true, min: 0 })} /></div>
                <div className="col-span-1"><p className="text-sm font-medium text-gray-700 pt-2">{formatCurrency((watchItems[index]?.quantity || 0) * (watchItems[index]?.unitPrice || 0))}</p></div>
                <div className="col-span-1 flex justify-end">
                  {fields.length > 1 && <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700"><HiTrash /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
            <div className="flex items-center justify-between"><span>Tax</span><Input type="number" step="0.01" {...register('tax')} className="w-24 text-right" /></div>
            <div className="flex items-center justify-between"><span>Discount</span><Input type="number" step="0.01" {...register('discount')} className="w-24 text-right" /></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
        </div>

        <Input label="Terms & Conditions" {...register('terms')} placeholder="Payment terms" />
        <Input label="Notes" {...register('notes')} placeholder="Additional notes" />

        {/* Send Options */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <label className="flex items-center">
            <input type="checkbox" {...register('sendInvoice')} className="rounded border-gray-300 text-blue-600" />
            <span className="ml-2 text-sm font-medium text-gray-700">Send invoice to customer</span>
          </label>
          
          {watchSendInvoice && (
            <div className="ml-6 space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input type="radio" name="sendMethod" value="email" checked={sendMethod === 'email'} onChange={() => setSendMethod('email')} className="text-blue-600" />
                  <span className="ml-2 text-sm flex items-center"><HiMail className="h-4 w-4 mr-1" /> Email</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="sendMethod" value="whatsapp" checked={sendMethod === 'whatsapp'} onChange={() => setSendMethod('whatsapp')} className="text-green-600" />
                  <span className="ml-2 text-sm flex items-center"><FaWhatsapp className="h-4 w-4 mr-1 text-green-600" /> WhatsApp</span>
                </label>
              </div>
              
              {sendMethod === 'email' && !watchCustomerEmail && <p className="text-xs text-orange-600">Please enter customer email above</p>}
              {sendMethod === 'whatsapp' && !watchCustomerPhone && <p className="text-xs text-orange-600">Please enter customer phone number above</p>}
              {canSend && <p className="text-xs text-green-600">✓ Invoice will be sent to {sendMethod === 'email' ? watchCustomerEmail : watchCustomerPhone}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading || sending}>
            {invoice ? 'Update' : 'Create'} Invoice
            {watchSendInvoice && canSend && !loading && !sending && ' & Send'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}