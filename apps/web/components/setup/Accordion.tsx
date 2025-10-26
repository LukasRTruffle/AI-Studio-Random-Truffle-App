import React, { useState } from 'react';
import Icon from '../Icon';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-md mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4"
      >
        <span>{title}</span>
        <Icon name={isOpen ? 'expand_less' : 'expand_more'} />
      </button>
      {isOpen && <div className="p-4 border-t">{children}</div>}
    </div>
  );
};

export default Accordion;
