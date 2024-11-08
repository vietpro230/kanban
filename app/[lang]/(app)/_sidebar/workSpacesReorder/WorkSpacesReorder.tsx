'use client'
import { getUserData, setUserData } from '@/api/user'
import { getWorkSpaces, onSnapshotWorkSpaces } from '@/api/workSpace'
import ReorderComponent from '@/components/Reorder/Reorder'
import { useI18n } from '@/contexts/i18n/i18nProvider'
import { useAuth } from '@/hooks/useAuth'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Space } from 'antd'
import { Unsubscribe } from 'firebase/firestore'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AddNewWorkspaceModal } from './modal/ModalAddNewWorkspace'
import WorkSpaceItem from './WorkSpaceItem'

export interface WorkSpaceReorderItem {
    key: string;
    name: string,
    members: string[],
    icon_unified: string,
}

interface WorkSpaceReorderProps {
    inlineCollapsed?: boolean;
}

function WorkSpaceReorder({ inlineCollapsed }: WorkSpaceReorderProps) {
    const { user } = useAuth()
    const router = useRouter()
    const pathname = usePathname();
    const lang = pathname.split('/')[1];
    const i18n = useI18n(lang);

    const [openModalAddNewWorkspace, setOpenModalAddNewWorkspace] =
        useState(false);
    const [workSpaceOrder, setWorkSpaceOrder] = useState<string[]>([]);

    const workSpaceQuery = useQuery({
        queryKey: ['workSpaces'],
        queryFn: async () => {
            if (user) {
                return getWorkSpaces(user.uid)
            }
            return []
        }
    })

    // useEffect
    useEffect(() => {
        let unsubscribe: Unsubscribe;
        if (user) {
            unsubscribe = onSnapshotWorkSpaces(() => {
                workSpaceQuery.refetch();
            }, user?.uid)
        }
        return () => {
            unsubscribe?.()
        }
    }, [user])

    useEffect(() => {
        (async () => {
            if (!user) return
            const userData = await getUserData(user.uid)
            const _workSpaceOrder = userData?.workSpaceOrder ?? workSpaceQuery.data?.map(item => item.id)
            setWorkSpaceOrder(_workSpaceOrder)
        })()
    }, [])

    const workSpaceSorted = workSpaceQuery.data ? workSpaceQuery.data.sort((a, b) => {
        return (workSpaceOrder.indexOf(a.id!) ?? -1) - (workSpaceOrder.indexOf(b.id!) ?? -1);
    }) : []

    return (
        <Space direction='vertical' className='w-full'>
            <ReorderComponent<WorkSpaceReorderItem>
                items={workSpaceSorted.map(item => {
                    return {
                        icon_unified: item.icon_unified,
                        key: item.id!,
                        members: item.members,
                        name: item.name
                    }
                })}
                onReorder={(items) => {
                    if (!user) return
                    const newWorkSpaceOrder = items.map(item => item.key)
                    setWorkSpaceOrder(newWorkSpaceOrder)
                    setUserData(newWorkSpaceOrder, user.uid)
                }}
                renderItem={(item) => (
                    <WorkSpaceItem item={item}
                        active={(pathname.split('/')[2] ?? '') === `${item.key}`}
                        inlineCollapsed={inlineCollapsed}
                        onPress={(key) => {
                            router.push(`/${lang}/${key}`)
                        }}
                    />
                )}
            />
            <Button
                type="text"
                icon={<PlusOutlined />}
                className='w-full'
                onClick={() => {
                    setOpenModalAddNewWorkspace(true);
                }}
            >
                {i18n.Common.Add}
            </Button>

            {/* // Modal  */}
            <AddNewWorkspaceModal
                open={openModalAddNewWorkspace}
                onCancel={() => {
                    setOpenModalAddNewWorkspace(false);
                }}
            />
        </Space>
    )
}

export default WorkSpaceReorder