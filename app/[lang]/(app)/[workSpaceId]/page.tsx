"use client";
import { addCardAPI, addIDCardToColumnAPI, getCardOfWorkspaceAPI, removeCardAPI, updateCardAPI, updateIndexDiffColumnAPI, updateIndexInColumnAPI } from "@/api/card";
import { addColumnAPI, getColumnsAPI, removeColumnAPI, updateColumnPositionAPI, updateColumnTitleAPI } from "@/api/column";
import KanbanColumn from "@/components/Kanban/KanBanColumn";
import KanbanCard from "@/components/Kanban/KanbanCard";
import { useTheme } from "@/contexts/Theme/ThemeProvider";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { cn } from "@/lib/utils";
import { Card, Column, Id } from "@/types/KanBanType";
import { KanbanType } from "@/types/enum";
import { PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button, Input, Layout, Space } from "antd";
import { Content } from "antd/es/layout/layout";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import WorkSpaceHeader from "./header";
import { useMutation } from "@tanstack/react-query";

interface Props {
    params: {
        workSpaceId: string;
    };
}
const KanbanBoard = ({ params: { workSpaceId } }: Props) => {
    const { themeApp } = useTheme()
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [searchValue, setSearchValue] = useState("");

    const columsId = useMemo(
        () => columns.map((column) => column.id),
        [columns],
    );
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeCard, setActiveCard] = useState<Card | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 30,
            },
        }),
    );


    const createColumnMutation = useMutation({
        mutationFn: async () => {
            const newColumn: Column = {
                id: Math.random(),
                title: `Column ${columns.length + 1}`,
                columnIndex: columns.length,
                workspaceId: workSpaceId,
                cards: [],
            };
            await addColumnAPI(newColumn);
            const data = await getColumnsAPI(workSpaceId);
            setColumns(data);
        }
    })

    function deleteColumn(id: Id) {
        const newColumns = columns.filter((column) => column.id !== id);
        setColumns(newColumns);
        removeColumnAPI(id);
    }

    function onDragStart(event: DragStartEvent) {
        if (
            event.active.data.current === null ||
            event.active.data.current === undefined
        )
            return;
        if (event.active.data.current.type === KanbanType.KanbanColumn) {
            setActiveColumn(event.active.data.current.column);
            return;
        }
        if (event.active.data.current.type === KanbanType.KanbanCard) {
            setActiveCard(event.active.data.current.card);
            return;
        }
    }

    async function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveCard(null);
        const { active, over } = event;
        if (!over) {
            return;
        }
        const activeColumnId = active.id;
        const overColumnId = over.id;

        if (activeColumnId === overColumnId) return;

        const activeColumnIndex = columns.findIndex(
            (column) => column.id === activeColumnId,
        );
        const overColumnIndex = columns.findIndex(
            (column) => column.id === overColumnId,
        );
        setColumns((columns) => {
            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
        updateColumnPositionAPI(
            activeColumnId,
            activeColumnIndex,
            overColumnId,
            overColumnIndex,
        );
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id;
        const overId = over.id;

        if (active.data.current === null || active.data.current === undefined)
            return;
        if (over.data.current === null || over.data.current === undefined)
            return;

        const isActiveACard =
            active.data.current.type === KanbanType.KanbanCard;
        const isOverACard = over.data.current.type === KanbanType.KanbanCard;

        if (!isActiveACard) return;

        if (isActiveACard && isOverACard) {
            setCards((cards) => {
                const activeIndex = cards.findIndex(
                    (card) => card.id === activeId,
                );
                const overIndex = cards.findIndex((card) => card.id === overId);
                cards[activeIndex].columnId = cards[overIndex].columnId;
                updateIndexInColumnAPI(
                    activeId,
                    activeIndex,
                    overId,
                    overIndex,
                );

                return arrayMove(cards, activeIndex, overIndex);
            });
        }
        const isOverAcolumn =
            over.data.current.type === KanbanType.KanbanColumn;
        if (isActiveACard && isOverAcolumn) {
            setCards((cards) => {
                const activeIndex = cards.findIndex(
                    (card) => card.id === activeId,
                );
                const overIndex = cards.findIndex(
                    (card) => card.columnId === overId,
                );
                cards[activeIndex].columnId = overId;
                updateIndexDiffColumnAPI(activeId, overId, overIndex);
                return arrayMove(cards, activeIndex, activeIndex);
            });
        }
    }

    async function updateColumnTitle(id: Id, title: string) {
        setColumns((columns) =>
            columns.map((column) => {
                if (column.id === id) {
                    return { ...column, title };
                }
                return column;
            }),
        );
        await updateColumnTitleAPI(id, title);
    }

    async function createCard(id: Id) {
        const cardsAPI = await getCardOfWorkspaceAPI(workSpaceId);
        const newCard: Card = {
            id: Math.random(),
            columnId: id,
            cardIndex: cards.length,
            content: `Card ${cardsAPI.length + 1}`,
        };


        addIDCardToColumnAPI(id, newCard.id);
        addCardAPI(newCard);
        const data = await getCardOfWorkspaceAPI(workSpaceId);
        setCards(data);
    }

    function deleteCard(id: Id) {
        const newCards = cards.filter((card) => card.id !== id);
        removeCardAPI(id);
        setCards(newCards);
    }

    function updateCard(id: Id, content: string) {
        updateCardAPI(id, content);
        setCards((cards) =>
            cards.map((card) => {
                if (card.id === id) {
                    return { ...card, content };
                }
                return card;
            }),
        );

    }
    async function handleFilterSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const searchValue = e.target.value;
        setSearchValue(searchValue);
        const newFilterCards = await getCardOfWorkspaceAPI(workSpaceId)
        const newFilterColumns = await getColumnsAPI(workSpaceId)

        const filterCards = newFilterCards.filter((card) => card.content.includes(searchValue))
        const filterColumns = newFilterColumns.filter((column) => {
            const cards = filterCards.filter((card) => card.columnId === column.id)
            return cards.length > 0
        })

        setColumns(filterColumns)
        setCards(filterCards)
    }

    async function refreshData() {
        const columns = await getColumnsAPI(workSpaceId);
        const cards = await getCardOfWorkspaceAPI(workSpaceId);
        setCards(cards);
        setColumns(columns);
    }





    useEffect(() => {
        (async () => {
            refreshData();
        })();
    }, []);

    return (
        <Layout className="w-full h-full">
            <Space direction="vertical" size={'middle'}>
                <WorkSpaceHeader workSpaceId={workSpaceId} />
                <div>
                    <Input
                        size="large"
                        placeholder="Search"
                        value={searchValue}
                        onChange={handleFilterSearch}
                        style={{
                            width: 412,
                        }}
                    />
                </div>
            </Space>
            <Content className={
                cn('mt-6 pb-6', {
                    'scrollbar': themeApp === 'light',
                    'scrollbarDark': themeApp === 'dark',
                })
            }
                style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                }}
            >
                <DndContext
                    sensors={sensors}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                >

                    <div className="mx-auto flex h-full">
                        <div className="flex gap-4 flex-row">
                            <SortableContext
                                items={columsId}
                                strategy={verticalListSortingStrategy}
                            >
                                {columns.map((column) => (
                                    <KanbanColumn
                                        key={column.id}
                                        column={column}
                                        deleteColumn={deleteColumn}
                                        updateColumn={updateColumnTitle}
                                        createCard={createCard}
                                        cards={cards.filter(
                                            (card) =>
                                                card.columnId === column.id,
                                        )}
                                        deleteCard={deleteCard}
                                        updateCard={updateCard}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                        <Button onClick={() => {
                            createColumnMutation.mutate()
                        }} variant="outlined" icon={<PlusCircleOutlined />}
                            className="min-w-[284px]"
                            style={{
                                padding: "18px 8px",
                                marginLeft: columns.length === 0 ? 0 : 16,
                            }}
                            loading={createColumnMutation.isPending}
                        >
                            {i18n.Column['Add column']}
                        </Button>
                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeColumn && (
                                <KanbanColumn
                                    column={activeColumn}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumnTitle}
                                    createCard={createCard}
                                    cards={cards.filter(
                                        (card) =>
                                            card.columnId === activeColumn.id,
                                    )}
                                    deleteCard={deleteCard}
                                    updateCard={updateCard}
                                />
                            )}
                            {activeCard && (
                                <KanbanCard
                                    card={activeCard}
                                    deleteCard={deleteCard}
                                    updateCard={updateCard}
                                />
                            )}
                        </DragOverlay>,
                        document.body,
                    )}
                </DndContext>
            </Content>
        </Layout>
    );
};

export default KanbanBoard;
