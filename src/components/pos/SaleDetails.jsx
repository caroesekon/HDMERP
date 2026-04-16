import Modal from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Button from '../common/Button';
import { HiPrinter } from 'react-icons/hi';
import { printReceipt } from '../../utils/printUtils';

export default function SaleDetails({ sale, onClose }) {
  if (!sale) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Sale Details" size="lg">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Invoice #: <span className="font-medium text-gray-800">{sale.invoiceNumber}</span></p>
          <p className="text-sm text-gray-500">Date: {formatDate(sale.date)}</p>
          <p className="text-sm text-gray-500">Payment: {sale.paymentMethod}</p>
          <p className="text-sm text-gray-500">Status: <span className={`px-2 py-1 rounded-full text-xs ${sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{sale.paymentStatus}</span></p>
          {sale.customerId && <p className="text-sm text-gray-500">Customer: {sale.customerId.firstName} {sale.customerId.lastName}</p>}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-2 text-left">Item</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Price</th><th className="p-2 text-right">Total</th></tr></thead>
          <tbody>{sale.items?.map((item, i) => <tr key={i} className="border-b"><td className="p-2">{item.name}</td><td className="p-2 text-right">{item.quantity}</td><td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="p-2 text-right">{formatCurrency(item.total)}</td></tr>)}</tbody>
        </table>
        <div className="border-t pt-3">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>
          {sale.taxTotal > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(sale.taxTotal)}</span></div>}
          {sale.discountTotal > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(sale.discountTotal)}</span></div>}
          <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span>{formatCurrency(sale.grandTotal)}</span></div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => printReceipt(sale)}><HiPrinter className="mr-2" />Print</Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}