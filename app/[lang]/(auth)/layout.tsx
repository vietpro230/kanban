'use client';
import useToken from "antd/es/theme/useToken";
import React, { PropsWithChildren } from "react";

function AuthLayout({ children }: PropsWithChildren) {
    const token = useToken();
    return (
        <main className={`flex min-h-screen flex-col items-center justify-center p-8 bg-[length:256px] lg:bg-[length:512px]`}
            style={{
                backgroundImage: "url('./backgrounds/login1.svg'), url('./backgrounds/login2.svg')",
                backgroundPosition: 'left bottom, right top',
                backgroundRepeat: 'no-repeat no-repeat',
                backgroundAttachment: 'fixed fixed',
                backgroundColor: token[3].colorBgLayout
            }}
        >
            {children}
        </main>
    )
}

export default AuthLayout;
