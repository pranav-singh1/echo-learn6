
import React from 'react';
import { Github, Shield, Info } from 'lucide-react';

const Footer: React.FC = () => {
  const links = [
    { name: 'About', href: '#', icon: Info },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Privacy', href: '#', icon: Shield }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <span className="text-sm text-gray-600">© 2024 EchoLearn</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-500">Learn by teaching aloud</span>
        </div>
        
        <div className="flex items-center space-x-6">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <link.icon className="w-4 h-4" />
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
