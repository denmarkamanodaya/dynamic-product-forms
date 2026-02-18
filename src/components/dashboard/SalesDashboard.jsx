import React, { useMemo, useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    ComposedChart
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faShoppingCart, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import './SalesDashboard.css';
import { CaseService, ReportService } from '../../services/api';
import { currencyConfig } from '../../config';
import MyCases from '../cases/MyCases';

const SalesDashboard = () => {
    const [cases, setCases] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [casesRes, productsRes] = await Promise.all([
                    CaseService.list({ status: 'completed' }),
                    ReportService.topProducts()
                ]);

                if (Array.isArray(casesRes)) {
                    setCases(casesRes);
                } else if (casesRes.data) {
                    let data = [];
                    if (Array.isArray(casesRes.data)) {
                        data = casesRes.data;
                    } else if (casesRes.data.data && Array.isArray(casesRes.data.data)) {
                        data = casesRes.data.data;
                    }
                    setCases(data);
                }

                if (Array.isArray(productsRes)) {
                    setTopProducts(productsRes);
                } else if (productsRes.data) {
                    let data = [];
                    if (Array.isArray(productsRes.data)) {
                        data = productsRes.data;
                    } else if (productsRes.data.data && Array.isArray(productsRes.data.data)) {
                        data = productsRes.data.data;
                    }
                    setTopProducts(data);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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

    // Process data for Client Performance (New)
    const clientPerformanceData = useMemo(() => {
        if (!cases || cases.length === 0) return [];

        const clientData = {};

        cases.forEach(c => {
            const clientName = c.data?.clientDetails?.clientName || c.data?.clientDetails?.businessName || 'Unknown';
            if (!clientData[clientName]) {
                clientData[clientName] = {
                    name: clientName,
                    sales: 0,
                    items: 0,
                    cases: 0
                };
            }

            const total = parseFloat(c.data?.grandTotal || 0);
            const items = (c.data?.products || []).reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);

            clientData[clientName].sales += total;
            clientData[clientName].items += items;
            clientData[clientName].cases += 1;
        });

        // Convert to array, sort by sales desc, take top 10
        return Object.values(clientData)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10);
    }, [cases]);

    const totalSales = useMemo(() => {
        return cases.reduce((acc, curr) => acc + parseFloat(curr.data?.grandTotal || 0), 0);
    }, [cases]);

    const totalOrders = cases.length;

    return (
        <div className="sales-dashboard-wrapper">
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
                                <span className="metric-value">{currencyConfig.code} {totalSales.toLocaleString(currencyConfig.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                            <div className="loading-container" style={{ height: '200px' }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart
                                    data={data}
                                    margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
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
                                        tickFormatter={(value) => `${currencyConfig.symbol}${value.toLocaleString()}`}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '0px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value) => [`${currencyConfig.code} ${value.toLocaleString()}`, 'Sales']}
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

                {/* Product Monitoring */}
                <div className="dashboard-widget products-widget">
                    <div className="dashboard-header">
                        <h3 className="dashboard-title">
                            <FontAwesomeIcon icon={faShoppingCart} /> Top 10 Sales by Product (Quantity)
                        </h3>
                    </div>
                    {/* ... chart content ... */}
                    <div className="dashboard-chart">
                        {isLoading ? (
                            <div className="loading-container" style={{ height: '200px' }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={topProducts}
                                    layout="vertical"
                                    margin={{ top: 5, right: 15, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '0px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="quantity" name="Quantity Sold" fill="#10b981" barSize={20} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Client Performance Widget */}
                <div className="dashboard-widget client-performance-widget">
                    <div className="dashboard-header">
                        <h3 className="dashboard-title">
                            <FontAwesomeIcon icon={faChartLine} /> Top Clients Performance
                        </h3>
                    </div>
                    <div className="dashboard-chart">
                        {isLoading ? (
                            <div className="loading-container" style={{ height: '200px' }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <ComposedChart
                                    data={clientPerformanceData}
                                    margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        dy={10}
                                        interval={0}
                                        angle={-15}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => `${currencyConfig.symbol}${value.toLocaleString()}`}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '0px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value, name) => {
                                            if (name === 'Total Sales') return [`${currencyConfig.code} ${value.toLocaleString()}`, name];
                                            return [value, name];
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="sales"
                                        name="Total Sales"
                                        fill="#3b82f6"
                                        barSize={20}
                                        radius={[4, 4, 0, 0]}
                                        fillOpacity={0.6}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="items"
                                        name="Total Items"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', r: 3 }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="cases"
                                        name="Total Cases"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', r: 3 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Case Browser (replaces LedgerTable) */}
            <MyCases showAllCases title="Recent Transactions" onNavigate={() => { }} />
        </div>
    );
};

export default SalesDashboard;
