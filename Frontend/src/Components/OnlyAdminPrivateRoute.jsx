import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function OnlyAdminPrivateRoute() {
    const { currentUser } = useSelector((state) => state.user);
    const [hasAdminAccess, setHasAdminAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminAccess = async () => {
            // Check both Redux store and localStorage

            let user = currentUser;
            let token = currentUser?.token;
            console.log(currentUser);
            if (!user || !token) {
                // Fallback to localStorage if Redux is empty
                const localUser = localStorage.getItem('user');
                const localToken = localStorage.getItem('token');
                const isAdmin = localStorage.getItem('isAdmin') === 'true';

                if (localUser && localToken && isAdmin) {
                    user = JSON.parse(localUser);
                    token = localToken;
                } else {
                    setLoading(false);
                    return;
                }
            }

            try {
                const response = await fetch(`/api/admin/permissions/${user.user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to verify admin status');
                }
                
                const data = await response.json();
                setHasAdminAccess(data.isAdmin);
            } catch (error) {
                console.error('Admin verification error:', error);
                setHasAdminAccess(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminAccess();
    }, [currentUser]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return hasAdminAccess ? <Outlet /> : <Navigate to="/sign-in" />;
}