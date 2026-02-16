import React, { useState, useEffect } from 'react';
import endpoints from '../config';
import LedgerTable from './LedgerTable';

const MyCases = ({ currentUser }) => {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyCases = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(endpoints.caseList);
                if (!response.ok) {
                    throw new Error('Failed to fetch cases');
                }
                const result = await response.json();

                // Filter for cases created by current user
                const myCases = result.data.filter(c =>
                    c.createdBy && c.createdBy.email === currentUser?.emailAddress
                );

                setCases(myCases);
            } catch (error) {
                console.error("Error fetching my cases:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser) {
            fetchMyCases();
        }
    }, [currentUser]);

    if (isLoading) {
        return (
            <div className="dashboard-widget" style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your cases...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto' }}>
            <LedgerTable data={cases} title="My Cases" />
        </div>
    );
};

export default MyCases;
