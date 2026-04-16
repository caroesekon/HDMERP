import { useState, useEffect } from 'react';
import { HiTrash, HiPlus, HiMinus, HiUser, HiChevronDown } from 'react-icons/hi';
import { formatCurrency } from '../../utils/helpers';
import { useModuleSettings } from '../../hooks/useModuleSettings';
import posService from '../../services/posService';
import Input from '../common/Input';

export default function CartSidebar({ items, onUpdateQuantity, onRemoveItem, onCheckout, onCustomerChange }) {
  const { settings } = useModuleSettings('pos', 'POS System');
  const [customers, setCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerInput, setCustomerInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const taxRate = settings?.general?.taxRate || 0;
  const showTax = settings?.receipt?.showTax !== false;
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = showTax ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + tax;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await posService.getCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      console.error('Failed to load customers');
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerInput(`${customer.firstName} ${customer.lastName}`);
    setShowCustomerDropdown(false);
    if (onCustomerChange) {
      onCustomerChange(customer);
    }
  };

  const handleCustomerInputChange = (e) => {
    const value = e.target.value;
    setCustomerInput(value);
    setSelectedCustomer(null);
    setShowCustomerDropdown(true);
    if (onCustomerChange) {
      onCustomerChange({ firstName: value, lastName: '', isWalkIn: true });
    }
  };

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerInput.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerInput.toLowerCase()) ||
    c.phone?.includes(customerInput)
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Current Sale</h3>
        <p className="text-sm text-gray-500">{items.length} items</p>
      </div>

      {/* Customer Selection */}
      <div className="p-4 border-b">
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer (Optional)</label>
        <div className="relative">
          <div className="relative">
            <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={customerInput}
              onChange={handleCustomerInputChange}
              onFocus={() => setShowCustomerDropdown(true)}
              placeholder="Type name or select customer..."
              className="w-full pl-9 pr-8 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <HiChevronDown className="h-4 w-4" />
            </button>
          </div>
          
          {showCustomerDropdown && filteredCustomers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <div
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b"
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerInput('');
                  setShowCustomerDropdown(false);
                  if (onCustomerChange) onCustomerChange(null);
                }}
              >
                <span className="text-gray-500">Walk-in Customer</span>
              </div>
              {filteredCustomers.map(c => (
                <div
                  key={c._id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleCustomerSelect(c)}
                >
                  <p className="font-medium">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-gray-500">{c.phone || c.email || 'No contact'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedCustomer && (
          <p className="text-xs text-green-600 mt-1">
            ✓ {selectedCustomer.firstName} {selectedCustomer.lastName}
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Cart is empty</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b pb-3">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center border rounded">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} 
                    className="p-1 text-gray-600 hover:bg-gray-100"
                  >
                    <HiMinus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                    className="p-1 text-gray-600 hover:bg-gray-100"
                  >
                    <HiPlus className="h-3 w-3" />
                  </button>
                </div>
                <button 
                  onClick={() => onRemoveItem(item.id)} 
                  className="text-red-500 hover:text-red-700"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {showTax && taxRate > 0 && (
            <div className="flex justify-between">
              <span>Tax ({taxRate}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <button 
          onClick={onCheckout} 
          disabled={items.length === 0} 
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}