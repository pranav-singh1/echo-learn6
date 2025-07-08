import React from 'react';
import LogoFull from './LogoFull';

interface LogoProps {
  className?: string;
  forceBlack?: boolean;
  [key: string]: any;
}

const Logo: React.FC<LogoProps> = ({ forceBlack = false, ...props }) => {
  if (forceBlack) {
    return (
      <img
        src="/logo-black.png"
        alt="EchoLearn Logo"
        className={props.className || ""}
        {...props}
      />
    );
  }
  
  return <LogoFull {...props} />;
};

export default Logo; 