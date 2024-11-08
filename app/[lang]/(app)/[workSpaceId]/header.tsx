'use client'
import { getWorkSpace } from '@/api/workSpace'
import { FireStoreCollections } from '@/constants/FirebaseConstants'
import { useI18n } from '@/contexts/i18n/i18nProvider'
import { ExportOutlined, ShareAltOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, message, Space, Typography } from 'antd'
import { Header } from 'antd/es/layout/layout'
import useToken from 'antd/es/theme/useToken'
import { Emoji } from 'emoji-picker-react'
import { usePathname } from 'next/navigation'

interface WorkSpaceHeaderProps {
    workSpaceId: string
}

function WorkSpaceHeader({ workSpaceId }: WorkSpaceHeaderProps) {
    const pathName = usePathname();
    const i18n = useI18n(pathName.split('/')[1]);
    const token = useToken()

    const workSpace = useQuery({
        queryKey: [FireStoreCollections.WORKSPACES, workSpaceId],
        queryFn: async () => {
            const workSpace = await getWorkSpace(workSpaceId)
            return workSpace
        }
    })
    const shareMutation = useMutation({
        mutationFn: async () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                message.success(i18n.Common['Link copied to clipboard'])
            })
        }
    })

    return (
        <Header style={{
            backgroundColor: token[3].colorBgElevated,
        }}
            className='rounded-lg flex flex-row items-center justify-between'
        >
            <Space direction='horizontal' size='large' align='center'>
                <Emoji unified={workSpace.data?.icon_unified ?? ''} size={36} />
                <Typography.Title level={3} style={{
                    margin: 0,
                }}>
                    {workSpace.data?.name}
                </Typography.Title>
            </Space>
            <Space direction='horizontal'>
                <Button variant='outlined' icon={<ExportOutlined />}>
                    {i18n.Common['Export']}
                </Button>
                <Button variant='outlined' icon={<ShareAltOutlined />}
                    onClick={() => shareMutation.mutate()}
                    loading={shareMutation.isPending}
                >
                    {i18n.Common['Share']}
                </Button>
            </Space>
        </Header>
    )
}

export default WorkSpaceHeader