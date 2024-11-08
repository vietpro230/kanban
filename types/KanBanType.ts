export type Id = string | number;

export type Column = {
    id: Id;
    columnIndex: number;
    title: string;
    workspaceId: Id;
    cards: Id[];
};

export type Card = {
    id: Id;
    columnId: Id;
    cardIndex: number;
    content: string;
};
