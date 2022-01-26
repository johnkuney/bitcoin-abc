import React from 'react';
import styled from 'styled-components';
import { WalletContext } from '@utils/context';
import OnBoarding from '@components/OnBoarding/OnBoarding';
import { currency } from '@components/Common/Ticker.js';
import { Link } from 'react-router-dom';
import TokenList from './TokenList';
import TxHistory from './TxHistory';
import ApiError from '@components/Common/ApiError';
import BalanceHeader from '@components/Common/BalanceHeader';
import BalanceHeaderFiat from '@components/Common/BalanceHeaderFiat';
import {
    LoadingCtn,
    ZeroBalanceHeader,
    WalletInfoCtn,
    SidePaddingCtn,
} from '@components/Common/Atoms';
import { getWalletState } from '@utils/cashMethods';
import WalletLabel from '@components/Common/WalletLabel.js';

export const Tabs = styled.div`
    margin: auto;
    display: inline-block;
    text-align: center;
    width: 100%;
    margin: 20px 0;
`;

export const TabLabel = styled.button`
    :focus,
    :active {
        outline: none;
    }
    color: ${props => props.theme.wallet.text.lightWhite};
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
    /* border-bottom: 2px solid red; */
    margin: 0 20px;
    padding: 0;

    @media (max-width: 400px) {
        font-size: 16px;
    }

    ${({ active, ...props }) =>
        active &&
        `    
        color: ${props.theme.contrast};
        border-bottom: 2px solid ${props.theme.primary}   
       
  `}
    ${({ token, ...props }) =>
        token &&
        `
        border-color:${props.theme.brandSecondary} 
  `}
`;

export const TabPane = styled.div`
    color: #fff;
    ${({ active }) =>
        !active &&
        `    
        display: none;
  `}
`;

export const SwitchBtnCtn = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    align-content: space-between;
    margin-bottom: 15px;
    .nonactiveBtn {
        color: ${props => props.theme.wallet.text.secondary};
        background: ${props =>
            props.theme.wallet.switch.inactive.background} !important;
        box-shadow: none !important;
    }
    .slpActive {
        background: ${props =>
            props.theme.wallet.switch.activeToken.background} !important;
        box-shadow: ${props =>
            props.theme.wallet.switch.activeToken.shadow} !important;
    }
`;

export const SwitchBtn = styled.div`
    font-weight: bold;
    display: inline-block;
    cursor: pointer;
    color: ${props => props.theme.contrast};
    font-size: 14px;
    padding: 6px 0;
    width: 100px;
    margin: 0 1px;
    text-decoration: none;
    background: ${props => props.theme.primary};
    box-shadow: ${props => props.theme.wallet.switch.activeCash.shadow};
    user-select: none;
    :first-child {
        border-radius: 100px 0 0 100px;
    }
    :nth-child(2) {
        border-radius: 0 100px 100px 0;
    }
`;

export const Links = styled(Link)`
    color: ${props => props.theme.wallet.text.secondary};
    width: 100%;
    font-size: 16px;
    margin: 10px 0 20px 0;
    border: 1px solid ${props => props.theme.wallet.text.secondary};
    padding: 14px 0;
    display: inline-block;
    border-radius: 3px;
    transition: all 200ms ease-in-out;
    svg {
        fill: ${props => props.theme.wallet.text.secondary};
    }
    :hover {
        color: ${props => props.theme.primary};
        border-color: ${props => props.theme.primary};
        svg {
            fill: ${props => props.theme.primary};
        }
    }
    @media (max-width: 768px) {
        padding: 10px 0;
        font-size: 14px;
    }
`;

export const ExternalLink = styled.a`
    color: ${props => props.theme.wallet.text.secondary};
    width: 100%;
    font-size: 16px;
    margin: 0 0 20px 0;
    border: 1px solid ${props => props.theme.wallet.text.secondary};
    padding: 14px 0;
    display: inline-block;
    border-radius: 3px;
    transition: all 200ms ease-in-out;
    svg {
        fill: ${props => props.theme.wallet.text.secondary};
        transition: all 200ms ease-in-out;
    }
    :hover {
        color: ${props => props.theme.primary};
        border-color: ${props => props.theme.primary};
        svg {
            fill: ${props => props.theme.primary};
        }
    }
    @media (max-width: 768px) {
        padding: 10px 0;
        font-size: 14px;
    }
`;

export const AddrSwitchContainer = styled.div`
    text-align: center;
    padding: 6px 0 12px 0;
`;

const WalletInfo = () => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet, fiatPrice, apiError, cashtabSettings } = ContextValue;
    const walletState = getWalletState(wallet);
    const { balances, parsedTxHistory, tokens } = walletState;
    const [activeTab, setActiveTab] = React.useState('txHistory');

    const hasHistory = parsedTxHistory && parsedTxHistory.length > 0;

    return (
        <>
            <WalletInfoCtn>
                <WalletLabel name={wallet.name}></WalletLabel>
                <BalanceHeaderFiat
                    balance={balances.totalBalance}
                    settings={cashtabSettings}
                    fiatPrice={fiatPrice}
                />
                <BalanceHeader
                    balance={balances.totalBalance}
                    ticker={currency.ticker}
                />
            </WalletInfoCtn>
            {apiError && <ApiError />}

            <SidePaddingCtn>
                <Tabs>
                    <TabLabel
                        active={activeTab === 'txHistory'}
                        onClick={() => setActiveTab('txHistory')}
                    >
                        Transactions
                    </TabLabel>
                    <TabLabel
                        active={activeTab === 'tokens'}
                        token={activeTab === 'tokens'}
                        onClick={() => setActiveTab('tokens')}
                    >
                        eTokens
                    </TabLabel>
                </Tabs>

                <TabPane active={activeTab === 'txHistory'}>
                    <TxHistory
                        txs={parsedTxHistory}
                        fiatPrice={fiatPrice}
                        fiatCurrency={
                            cashtabSettings && cashtabSettings.fiatCurrency
                                ? cashtabSettings.fiatCurrency
                                : 'usd'
                        }
                    />
                    {!hasHistory && (
                        <>
                            <span role="img" aria-label="party emoji">
                                🎉
                            </span>
                            Congratulations on your new wallet!{' '}
                            <span role="img" aria-label="party emoji">
                                🎉
                            </span>
                            <br /> Start using the wallet immediately to receive{' '}
                            {currency.ticker} payments, or load it up with{' '}
                            {currency.ticker} to send to others
                        </>
                    )}
                </TabPane>
                <TabPane active={activeTab === 'tokens'}>
                    {tokens && tokens.length > 0 ? (
                        <TokenList
                            wallet={wallet}
                            tokens={tokens}
                            jestBCH={false}
                        />
                    ) : (
                        <p>
                            Tokens sent to your {currency.tokenTicker} address
                            will appear here
                        </p>
                    )}
                </TabPane>
            </SidePaddingCtn>
        </>
    );
};

const Wallet = () => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet, previousWallet, loading } = ContextValue;

    return (
        <>
            {loading ? (
                <LoadingCtn />
            ) : (
                <>
                    {(wallet && wallet.Path1899) ||
                    (previousWallet && previousWallet.path1899) ? (
                        <WalletInfo />
                    ) : (
                        <OnBoarding />
                    )}
                </>
            )}
        </>
    );
};

export default Wallet;
