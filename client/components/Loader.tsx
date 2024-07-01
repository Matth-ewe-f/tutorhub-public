"use client"
import React from 'react';
import NavBar from './Navbar';
import "../styles/loader.css";

const Loader: React.FC = () => {
    return (
        <>
        <NavBar />
        <div className="flex flex-col items-center justify-center min-h-96">
            <div className="flex justify-center items-center">
                <div className="loader">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
        </div>
        </div>
            <h1 className="mt-8 text-center font-sans uppercase">Loading...</h1>
        </div>
        </>
    );
};

export default Loader;
