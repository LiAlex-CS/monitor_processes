import React from "react";

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`my-4 bg-neutral-800 p-3 rounded-2xl ${className}`}>
      {children}
    </div>
  );
};

export default Container;
