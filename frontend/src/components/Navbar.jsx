import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <span>🚚</span> SpeedWheels
        </Link>
        <div className="flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
          <Link to="/book" className="text-gray-700 hover:text-blue-600 font-medium">Book Now</Link>
          <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium">Admin</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
