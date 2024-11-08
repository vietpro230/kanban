export enum FireStoreCollections {
    WORKSPACES = "workspaces",
    USER_DATA = "userData",
    COLUMN = "column",
    CARD = "card",
}

export const FireStoreCollectionFields = {
    WORKSPACES: {
        NAME: "name",
        ICON_UNIFIED: "icon_unified",
        MEMBERS: "members",
    } as const,
    USER_DATA: {
        WORKSPACE_ORDER: "workSpaceOrder",
    } as const,
    COLUMN: {
        ID: 'id',
        TITLE: "title",
        WORKSPACE_ID: "workspaceId",
        COLUMN_INDEX: 'columnIndex',
        CARDS: "cards",
    } as const,

    CARD: {
        ID: 'id',
        CARD_INDEX: 'cardIndex',
        COLUMN_ID: 'columnId',
        CONTENT: 'content',
    } as const,
}