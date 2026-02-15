import React, { useMemo, useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faShoppingCart, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import './SalesDashboard.css';
import endpoints from '../config';

const SalesDashboard = () => {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompletedCases = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(endpoints.caseCompleted); // Use config endpoint
                if (response.ok) {
                    const result = await response.json();
                    let data = [];
                    if (Array.isArray(result)) {
                        data = result;
                    } else if (result.data && Array.isArray(result.data)) {
                        data = result.data;
                    }
                    setCases(data);
                }
            } catch (error) {
                console.error("Failed to fetch completed cases for dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompletedCases();
    }, []);

    // Process data for the chart
    const data = useMemo(() => {
        if (!cases || cases.length === 0) return [];

        const monthlyData = {};

        cases.forEach(c => {
            const date = c.timestamp ? new Date(c.timestamp) : new Date();
            const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    name: monthKey,
                    sales: 0,
                    orders: 0
                };
            }

            const total = parseFloat(c.data?.grandTotal || 0);
            monthlyData[monthKey].sales += total;
            monthlyData[monthKey].orders += 1;
        });

        // Convert to array and sort by date
        return Object.values(monthlyData).sort((a, b) => {
            return new Date(a.name) - new Date(b.name);
        });
    }, [cases]);

    const totalSales = useMemo(() => {
        return cases.reduce((acc, curr) => acc + parseFloat(curr.data?.grandTotal || 0), 0);
    }, [cases]);

    const totalOrders = cases.length;

    return (
        <div className="dashboard-layout">
            <div className="dashboard-widget sales-widget">
                <div className="dashboard-header">
                    <h3 className="dashboard-title">
                        <FontAwesomeIcon icon={faChartLine} /> Sales Performance
                    </h3>
                </div>

                <div className="dashboard-metrics">
                    <div className="metric-card sales">
                        <div className="metric-icon">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                        </div>
                        <div className="metric-content">
                            <span className="metric-label">Total Sales</span>
                            <span className="metric-value">Php {totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="metric-card orders">
                        <div className="metric-icon">
                            <FontAwesomeIcon icon={faShoppingCart} />
                        </div>
                        <div className="metric-content">
                            <span className="metric-label">Total Orders</span>
                            <span className="metric-value">{totalOrders}</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-chart">
                    {isLoading ? (
                        <div className="loading-container" style={{ height: '300px' }}>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '0px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value) => [`Php ${value.toLocaleString()}`, 'Sales']}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    name="Sales Amount"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Placeholder for Product Monitoring */}
            <div className="dashboard-widget products-widget">
                <div className="dashboard-header">
                    <h3 className="dashboard-title">
                        <FontAwesomeIcon icon={faShoppingCart} /> Product Monitoring
                    </h3>
                </div>
                <div className="placeholder-content">
                    <p style={{ color: '#64748b', textAlign: 'center', marginTop: '2rem' }}>
                        Product analytics module coming soon...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
