// ==================== Currency Formatting ====================
export const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
  if (amount === null || amount === undefined) return `${currency} 0.00`;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

// ==================== Date Formatting ====================
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-KE');
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-KE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  if (format === 'datetime') {
    return d.toLocaleString('en-KE');
  }
  if (format === 'YYYY-MM-DD') {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (format === 'DD/MM/YYYY') {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  
  return d.toISOString().split('T')[0];
};

// ==================== Time Formatting ====================
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatTimeWithSeconds = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// ==================== Number Formatting ====================
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// ==================== Phone Formatting ====================
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
  }
  return phone;
};

// ==================== Text Formatting ====================
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => capitalizeFirst(word)).join(' ');
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ==================== File Size Formatting ====================
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ==================== Duration Formatting ====================
export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const formatHours = (hours) => {
  if (!hours && hours !== 0) return '0.00h';
  return `${hours.toFixed(2)}h`;
};

// ==================== ID Generation ====================
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

export const generateEmployeeId = () => {
  return generateId('EMP');
};

export const generateInvoiceNumber = () => {
  return generateId('INV');
};

export const generateTransactionId = () => {
  return generateId('TRX');
};

// ==================== Date Calculations ====================
export const calculateWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const curDate = new Date(start);
  
  while (curDate <= end) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};

export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const getAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// ==================== Status Helpers ====================
export const getStatusColor = (status, type = 'default') => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-blue-100 text-blue-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-orange-100 text-orange-800',
    half_day: 'bg-yellow-100 text-yellow-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// ==================== Debounce ====================
export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// ==================== Array Helpers ====================
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });
};

// ==================== Random Color Generator ====================
export const generateRandomColor = () => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// ==================== Sleep/Delay ====================
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));