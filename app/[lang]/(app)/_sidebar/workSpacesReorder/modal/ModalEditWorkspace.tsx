import { editWorkSpace } from "@/api/workSpace";
import { FireStoreCollectionFields } from "@/constants/FirebaseConstants";
import { useI18n } from "@/contexts/i18n/i18nProvider";
import { Button, Form, Input, message, Modal, Space, Typography } from "antd";
import { usePathname } from "next/navigation";

interface EditWorkspaceModalProps {
    open: boolean;
    workspaceId: string;
    workspaceName: string;
    onCancel: () => void;
}

export const EditWorkspaceModal = ({
    open,
    onCancel,
    workspaceId,
    workspaceName,
}: EditWorkspaceModalProps) => {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    return (
        <Modal
            open={open}
            onCancel={() => {
                onCancel();
            }}
            footer={null}
        >
            <Space
                direction="vertical"
                size={"middle"}
                style={{
                    marginBottom: 24,
                    width: "100%",
                }}
            >
                <Typography.Title level={4}>{i18n.Workspace['Edit workspace']}</Typography.Title>
                <Form
                    style={{
                        width: "100%",
                    }}
                    layout="vertical"
                    onFinish={async (values) => {
                        await editWorkSpace(
                            workspaceId, values.name, undefined, undefined
                        );
                        onCancel();
                        message.success(i18n.Message['Workspace updated successfully']);
                    }}
                >
                    <Form.Item
                        name={FireStoreCollectionFields.WORKSPACES.NAME}
                        label={i18n.Workspace['Change Workspace Name']}
                        initialValue={workspaceName}
                        rules={[
                            {
                                required: true,
                                message: i18n.Message['Please enter the workspace name'],
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Space>
                            <Button
                                type="default"
                                onClick={() => {
                                    onCancel();
                                }}
                            >
                                {i18n.Common['Cancel']}
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {i18n.Common['Update']}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Space>
        </Modal>
    );
};
