import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ name, className, onClick, style }) => {
  return (
    <span className={`material-symbols-outlined ${className || ''}`} onClick={onClick} style={style}>
      {name}
    </span>
  );
};

export default Icon;
