import react from 'react';
import Header from './Header';
import BottonNav from './BottonNav';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>
            <div className="pb-20">{children} </div>
            <div className="fixed bottom-o left-o right-0">
                <BottonNav/>
            </div>
        </div>

    );
};

export default DashboardLayout;