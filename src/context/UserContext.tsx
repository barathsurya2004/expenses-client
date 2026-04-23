import React, { createContext, useContext, useEffect, useState } from 'react';
import { setApiAuthToken } from '../services/apiService';

// Define the shape of the user data
interface User {
    id: string;
    name: string;
    email: string;
    token: string; // Add token field
}

// Create a default mock user
const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john.doe@example.com',
    token: 'mock-token-12345', // Add mock token
};

// Ensure token is available before child widgets fire initial API requests.
setApiAuthToken(mockUser.token);

// Create the UserContext
const UserContext = createContext<User | undefined>(undefined);

// Create a provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user] = useState<User>(mockUser);

    useEffect(() => {
        setApiAuthToken(user.token);
    }, [user.token]);

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

// Custom hook to use the UserContext
export const useUser = (): User => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};