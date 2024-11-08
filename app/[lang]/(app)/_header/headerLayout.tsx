"use client";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase/firebase";
import { HomeOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps, Row } from "antd";
import { Header } from "antd/es/layout/layout";
import useToken from "antd/es/theme/useToken";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

function HeaderLayout() {
    const pathName = usePathname();
    const lang = pathName.split('/')[1];
    const token = useToken();
    const { user } = useAuth();
    const router = useRouter();

    const items: MenuProps["items"] = useMemo(() => [
        {
            key: "Logout",
            icon: <HomeOutlined />,
            label: "Logout",
            onClick: async () => {
                await Promise.all([signOut(auth), fetch("/api/logout")]);
                router.replace(`/${lang}/login`);
            },
        },
    ], [lang]);

    return (
        <Header style={{ background: token[1].colorBgElevated }}>
            <Row justify={"end"} align={"middle"} className="h-full">
                <Dropdown menu={{ items }} trigger={["click"]}
                >
                    <Button type="link" className="flex items-center">
                        <Image
                            src={user?.photoURL ?? "/images/no_avatar.png"}
                            alt="User avatar"
                            width={36}
                            height={36}
                            className="rounded-full"
                        />
                    </Button>
                </Dropdown>
            </Row>
        </Header>
    );
}

export default HeaderLayout;
