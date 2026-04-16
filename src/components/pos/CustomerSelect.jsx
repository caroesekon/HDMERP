import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX, HiUserAdd } from 'react-icons/hi';
import posService from '../../services/posService';
import CustomerForm from './CustomerForm';
import toast from 'react-hot-toast';

export default function CustomerSelect({ value, onChange, placeholder = 'Search customers...' }) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setSearch(`${value.firstName} ${value.lastName}`);
    } else {
      setSearch('');
    }
  }, [value]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (search && !value) {
        fetchCustomers();
      } else {
        setCustomers([]);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [search, value]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await posService.getCustomers({ search });
      setCustomers(res.data || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer) => {
    onChange(customer);
    setSearch(`${customer.firstName} ${customer.lastName}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearch('');
    setCustomers([]);
    inputRef.current?.focus();
  };

  const handleAddNew = () => {
    setShowAddForm(true);
  };

  const handleCustomerCreated = (newCustomer) => {
    setShowAddForm(false);
    onChange(newCustomer);
    setSearch(`${newCustomer.firstName} ${newCustomer.lastName}`);
    toast.success('Customer added');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (value) onChange(null);
          }}
          onFocus={() => !value && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <HiX className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && !value && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">Loading...</div>
          ) : customers.length > 0 ? (
            <>
              {customers.map(customer => (
                <button
                  key={customer._id}
                  onClick={() => handleSelect(customer)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition"
                >
                  <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                  <p className="text-xs text-gray-500">{customer.email || customer.phone || 'No contact'}</p>
                </button>
              ))}
              <button
                onClick={handleAddNew}
                className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 border-t flex items-center"
              >
                <HiUserAdd className="mr-2 h-4 w-4" />
                Add New Customer
              </button>
            </>
          ) : search ? (
            <button
              onClick={handleAddNew}
              className="w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 flex items-center"
            >
              <HiUserAdd className="mr-2 h-4 w-4" />
              Add "{search}" as new customer
            </button>
          ) : (
            <div className="p-3 text-center text-gray-500">Type to search customers</div>
          )}
        </div>
      )}

      <CustomerForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        initialData={{ firstName: search.split(' ')[0] || '', lastName: search.split(' ')[1] || '' }}
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
}