"use client"

import { useAuth } from '@/hooks/AuthProvider'

const HomePage = () => {

    const { user } = useAuth();

    return (
        <div className="flex_col_center w-full">
            Home

            <p>User ID: {user?.id}</p>
            <p>User email: {user?.email}</p>
        </div>
    )
}

export default HomePage;