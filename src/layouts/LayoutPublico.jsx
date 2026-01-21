import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LayoutPublico = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="flex-grow-1">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default LayoutPublico;

