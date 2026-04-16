import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-lg border 
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} 
            focus:border-transparent outline-none transition
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;