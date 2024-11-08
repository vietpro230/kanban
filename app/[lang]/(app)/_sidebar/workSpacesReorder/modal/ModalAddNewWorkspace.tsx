import { addWorkSpace } from "@/api/workSpace";
import { FireStoreCollections } from "@/constants/FirebaseConstants";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { useAuth } from "@/hooks/useAuth";
import { WorkSpaceType } from "@/types/WorkSpaceType";
import { useMutation } from "@tanstack/react-query";
import {
    Button,
    Input,
    InputRef,
    message,
    Modal,
    Popover,
    Row,
    Space,
    Typography,
} from "antd";
import EmojiPicker, { Emoji } from "emoji-picker-react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

interface AddNewWorkspaceModalProps {
    open: boolean;
    onCancel: () => void;
}

export const AddNewWorkspaceModal = ({
    open,
    onCancel,
}: AddNewWorkspaceModalProps) => {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const { user } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    const workspaceInputRef = useRef<InputRef>(null);

    const [workSpaceName, setWorkSpaceName] = useState<string>("");
    const [emoji, setEmoji] = useState<string>("1f423");

    // mutation
    const addWorkSpaceMutation = useMutation({
        mutationKey: [FireStoreCollections.WORKSPACES],
        mutationFn: async (workSpace: WorkSpaceType) => {
            if (!user) return;
            return await addWorkSpace(workSpace, user.uid);
        }
    })

    return (
        <Modal
            open={open}
            onCancel={() => {
                onCancel();
                setWorkSpaceName("");
            }}
            onOk={async () => {
                if (workSpaceName.trim() === "") {
                    messageApi.error(i18n.Message['Workspace name is required']);
                    if (workspaceInputRef.current) {
                        workspaceInputRef.current.focus();
                    }
                    return;
                }
                if (!user) return
                await addWorkSpaceMutation.mutateAsync({
                    name: workSpaceName,
                    members:[user.uid],
                    icon_unified: emoji,
                })
                setWorkSpaceName("");
                messageApi.success(i18n.Message['Workspace created successfully']);
                onCancel();
            }}
        >
            <Space
                direction="vertical"
                size={"middle"}
                style={{
                    marginBottom: 24,
                }}
            >
                {contextHolder}
                <Typography.Title level={4}>{i18n.Workspace['Create workspace']}</Typography.Title>
                <Typography.Text type="secondary">
                    {i18n.Workspace['Workspace description']}
                </Typography.Text>

                <Row justify={"start"} align={"middle"} wrap={false}>
                    <Input
                        placeholder={i18n.Workspace['Workspace name']}
                        ref={workspaceInputRef}
                        required
                        value={workSpaceName}
                        onChange={(e) => {
                            setWorkSpaceName(e.target.value);
                        }}
                    />
                    <Space size={8} />
                    <Popover
                        style={{
                            cursor: "pointer",
                        }}
                        trigger={"click"}
                        content={
                            <EmojiPicker
                                onEmojiClick={(emoji) => {
                                    setEmoji(emoji.unified);
                                }}
                            />
                        }
                    >
                        <Button type="text">
                            <Emoji unified={emoji} size={20} />
                        </Button>
                    </Popover>
                </Row>
            </Space>
        </Modal>
    );
};
