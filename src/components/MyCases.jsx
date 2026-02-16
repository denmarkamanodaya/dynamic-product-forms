import React, { useState, useEffect } from 'react';
import { CaseService } from '../services/api';
import LedgerTable from './LedgerTable';

const MyCases = ({ currentUser }) => {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyCases = async () => {
            setIsLoading(true);
            try {
                const response = await CaseService.list();
                let allCases = [];
                if (Array.isArray(response)) {
                    allCases = response;
                } else if (response.data && Array.isArray(response.data)) {
                    allCases = response.data;
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    allCases = response.data.data;
                }

                console.log('MyCases: currentUser:', currentUser);
                console.log('MyCases: allCases count:', allCases.length);

                // Filter for cases created by current user
                const myCases = allCases.filter(c => {
                    if (!c.createdBy) return false;

                    let creatorEmail = '';
                    if (typeof c.createdBy === 'string') {
                        creatorEmail = c.createdBy;
                    } else {
                        // Check both email and emailAddress to be safe
                        creatorEmail = c.createdBy.email || c.createdBy.emailAddress;
                    }

                    const userEmail = currentUser?.emailAddress || currentUser?.email;

                    const match = creatorEmail === userEmail;
                    if (!match && c.createdBy.email === 'admin') {
                        // Debug log for failed matches to see why
                        // console.log(`Mismatch: Case ${c.caseId} creator ${creatorEmail} vs user ${userEmail}`);
                    }
                    return match;
                });

                console.log('MyCases: filtered count:', myCases.length);
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
