import React, { createContext, useContext, useState } from 'react';

const TicketsContext = createContext();

export const useTickets = () => {
    return useContext(TicketsContext);
};

export const TicketsProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    const value = {
        loading,
        setLoading
    };

    return (
        <TicketsContext.Provider value={value}>
            {children}
        </TicketsContext.Provider>
    );
};
