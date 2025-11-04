
import React from 'react';
import { ShirtIcon } from './IconComponents';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <ShirtIcon className="h-8 w-8 text-indigo-600 mr-3" />
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Wirtualna Przymierzalnia</h1>
            <p className="text-sm text-gray-500">Przymierz ubrania online z pomocą AI</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
