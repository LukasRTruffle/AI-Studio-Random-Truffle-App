import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select: React.FC<SelectProps> = ({ children, className, ...props }) => {
  const baseStyles =
    'block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md';
  return (
    <select className={`${baseStyles} ${className}`} {...props}>
      {children}
    </select>
  );
};

export default Select;
