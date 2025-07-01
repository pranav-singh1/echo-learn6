import React from "react";

const LogoFull = ({ className = "", ...props }) => (
  <>
    {/* Light mode logo */}
    <img
      src="/logo-black.png"
      alt="EchoLearn Logo"
      className={`block dark:hidden ${className}`}
      {...props}
    />
    {/* Dark mode logo */}
    <img
      src="/logo-white.png"
      alt="EchoLearn Logo"
      className={`hidden dark:block ${className}`}
      {...props}
    />
  </>
);

export default LogoFull; 