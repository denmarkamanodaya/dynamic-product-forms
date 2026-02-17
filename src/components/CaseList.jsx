import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CaseService } from '../services/api';
import { currencyConfig } from '../config';
import { CSS } from '@dnd-kit/utilities';
import './CaseList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMoneyBillWave, faTrash, faClipboardCheck, faUser, faPlus, faSearch, faBox } from '@fortawesome/free-solid-svg-icons';

import { useNotification } from '../context/NotificationContext';

const TRASH_ID = 'trash-zone';

const COLUMNS = {
    QUOTATION: 'Quotation',
    APPROVAL: 'Approval',
    INVOICE: 'Invoice',
    DELIVERY: 'Delivery',
};

// Map internal column IDs to API status strings
const COLUMN_TO_STATUS = {
    [COLUMNS.QUOTATION]: 'quotation',
    [COLUMNS.APPROVAL]: 'approved',
    [COLUMNS.INVOICE]: 'invoicing',
    [COLUMNS.DELIVERY]: 'delivery',
};

// Helper functions (moved outside components)
const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
};

const renderUserAvatar = (user) => {
    if (!user) return <div className="user-avatar-circle unknown">?</div>;

    // Handle legacy string data
    if (typeof user === 'string') {
        return (
            <div className="user-avatar-circle legacy" title={user}>
                <FontAwesomeIcon icon={faUser} />
            </div>
        );
    }

    if (user.avatarUrl) {
        return <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} className="user-avatar-circle image" />;
    }

    let customStyle = {};
    if (user.metadata) {
        try {
            const meta = typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata;
            if (meta && meta.avatarColor) {
                customStyle = { background: meta.avatarColor }; // Override gradient
            }
        } catch (e) {
            // Ignore parse error
        }
    }

    const initials = getInitials(user.firstName, user.lastName);
    return (
        <div
            className="user-avatar-circle initials"
            title={`${user.firstName} ${user.lastName}`}
            style={customStyle}
        >
            {initials}
        </div>
    );
};

// Sortable Item Component (The Card)
const SortableItem = ({ id, caseItem, onClick, columnName }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="kanban-card"
            onClick={() => onClick(caseItem.caseId || caseItem._id)}
        >
            <div className="card-content">
                <div className="card-header-row">
                    <div className="card-client">
                        <div className="client-name">
                            {caseItem.data?.clientDetails?.clientName || 'Unknown Client'}
                        </div>
                        {caseItem.data?.clientDetails?.businessName && (
                            <div className="business-name">
                                {caseItem.data?.clientDetails?.businessName}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-footer-row">
                    <div className="card-info-item date-item">
                        <span className="icon"><FontAwesomeIcon icon={faCalendarAlt} /></span>
                        <span className="text">
                            {caseItem.data?.orderDetails?.leadTime || caseItem.data?.clientDetails?.date || 'N/A'}
                        </span>
                    </div>

                    <div className="card-info-item total-item">
                        <span className="text" style={{ fontWeight: 'bold' }}>
                            {currencyConfig.code} {caseItem.data?.grandTotal ? parseFloat(caseItem.data.grandTotal).toLocaleString(currencyConfig.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </span>
                    </div>

                    <div className="card-info-item">
                        <span className="icon"><FontAwesomeIcon icon={faBox} /></span>
                        <span className="text">
                            {caseItem.data?.products?.length || 0} Item{(caseItem.data?.products?.length || 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className="card-user-footer">
                    <span className={`compact-status-badge status-${COLUMN_TO_STATUS[columnName]}`}>
                        {columnName
                            ? `${columnName.slice(0, 3).toUpperCase()}-${String(caseItem.caseId || caseItem._id).slice(-4).toUpperCase()}`
                            : (caseItem.caseId || caseItem._id)}
                    </span>
                    {renderUserAvatar(caseItem.createdBy)}
                </div>
            </div>
        </div >
    );
};

// Droppable Column Component
const DroppableColumn = ({ id, title, count, children, onAdd }) => {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="kanban-column">
            <div className="column-header">
                <div className="header-title-row">
                    <h3 className="column-title">{title}</h3>
                    <span className="column-count">{count}</span>
                </div>
            </div>
            <div ref={setNodeRef} className="column-droppable">
                {children}
            </div>
            {onAdd && (
                <button
                    className="column-footer-add-btn"
                    onClick={() => onAdd('client-select')}
                >
                    <FontAwesomeIcon icon={faPlus} /> Add New Case
                </button>
            )}
        </div>
    );
};

const TrashDropZone = ({ isDelivery }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: TRASH_ID,
    });

    return (
        <div
            ref={setNodeRef}
            className={`trash-drop-zone ${isOver ? 'over' : ''} ${isDelivery ? 'complete-zone' : ''}`}
        >
            <FontAwesomeIcon icon={isDelivery ? faClipboardCheck : faTrash} />
            <span className="trash-label">{isDelivery ? 'Complete' : 'Delete'}</span>
        </div>
    );
};

const CaseList = ({ onSelectCase, currentUser, onNavigate }) => {
    const [items, setItems] = useState({
        [COLUMNS.QUOTATION]: [],
        [COLUMNS.APPROVAL]: [],
        [COLUMNS.INVOICE]: [],
        [COLUMNS.DELIVERY]: [],
    });
    const [activeId, setActiveId] = useState(null);
    const [dragStartContainer, setDragStartContainer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showNotification } = useNotification();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Require slight movement to prevent accidental drags on clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchAllCases();
    }, []);

    const fetchAllCases = async () => {
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
            } else if (!response.data) {
                // If response is not an array and has no data property, and we didn't match above matches
                // It might be empty or invalid, but let's not throw immediately if it's just empty
                console.warn('Empty or unexpected format', response);
            }

            // Distribute into columns
            const newItems = {
                [COLUMNS.QUOTATION]: [],
                [COLUMNS.APPROVAL]: [],
                [COLUMNS.INVOICE]: [],
                [COLUMNS.DELIVERY]: [],
            };

            allCases.forEach(c => {
                // Add dndId
                const caseItem = {
                    ...c,
                    dndId: String(c.caseId || c._id)
                };

                const status = (caseItem.status || '').toLowerCase();

                if (status === 'quotation') {
                    newItems[COLUMNS.QUOTATION].push(caseItem);
                } else if (status === 'approved') {
                    newItems[COLUMNS.APPROVAL].push(caseItem);
                } else if (status === 'invoicing') {
                    newItems[COLUMNS.INVOICE].push(caseItem);
                } else if (status === 'delivery') {
                    newItems[COLUMNS.DELIVERY].push(caseItem);
                }
            });

            setItems(newItems);

        } catch (error) {
            console.error("Error loading cases:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateCaseStatus = async (caseId, newStatus) => {
        try {
            console.log(`Updating case ${caseId} to ${newStatus}`);
            const payload = {
                caseId: caseId,
                status: newStatus,
                user: {
                    email: currentUser?.emailAddress,
                    firstName: currentUser?.firstName,
                    lastName: currentUser?.lastName,
                    avatarUrl: currentUser?.avatarUrl
                }
            };
            const response = await CaseService.updateStatus(payload);

            if (response.data && response.data.message === 'Status updated successfully') {
                console.log('Status updated successfully');
            } else {
                const errorData = response.data || {};
                throw new Error(errorData.message || 'Failed to update status');
            }
        } catch (error) {
            console.error("Error updating case status:", error);
            // Re-fetch on error to ensure UI is in sync
            fetchAllCases();
        }
    };

    const findContainer = (id) => {
        if (id in items) return id;
        return Object.keys(items).find((key) =>
            items[key].find((item) => item.dndId === id)
        );
    };

    const matchesSearch = (item) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        const caseId = (item.caseId || item._id || '').toLowerCase();
        const clientName = (item.data?.clientDetails?.clientName || item.data?.clientDetails?.businessName || '').toLowerCase();

        // Search by Case ID or Client Name
        return caseId.includes(query) || clientName.includes(query);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
        const container = findContainer(event.active.id);
        setDragStartContainer(container);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            // Check if overContainer is TRASH_ID
            if (overId === TRASH_ID) {
                // Allow dragging to trash/complete zone
                return;
            }
            return;
        }

        // STRICT One-Way Delivery: Cannot move OUT of Delivery to another column
        if (dragStartContainer === COLUMNS.DELIVERY) {
            return;
        }

        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex((item) => item.dndId === active.id);
            const overIndex = overItems.findIndex((item) => item.dndId === overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.dndId !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                ],
            };
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over?.id);

        // One-Way Restriction Notification
        if (dragStartContainer === COLUMNS.DELIVERY && activeContainer === COLUMNS.DELIVERY && overContainer && overContainer !== COLUMNS.DELIVERY && over?.id !== TRASH_ID) {
            showNotification("Delivery cases cannot be moved back to previous stages.", "error");
        }

        // Handle Drop to Trash/Complete Zone
        if (over?.id === TRASH_ID) {
            // Use dragStartContainer to find the ORIGINAL item state before drag-over mutations
            // NOTE: items state has been mutated by dragOver, so iterating items might look for it in new location.
            // But we need the item object to get caseId. 
            // We can find the item in activeContainer (where it is NOW visually)
            const item = items[activeContainer]?.find(i => i.dndId === active.id);

            if (item) {
                // Determine new status based on START container, not current activeContainer
                const newStatus = dragStartContainer === COLUMNS.DELIVERY ? 'completed' : 'deleted';

                // Optimistic update: Remove from UI
                setItems((prev) => ({
                    ...prev,
                    [activeContainer]: prev[activeContainer].filter((i) => i.dndId !== active.id),
                }));
                // API Call
                updateCaseStatus(item.caseId || item._id, newStatus);

                // Show Notification
                if (newStatus === 'completed') {
                    showNotification(`Case ${item.caseId || item._id} marked as Completed!`, 'success');
                } else {
                    showNotification(`Case ${item.caseId || item._id} moved to Trash.`, 'info');
                }
            }
            setActiveId(null);
            setDragStartContainer(null);
            return;
        }

        if (
            activeContainer &&
            overContainer &&
            activeContainer === overContainer
        ) {
            const activeIndex = items[activeContainer].findIndex((item) => item.dndId === active.id);
            const overIndex = items[overContainer].findIndex((item) => item.dndId === over?.id);

            if (activeIndex !== overIndex) {
                setItems((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
                }));
            }
        }

        setActiveId(null);
        setDragStartContainer(null);

        // Final Status Check & Update
        // activeContainer is where the item ended up after DragOver + DragEnd
        if (activeContainer) {
            const newStatus = COLUMN_TO_STATUS[activeContainer];
            const item = items[activeContainer].find(i => i.dndId === active.id);

            if (item && newStatus) {
                const currentStatus = (item.status || 'active').toLowerCase();
                // If the item's internal status does not match the container's mapped status, update it.
                // This covers cross-column moves.
                if (currentStatus !== newStatus) {
                    item.status = newStatus; // Optimistic update
                    updateCaseStatus(item.caseId || item._id, newStatus);
                }
            }
        }
    };

    return (
        <div className="case-list-page">
            <br />
            <div className="kanban-header">
                <h2 className="page-title">Board</h2>
                <div className="kanban-controls">
                    <div className="kanban-search-wrapper">
                        <div className="kanban-search">
                            <FontAwesomeIcon icon={faSearch} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search Case ID or Client..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="kanban-users-monitor">
                        {Array.from(new Set(Object.values(items).flat().map(i => i.createdBy?.email || i.createdBy))).map(userRef => {
                            // Find the full user object from the first item that matches
                            const item = Object.values(items).flat().find(i => (i.createdBy?.email || i.createdBy) === userRef);
                            return (
                                <div key={userRef} className="monitor-avatar" title={typeof item.createdBy === 'object' ? `${item.createdBy.firstName} ${item.createdBy.lastName}` : item.createdBy}>
                                    {renderUserAvatar(item.createdBy)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>


            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading cases...</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="kanban-columns-container">
                        {Object.keys(COLUMNS).map((key) => {
                            const columnId = COLUMNS[key];
                            // Filter items for display
                            const filteredItems = items[columnId].filter(matchesSearch);

                            return (
                                <DroppableColumn
                                    key={columnId}
                                    id={columnId}
                                    title={key}
                                    count={filteredItems.length}
                                    onAdd={key === 'QUOTATION' ? onNavigate : null}
                                >
                                    <div className="card-list">
                                        <SortableContext
                                            id={columnId}
                                            items={filteredItems.map(c => c.dndId)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {filteredItems.map((caseItem) => (
                                                <SortableItem
                                                    key={caseItem.dndId}
                                                    id={caseItem.dndId}
                                                    caseItem={caseItem}
                                                    onClick={onSelectCase}
                                                    columnName={columnId}
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </DroppableColumn>
                            );
                        })}
                        {activeId && <TrashDropZone isDelivery={dragStartContainer === COLUMNS.DELIVERY} />}
                    </div>
                    <DragOverlay>
                        {activeId ? (
                            <div className="kanban-card overlay">
                                <div className="card-header">
                                    <span className="card-id">{activeId}</span>
                                </div>
                                <div className="card-client">Moving...</div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
};

export default CaseList;
