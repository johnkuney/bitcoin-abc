import React, { useState, useEffect } from 'react';
import 'antd/dist/antd.less';
import { Modal, Spin } from 'antd';
import { CashLoadingIcon } from '@components/Common/CustomIcons';
import '../index.css';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme, theme2 } from '@assets/styles/theme2';
import { ReactComponent as HomeIcon } from '@assets/home.svg';
import { ReactComponent as SendIcon } from '@assets/send.svg';
import { ReactComponent as ReceiveIcon } from '@assets/receive.svg';
import { ReactComponent as SettingsIcon } from '@assets/cog.svg';
import Wallet from '@components/Wallet/Wallet';
import Receive from '@components/Receive/Receive';
import Tokens from '@components/Tokens/Tokens';
import Send from '@components/Send/Send';
import SendToken from '@components/Send/SendToken';
import Configure from '@components/Configure/Configure';
import NotFound from '@components/NotFound';
import CashTab from '@assets/cashtab_xec.png';
import './App.css';
import { WalletContext } from '@utils/context';
import { isValidStoredWallet } from '@utils/cashMethods';
// import WalletLabel from '@components/Common/WalletLabel.js';
import {
    Route,
    Redirect,
    Switch,
    useLocation,
    useHistory,
} from 'react-router-dom';
// Easter egg imports not used in extension/src/components/App.js
import TabCash from '@assets/tabcash.png';
import { checkForTokenById } from '@utils/tokenMethods.js';
// Biometric security import not used in extension/src/components/App.js
import ProtectableComponentWrapper from './Authentication/ProtectableComponentWrapper';

const GlobalStyle = createGlobalStyle`
*{
    user-select: none;
}    
    .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button, .ant-modal > button, .ant-modal-confirm-btns > button, .ant-modal-footer > button, #cropControlsConfirm {
        border-radius: 3px;
        background-color: ${props => props.theme.contrast};
        color: ${props => props.theme.walletBackground};
        font-weight: bold;
        text-shadow: none !important;
    }    
    
    .ant-modal-wrap > div > div.ant-modal-content > div > div > div.ant-modal-confirm-btns > button:hover,.ant-modal-confirm-btns > button:hover, .ant-modal-footer > button:hover, #cropControlsConfirm:hover {
        color: ${props => props.theme.contrast};
        transition: all 0.3s;
        background-color: ${props => props.theme.ecashblue};
        border-color: ${props => props.theme.ecashblue};
    }   
    .selectedCurrencyOption {
        text-align: left;
        color: ${props => props.theme.black} !important;
        background-color: ${props => props.theme.contrast} !important;
    }
    .cashLoadingIcon {
        color: ${props => props.theme.ecashblue} !important;
        font-size: 48px !important;
    }
    .selectedCurrencyOption:hover {
        color: ${props => props.theme.contrast} !important;
        background-color: ${props => props.theme.ecashblue} !important;
    }
    #addrSwitch, #cropSwitch {
        .ant-switch-checked {
            background-color: white !important;
        }
    }
    #addrSwitch.ant-switch-checked, #cropSwitch.ant-switch-checked {
        background-image: ${props =>
            props.theme.buttons.primary.backgroundImage} !important;
    }

    .ant-slider-rail {
        background-color: ${props => props.theme.forms.border} !important;
    }
    .ant-slider-track {
        background-color: ${props => props.theme.ecashblue} !important;
    }
    .ant-descriptions-bordered .ant-descriptions-row {
    background: ${props => props.theme.contrast};
    }
    .ant-modal-confirm-content, .ant-modal-confirm-title {
        color: ${props => props.theme.walletBackground} !important;
    }
`;

const CustomApp = styled.div`
    text-align: center;
    font-family: 'Poppins', sans-serif;
    background-color: ${props => props.theme.backgroundColor};
    background-size: 100px 171px;
    background-image: ${props => props.theme.backgroundImage};
    background-attachment: fixed;
    /* animation: animatedBackground 100s linear infinite alternate;
    @keyframes animatedBackground {
        from {
            background-position: 0 0;
        }
        to {
            background-position: 100% 100%;
        }
    } */
`;

const Footer = styled.div`
    z-index: 2;
    height: 80px;
    border-top: 1px solid rgba(255, 255, 255, 0.5);
    background-color: ${props => props.theme.footerBackground};
    position: fixed;
    bottom: 0;
    width: 500px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 50px;
    @media (max-width: 768px) {
        width: 100%;
    }
`;

export const NavButton = styled.button`
    :focus,
    :active {
        outline: none;
    }
    cursor: pointer;
    padding: 0;
    background: none;
    border: none;
    font-size: 10px;
    svg {
        fill: ${props => props.theme.contrast};
        width: 26px;
        height: auto;
    }
    ${({ active, ...props }) =>
        active &&
        `    
        color: ${props.theme.navActive};
        svg {
            fill: ${props.theme.navActive};
        }
  `}
`;

export const WalletBody = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
`;

export const WalletCtn = styled.div`
    position: relative;
    width: 500px;
    min-height: 100vh;
    padding: 0 0 100px;
    background: ${props => props.theme.walletBackground};
    -webkit-box-shadow: 0px 0px 24px 1px ${props => props.theme.shadow};
    -moz-box-shadow: 0px 0px 24px 1px ${props => props.theme.shadow};
    box-shadow: 0px 0px 24px 1px ${props => props.theme.shadow};
    @media (max-width: 768px) {
        width: 100%;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
    }
`;

export const HeaderCtn = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 15px 0;
`;

export const CashTabLogo = styled.img`
    width: 120px;
    @media (max-width: 768px) {
        width: 110px;
    }
`;

// AbcLogo styled component not included in extension, replaced by open in new tab link
export const AbcLogo = styled.img`
    width: 150px;
    @media (max-width: 768px) {
        width: 120px;
    }
`;

// Easter egg styled component not used in extension/src/components/App.js
export const EasterEgg = styled.img`
    position: fixed;
    bottom: -195px;
    margin: 0;
    right: 10%;
    transition-property: bottom;
    transition-duration: 1.5s;
    transition-timing-function: ease-out;

    :hover {
        bottom: 0;
    }

    @media screen and (max-width: 1250px) {
        display: none;
    }
`;

const App = () => {
    const ContextValue = React.useContext(WalletContext);
    const { wallet, loading } = ContextValue;
    const [loadingUtxosAfterSend, setLoadingUtxosAfterSend] = useState(false);
    // If wallet is unmigrated, do not show page until it has migrated
    // An invalid wallet will be validated/populated after the next API call, ETA 10s
    const validWallet = isValidStoredWallet(wallet);
    const location = useLocation();
    const history = useHistory();
    const selectedKey =
        location && location.pathname ? location.pathname.substr(1) : '';

    // Easter egg boolean not used in extension/src/components/App.js
    const hasTab = validWallet
        ? checkForTokenById(
              wallet.state.tokens,
              '50d8292c6255cda7afc6c8566fed3cf42a2794e9619740fe8f4c95431271410e',
          )
        : false;

    const hasLightsOutTheme = validWallet
        ? checkForTokenById(
              wallet.state.tokens,
              'a9c741fc5a48468b07da7d710a133003b0d31a04a466b89417f34177430870ec',
          )
        : false;

    return (
        <ThemeProvider theme={!hasLightsOutTheme ? theme : theme2}>
            <GlobalStyle />
            <Spin
                spinning={
                    loading || loadingUtxosAfterSend || (wallet && !validWallet)
                }
                indicator={CashLoadingIcon}
            >
                <CustomApp>
                    <WalletBody>
                        <WalletCtn>
                            <HeaderCtn>
                                <CashTabLogo src={CashTab} alt="cashtab" />
                                {/*Begin component not included in extension as desktop only*/}
                                {hasTab && (
                                    <EasterEgg src={TabCash} alt="tabcash" />
                                )}
                                {/*End component not included in extension as desktop only*/}
                            </HeaderCtn>
                            <ProtectableComponentWrapper>
                                {/* <WalletLabel name={wallet.name}></WalletLabel> */}
                                <Switch>
                                    <Route path="/wallet">
                                        <Wallet />
                                    </Route>
                                    <Route path="/receive">
                                        <Receive
                                            passLoadingStatus={
                                                setLoadingUtxosAfterSend
                                            }
                                        />
                                    </Route>
                                    <Route path="/tokens">
                                        <Tokens
                                            passLoadingStatus={
                                                setLoadingUtxosAfterSend
                                            }
                                        />
                                    </Route>
                                    <Route path="/send">
                                        <Send
                                            passLoadingStatus={
                                                setLoadingUtxosAfterSend
                                            }
                                        />
                                    </Route>
                                    <Route
                                        path="/send-token/:tokenId"
                                        render={props => (
                                            <SendToken
                                                tokenId={
                                                    props.match.params.tokenId
                                                }
                                                passLoadingStatus={
                                                    setLoadingUtxosAfterSend
                                                }
                                            />
                                        )}
                                    />
                                    <Route path="/configure">
                                        <Configure />
                                    </Route>
                                    <Redirect exact from="/" to="/wallet" />
                                    <Route component={NotFound} />
                                </Switch>
                            </ProtectableComponentWrapper>
                        </WalletCtn>
                        {wallet ? (
                            <Footer>
                                <NavButton
                                    active={selectedKey === 'wallet'}
                                    onClick={() => history.push('/wallet')}
                                >
                                    <HomeIcon />
                                </NavButton>

                                <NavButton
                                    active={selectedKey === 'send'}
                                    onClick={() => history.push('/send')}
                                >
                                    <SendIcon
                                        style={{
                                            transform: 'rotate(-35deg)',
                                            marginTop: '-9px',
                                        }}
                                    />
                                </NavButton>
                                <NavButton
                                    active={selectedKey === 'receive'}
                                    onClick={() => history.push('receive')}
                                >
                                    <ReceiveIcon />
                                </NavButton>
                                <NavButton
                                    active={selectedKey === 'configure'}
                                    onClick={() => history.push('/configure')}
                                >
                                    <SettingsIcon />
                                </NavButton>
                            </Footer>
                        ) : null}
                    </WalletBody>
                </CustomApp>
            </Spin>
        </ThemeProvider>
    );
};

export default App;
