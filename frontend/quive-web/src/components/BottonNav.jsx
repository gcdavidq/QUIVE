import React from 'react';
import { Home, Package, Navigation, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <div className="bg-white border-t border-gray-200 p-4 flex justify-around shadow-lg">
      <div className="flex flex-col items-center text-blue-600">
        <Home size={24} />
        <span className="text-xs font-semibold">INICIO</span>
      </div>
      <div className="flex flex-col items-center text-gray-600">
        <Package size={24} />
        <span className="text-xs font-semibold">PEDIDOSSS</span>
      </div>
      <div className="flex flex-col items-center text-gray-600">
        <Navigation size={24} />
        <span className="text-xs font-semibold">SEGUIMIENTO</span>
      </div>
      <div className="flex flex-col items-center text-gray-600">
        <User size={24} />
        <span className="text-xs font-semibold">PERFIL</span>
      </div>
    </div>
  );
};

export default BottomNav;
