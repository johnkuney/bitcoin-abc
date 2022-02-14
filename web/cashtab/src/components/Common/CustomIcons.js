import * as React from 'react';
import styled from 'styled-components';
import {
    CopyOutlined,
    DollarOutlined,
    LoadingOutlined,
    WalletOutlined,
    QrcodeOutlined,
    SettingOutlined,
    LockOutlined,
} from '@ant-design/icons';
import { Image } from 'antd';
import { currency } from '@components/Common/Ticker';
import { ReactComponent as Send } from '@assets/send.svg';
import { ReactComponent as Receive } from '@assets/receive.svg';
import { ReactComponent as Genesis } from '@assets/flask.svg';
import { ReactComponent as Unparsed } from '@assets/alert-circle.svg';
import { ReactComponent as Home } from '@assets/home.svg';
import { ReactComponent as Settings } from '@assets/cog.svg';

export const CashLoadingIcon = <LoadingOutlined className="cashLoadingIcon" />;

export const CashReceivedNotificationIcon = () => (
    <Image height={'33px'} width={'30px'} src={currency.logo} preview={false} />
);
export const TokenReceivedNotificationIcon = () => (
    <Image
        src={currency.tokenLogo}
        height={'33px'}
        width={'30px'}
        preview={false}
    />
);

export const MessageSignedNotificationIcon = () => (
    <Image
        src={currency.tokenLogo}
        height={'33px'}
        width={'30px'}
        preview={false}
    />
);
export const ThemedCopyOutlined = styled(CopyOutlined)`
    color: ${props => props.theme.icons.outlined} !important;
`;
export const ThemedDollarOutlined = styled(DollarOutlined)`
    color: ${props => props.theme.icons.outlined} !important;
`;
export const ThemedWalletOutlined = styled(WalletOutlined)`
    color: ${props => props.theme.icons.outlined} !important;
`;
export const ThemedQrcodeOutlined = styled(QrcodeOutlined)`
    color: ${props => props.theme.walletBackground} !important;
`;
export const ThemedSettingOutlined = styled(SettingOutlined)`
    color: ${props => props.theme.icons.outlined} !important;
`;
export const ThemedLockOutlined = styled(LockOutlined)`
    color: ${props => props.theme.icons.outlined} !important;
`;

export const LoadingBlock = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    flex-direction: column;
    svg {
        width: 50px;
        height: 50px;
        fill: ${props => props.theme.eCashBlue};
    }
`;

export const CashLoader = () => (
    <LoadingBlock>
        <LoadingOutlined />
    </LoadingBlock>
);

export const ReceiveIcon = () => <Receive />;
export const GenesisIcon = () => <Genesis />;
export const UnparsedIcon = () => <Unparsed />;
export const HomeIcon = () => <Home />;
export const SettingsIcon = () => <Settings />;
export const SendIcon = styled(Send)`
    transform: rotate(-35deg);
`;
