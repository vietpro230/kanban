import { useI18n } from "@/contexts/i18n/i18nProvider";
import { KanbanType } from "@/types/enum";
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Popover, Row, Space, Typography } from "antd";
import useToken from "antd/es/theme/useToken";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Card, Id } from "../../types/KanBanType";
import { cn } from "@/lib/utils";
import TextArea from "antd/es/input/TextArea";
interface CardProps {
    card: Card;
    deleteCard: (id: Id) => void;
    updateCard: (id: Id, title: string) => void;
    containerStyle?: React.CSSProperties;
}

const KanbanCard = ({ card, deleteCard, updateCard, containerStyle }: CardProps) => {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const token = useToken()
    const [isEdit, setIsEdit] = useState(false);
    const { setNodeRef, attributes, listeners, transform, transition, isDragging, } = useSortable(
        {
            id: card.id,
            data: {
                type: KanbanType.KanbanCard,
                card,
            },
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={{
                    backgroundColor: token[3].colorBgLayout,
                    ...style
                }}
                className="flex justify-between items-center h-[48px] p-2 rounded-lg mb-2 border-2 gap-2"
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                backgroundColor: token[3].colorBgLayout,
                ...style,
                ...containerStyle
            }}
            {...attributes}
            {...listeners}
            className={cn('flex flex-col p-2 rounded-lg')}
        >
            <Row justify={'space-between'} className="h-full">
                {!isEdit && <Typography.Title level={5}>{card.content}</Typography.Title>}
                {isEdit && (
                    <span className="flex flex-1">
                        <TextArea
                            autoSize={{ minRows: 3, maxRows: 5 }}
                            autoFocus
                            onBlur={() => setIsEdit(false)}
                            value={card.content}
                            onChange={(e) => updateCard(card.id, e.target.value)}
                        />
                    </span>
                )}
                <Popover
                    style={{
                        cursor: "pointer",
                        marginLeft: "8px",
                    }}
                    trigger={"click"}
                    placement="rightBottom"
                    content={
                        <Space direction="vertical" style={{}}>
                            <Button
                                icon={<EditOutlined />}
                                type="text"
                                onClick={() => {
                                    setIsEdit(true);
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "flex-start",
                                }}
                            >
                                {i18n.Card['Edit card']}
                            </Button>
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger={true}
                                onClick={() => {
                                    deleteCard(card.id);
                                }}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "flex-start",
                                }}
                            >
                                {i18n.Card['Delete card']}
                            </Button>
                        </Space>
                    }
                >
                    <Button
                        type="text"
                        style={{
                            padding: "18px 8px",
                        }}
                    >
                        {<MoreOutlined />}
                    </Button>
                </Popover>
            </Row>
        </div>
    );
};

export default KanbanCard;
