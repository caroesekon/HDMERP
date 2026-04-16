import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ProductGrid from './ProductGrid';
import CartSidebar from './CartSidebar';
import PaymentModal from './PaymentModal';
import CustomerSelect from './CustomerSelect';
import posService from '../../services/posService';
import { useModuleSettings } from '../../hooks/useModuleSettings';
import toast from 'react-hot-toast';

export default function SaleForm({ isOpen, onClose, onSuccess }) {
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // null = walk-in
  const { settings } = useModuleSettings('pos', 'POS System');
  
  const taxRate = settings?.general?.taxRate || 0;
  const showTax = settings?.receipt?.showTax !== false;

  // Reset form when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setCartItems([]);
      setSelectedCustomer(null);
      setShowPayment(false);
    }
  }, [isOpen]);

  const addToCart = (product) => {
    const existing = cartItems.find(item => item.id === product._id);
    if (existing) {
      setCartItems(cartItems.map(item => 
        item.id === product._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCartItems([...cartItems, { 
        id: product._id, 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = (id) => setCartItems(cartItems.filter(item => item.id !== id));

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = showTax ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowPayment(true);
  };

  const handlePayment = async (paymentData) => {
    setLoading(true);
    try {
      const saleData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          tax: showTax ? item.price * item.quantity * (taxRate / 100) : 0
        })),
        paymentMethod: paymentData.paymentMethod,
        amountPaid: paymentData.amountPaid,
        customerId: selectedCustomer?._id || null
      };
      await posService.createSale(saleData);
      toast.success('Sale completed');
      setCartItems([]);
      setSelectedCustomer(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Sale failed');
    } finally {
      setLoading(false);
      setShowPayment(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="New Sale" size="xl">
        <div className="space-y-4">
          {/* Customer Selection */}
          <div className="px-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer (Optional)
            </label>
            <CustomerSelect 
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              placeholder="Search or leave empty for walk-in customer..."
            />
          </div>
          
          {/* Product Grid and Cart */}
          <div className="flex h-[450px] border-t pt-4">
            <div className="w-2/3 border-r pr-4">
              <ProductGrid onSelectProduct={addToCart} />
            </div>
            <div className="w-1/3 pl-4">
              <CartSidebar 
                items={cartItems} 
                onUpdateQuantity={updateQuantity} 
                onRemoveItem={removeItem} 
                onCheckout={handleCheckout}
                customerName={selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Walk-in Customer'}
              />
            </div>
          </div>
        </div>
      </Modal>
      {showPayment && (
        <PaymentModal 
          isOpen={showPayment}
          total={total} 
          onClose={() => setShowPayment(false)} 
          onConfirm={handlePayment}
          loading={loading}
        />
      )}
    </>
  );
}