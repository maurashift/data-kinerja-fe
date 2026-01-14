import React from 'react';

type ContentContainerProps = {
  children: React.ReactNode;
  className?: string; 
};

const ContentContainer = ({ children, className = '' }: ContentContainerProps) => {
  return (
    <div className={`bg-white rounded-b-lg border border-gray-300 border-t-0 shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export default ContentContainer;