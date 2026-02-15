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
import { CSS } from '@dnd-kit/utilities';
import './CaseList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faPesoSign, faMoneyBillWave, faTrash, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import endpoints from '../config';
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
            <div className="card-header">
                <span className="card-id">
                    {columnName
                        ? `${columnName.slice(0, 3).toUpperCase()}-${String(caseItem.caseId || caseItem._id).slice(-4).toUpperCase()}`
                        : (caseItem.caseId || caseItem._id)}
                </span>
                {/* Placeholder for menu/more options if needed */}
            </div>
            <div className="card-client">
                {caseItem.data?.clientDetails?.clientName ||
                    caseItem.data?.clientDetails?.businessName ||
                    'Unknown Client'}
            </div>

            <div className="card-footer-grid">
                <div className="card-info-item date-item">
                    <span className="icon"><FontAwesomeIcon icon={faCalendarAlt} /></span>
                    <span className="text">
                        {caseItem.data?.orderDetails?.leadTime || caseItem.data?.clientDetails?.date || 'N/A'}
                    </span>
                </div>

                <div className="card-info-item total-item">
                    <span className="icon"><FontAwesomeIcon icon={faPesoSign} /></span>
                    <span className="text">
                        {caseItem.data?.grandTotal || '0.00'}
                    </span>
                </div>
            </div >
        </div >
    );
};

// Droppable Column Component
const DroppableColumn = ({ id, title, count, children }) => {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="kanban-column">
            <div className="column-header">
                <h3 className="column-title">{title}</h3>
                <span className="column-count">{count}</span>
            </div>
            <div ref={setNodeRef} className="column-droppable">
                {children}
            </div>
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

const CaseList = ({ onSelectCase }) => {
    const [items, setItems] = useState({
        [COLUMNS.QUOTATION]: [],
        [COLUMNS.APPROVAL]: [],
        [COLUMNS.INVOICE]: [],
        [COLUMNS.DELIVERY]: [],
    });
    const [activeId, setActiveId] = useState(null);
    const [dragStartContainer, setDragStartContainer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
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
            // Function to fetch cases for a specific status
            const fetchByStatus = async (status) => {
                const response = await fetch(`${endpoints.caseList}?status=${status}`);
                if (!response.ok) {
                    console.warn(`Failed to fetch for status: ${status}`);
                    return [];
                }
                const result = await response.json();
                let cases = [];
                if (Array.isArray(result)) {
                    cases = result;
                } else if (result.data && Array.isArray(result.data)) {
                    cases = result.data;
                }
                // Add dndId
                return cases.map(c => ({
                    ...c,
                    dndId: String(c.caseId || c._id)
                }));
            };

            // Execute fetches in parallel
            // Execute fetches in parallel
            const [quotation, approval, invoice, delivery] = await Promise.all([
                fetchByStatus(COLUMN_TO_STATUS[COLUMNS.QUOTATION]),
                fetchByStatus(COLUMN_TO_STATUS[COLUMNS.APPROVAL]),
                fetchByStatus(COLUMN_TO_STATUS[COLUMNS.INVOICE]),
                fetchByStatus(COLUMN_TO_STATUS[COLUMNS.DELIVERY]),
            ]);

            setItems({
                [COLUMNS.QUOTATION]: quotation,
                [COLUMNS.APPROVAL]: approval,
                [COLUMNS.INVOICE]: invoice,
                [COLUMNS.DELIVERY]: delivery,
            });

        } catch (error) {
            console.error("Error loading cases:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateCaseStatus = async (caseId, newStatus) => {
        try {
            console.log(`Updating case ${caseId} to ${newStatus}`);
            const response = await fetch(endpoints.caseStatusUpdate, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    caseId: caseId,
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }
            console.log('Status updated successfully');
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

        // Prevent moving back from Approval to Quotation
        if (activeContainer === COLUMNS.APPROVAL) {
            if (overContainer === COLUMNS.QUOTATION) {
                return;
            }
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
                    showNotification(`Case ${item.caseId || item._id} moved to Trash.`, 'error');
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
        <div className="kanban-board">
            <br />
            <div className="kanban-header">
                <h2 className="page-title">Board</h2>
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
                            return (
                                <DroppableColumn
                                    key={columnId}
                                    id={columnId}
                                    title={columnId}
                                    count={items[columnId].length}
                                >
                                    <div className="card-list">
                                        <SortableContext
                                            id={columnId}
                                            items={items[columnId].map(c => c.dndId)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {items[columnId].map((caseItem) => (
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
