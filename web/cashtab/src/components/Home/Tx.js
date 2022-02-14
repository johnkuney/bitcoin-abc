import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
    SendIcon,
    ReceiveIcon,
    GenesisIcon,
    UnparsedIcon,
} from '@components/Common/CustomIcons';
import { currency } from '@components/Common/Ticker';
import makeBlockie from 'ethereum-blockies-base64';
import { Img } from 'react-image';
import { fromLegacyDecimals } from '@utils/cashMethods';
import { formatBalance, formatDate } from '@utils/formatting';

const TxIcon = styled.div`
    svg {
        width: 20px;
        height: 20px;
    }
    height: 40px;
    width: 40px;
    border: 1px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100px;
`;

const SentTx = styled(TxIcon)`
    svg {
        margin-right: -3px;
    }
    fill: ${props => props.theme.contrast};
`;
const ReceivedTx = styled(TxIcon)`
    svg {
        fill: ${props => props.theme.eCashBlue};
    }
    border-color: ${props => props.theme.eCashBlue};
`;
const GenesisTx = styled(TxIcon)`
    border-color: ${props => props.theme.genesisGreen};
    svg {
        fill: ${props => props.theme.genesisGreen};
    }
`;
const UnparsedTx = styled(TxIcon)`
    color: ${props => props.theme.eCashBlue} !important;
`;
const DateType = styled.div`
    text-align: left;
    padding: 12px;
    @media screen and (max-width: 500px) {
        font-size: 0.8rem;
    }
`;

const LeftTextCtn = styled.div`
    text-align: left;
    display: flex;
    align-items: left;
    flex-direction: column;
    margin-left: 10px;
    h3 {
        color: ${props => props.theme.contrast};
        font-size: 14px;
        font-weight: 700;
        margin: 0;
    }
    .genesis {
        color: ${props => props.theme.genesisGreen};
    }
    .received {
        color: ${props => props.theme.eCashBlue};
    }
    h4 {
        font-size: 12px;
        color: ${props => props.theme.lightWhite};
        margin: 0;
    }
`;

const RightTextCtn = styled.div`
    text-align: right;
    display: flex;
    align-items: left;
    flex-direction: column;
    margin-left: 10px;
    h3 {
        color: ${props => props.theme.contrast};
        font-size: 14px;
        font-weight: 700;
        margin: 0;
    }
    .genesis {
        color: ${props => props.theme.genesisGreen};
    }
    .received {
        color: ${props => props.theme.eCashBlue};
    }
    h4 {
        font-size: 12px;
        color: ${props => props.theme.lightWhite};
        margin: 0;
    }
`;
const OpReturnType = styled.div`
    text-align: right;
    width: 100%;
    padding: 10px;
    border-radius: 5px;
    background: ${props => props.theme.sentMessage};
    margin-top: 15px;
    h4 {
        color: ${props => props.theme.lightWhite};
        margin: 0;
        font-size: 12px;
        display: inline-block;
    }
    p {
        color: ${props => props.theme.contrast};
        margin: 0;
        font-size: 14px;
        margin-bottom: 10px;
        overflow-wrap: break-word;
    }
    a {
        color: ${props => props.theme.contrast};
        margin: 0;
        font-size: 10px;
        border: 1px solid ${props => props.theme.contrast};
        border-radius: 5px;
        padding: 2px 10px;
        opacity: 0.6;
    }
    a:hover {
        opacity: 1;
        border-color: ${props => props.theme.eCashBlue};
        color: ${props => props.theme.contrast};
        background: ${props => props.theme.eCashBlue};
    }
    ${({ received, ...props }) =>
        received &&
        `
        text-align: left;    
        background: ${props.theme.receivedMessage};
  `}
`;
const SentLabel = styled.span`
    font-weight: bold;
    color: ${props => props.theme.secondary} !important;
`;
const ReceivedLabel = styled.span`
    font-weight: bold;
    color: ${props => props.theme.eCashBlue} !important;
`;
const GenesisLabel = styled.span`
    font-weight: bold;
    color: ${props => props.theme.genesisGreen} !important;
`;
const CashtabMessageLabel = styled.span`
    text-align: left;
    font-weight: bold;
    color: ${props => props.theme.eCashBlue} !important;
    white-space: nowrap;
`;
const EncryptionMessageLabel = styled.span`
    font-weight: bold;
    font-size: 12px;
    color: ${props => props.theme.encryptionRed};
    white-space: nowrap;
`;
const UnauthorizedDecryptionMessage = styled.span`
    text-align: left;
    color: ${props => props.theme.encryptionRed};
    white-space: nowrap;
    font-style: italic;
`;
const MessageLabel = styled.span`
    text-align: left;
    font-weight: bold;
    color: ${props => props.theme.secondary} !important;
    white-space: nowrap;
`;
const ReplyMessageLabel = styled.span`
    color: ${props => props.theme.eCashBlue} !important;
`;

const TxInfo = styled.div`
    text-align: right;
    display: flex;
    align-items: left;
    flex-direction: column;
    margin-left: 10px;
    flex-grow: 2;
    h3 {
        color: ${props => props.theme.contrast};
        font-size: 14px;
        font-weight: 700;
        margin: 0;
    }
    .genesis {
        color: ${props => props.theme.genesisGreen};
    }
    .received {
        color: ${props => props.theme.eCashBlue};
    }
    h4 {
        font-size: 12px;
        color: ${props => props.theme.lightWhite};
        margin: 0;
    }

    @media screen and (max-width: 500px) {
        font-size: 0.8rem;
    }
`;

const TokenInfo = styled.div`
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;

    color: ${props =>
        props.outgoing ? props.theme.secondary : props.theme.eCashBlue};

    @media screen and (max-width: 500px) {
        font-size: 0.8rem;
        grid-template-columns: 16px auto;
    }
`;
const TxTokenIcon = styled.div`
    img {
        height: 24px;
        width: 24px;
    }
    @media screen and (max-width: 500px) {
        img {
            height: 16px;
            width: 16px;
        }
    }
    grid-column-start: 1;
    grid-column-end: span 1;
    grid-row-start: 1;
    grid-row-end: span 2;
    align-self: center;
`;
const TokenTxAmt = styled.h3`
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
const TokenName = styled.h4`
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TxWrapper = styled.div`
    display: flex;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    color: ${props => props.theme.contrast};
    padding: 10px 0;
    flex-wrap: wrap;
`;

const Tx = ({ data, fiatPrice, fiatCurrency }) => {
    const txDate =
        typeof data.blocktime === 'undefined'
            ? formatDate()
            : formatDate(data.blocktime, navigator.language);
    // if data only includes height and txid, then the tx could not be parsed by cashtab
    // render as such but keep link to block explorer
    let unparsedTx = false;
    if (!Object.keys(data).includes('outgoingTx')) {
        unparsedTx = true;
    }
    return (
        <>
            {unparsedTx ? (
                <TxWrapper>
                    <UnparsedTx>
                        <UnparsedIcon />
                    </UnparsedTx>

                    <DateType>
                        <ReceivedLabel>Unparsed</ReceivedLabel>
                        <br />
                        {txDate}
                    </DateType>
                    <TxInfo>Open in Explorer</TxInfo>
                </TxWrapper>
            ) : (
                <TxWrapper>
                    {data.outgoingTx ? (
                        <>
                            {data.tokenTx &&
                            data.tokenInfo.transactionType === 'GENESIS' ? (
                                <GenesisTx>
                                    <GenesisIcon />
                                </GenesisTx>
                            ) : (
                                <SentTx>
                                    <SendIcon />
                                </SentTx>
                            )}
                        </>
                    ) : (
                        <ReceivedTx>
                            <ReceiveIcon />
                        </ReceivedTx>
                    )}

                    <LeftTextCtn>
                        {data.outgoingTx ? (
                            <>
                                {data.tokenTx &&
                                data.tokenInfo.transactionType === 'GENESIS' ? (
                                    <h3 className="genesis">Genesis</h3>
                                ) : (
                                    <h3 className="sent">Sent</h3>
                                )}
                            </>
                        ) : (
                            <h3 className="received">Received</h3>
                        )}
                        <h4>{txDate}</h4>
                    </LeftTextCtn>
                    {data.tokenTx ? (
                        <TokenInfo outgoing={data.outgoingTx}>
                            {data.tokenTx && data.tokenInfo ? (
                                <>
                                    <TxTokenIcon>
                                        {currency.tokenIconsUrl !== '' ? (
                                            <Img
                                                src={`${currency.tokenIconsUrl}/32/${data.tokenInfo.tokenId}.png`}
                                                unloader={
                                                    <img
                                                        alt={`identicon of tokenId ${data.tokenInfo.tokenId} `}
                                                        style={{
                                                            borderRadius: '50%',
                                                        }}
                                                        key={`identicon-${data.tokenInfo.tokenId}`}
                                                        src={makeBlockie(
                                                            data.tokenInfo
                                                                .tokenId,
                                                        )}
                                                    />
                                                }
                                            />
                                        ) : (
                                            <img
                                                alt={`identicon of tokenId ${data.tokenInfo.tokenId} `}
                                                style={{
                                                    borderRadius: '50%',
                                                }}
                                                key={`identicon-${data.tokenInfo.tokenId}`}
                                                src={makeBlockie(
                                                    data.tokenInfo.tokenId,
                                                )}
                                            />
                                        )}
                                    </TxTokenIcon>
                                    {data.outgoingTx ? (
                                        <RightTextCtn>
                                            {data.tokenInfo.transactionType ===
                                            'GENESIS' ? (
                                                <>
                                                    <TokenTxAmt className="genesis">
                                                        +{' '}
                                                        {data.tokenInfo.qtyReceived.toString()}
                                                        &nbsp;
                                                        {
                                                            data.tokenInfo
                                                                .tokenTicker
                                                        }
                                                    </TokenTxAmt>
                                                    <TokenName>
                                                        {
                                                            data.tokenInfo
                                                                .tokenName
                                                        }
                                                    </TokenName>
                                                </>
                                            ) : (
                                                <>
                                                    <TokenTxAmt>
                                                        -{' '}
                                                        {data.tokenInfo.qtySent.toString()}
                                                        &nbsp;
                                                        {
                                                            data.tokenInfo
                                                                .tokenTicker
                                                        }
                                                    </TokenTxAmt>
                                                    <TokenName>
                                                        {
                                                            data.tokenInfo
                                                                .tokenName
                                                        }
                                                    </TokenName>
                                                </>
                                            )}
                                        </RightTextCtn>
                                    ) : (
                                        <RightTextCtn>
                                            <TokenTxAmt className="received">
                                                +{' '}
                                                {data.tokenInfo.qtyReceived.toString()}
                                                &nbsp;
                                                {data.tokenInfo.tokenTicker}
                                            </TokenTxAmt>
                                            <TokenName>
                                                {data.tokenInfo.tokenName}
                                            </TokenName>
                                        </RightTextCtn>
                                    )}
                                </>
                            ) : (
                                <span>Token Tx</span>
                            )}
                        </TokenInfo>
                    ) : (
                        <>
                            <TxInfo outgoing={data.outgoingTx}>
                                {data.outgoingTx ? (
                                    <>
                                        <h3>
                                            -
                                            {formatBalance(
                                                fromLegacyDecimals(
                                                    data.amountSent,
                                                ),
                                            )}{' '}
                                            {currency.ticker}
                                        </h3>
                                        {fiatPrice !== null &&
                                            !isNaN(data.amountSent) && (
                                                <h4>
                                                    -
                                                    {
                                                        currency.fiatCurrencies[
                                                            fiatCurrency
                                                        ].symbol
                                                    }
                                                    {(
                                                        fromLegacyDecimals(
                                                            data.amountSent,
                                                        ) * fiatPrice
                                                    ).toFixed(2)}{' '}
                                                    {
                                                        currency.fiatCurrencies
                                                            .fiatCurrency
                                                    }
                                                </h4>
                                            )}
                                    </>
                                ) : (
                                    <>
                                        <h3 className="received">
                                            +
                                            {formatBalance(
                                                fromLegacyDecimals(
                                                    data.amountReceived,
                                                ),
                                            )}{' '}
                                            {currency.ticker}
                                        </h3>
                                        {fiatPrice !== null &&
                                            !isNaN(data.amountReceived) && (
                                                <h4>
                                                    +
                                                    {
                                                        currency.fiatCurrencies[
                                                            fiatCurrency
                                                        ].symbol
                                                    }
                                                    {(
                                                        fromLegacyDecimals(
                                                            data.amountReceived,
                                                        ) * fiatPrice
                                                    ).toFixed(2)}{' '}
                                                    {
                                                        currency.fiatCurrencies
                                                            .fiatCurrency
                                                    }
                                                </h4>
                                            )}
                                    </>
                                )}
                            </TxInfo>
                        </>
                    )}
                    {data.opReturnMessage && (
                        <>
                            <OpReturnType received={!data.outgoingTx}>
                                {data.isCashtabMessage ? (
                                    <h4>Cashtab Message</h4>
                                ) : (
                                    <h4>External Message</h4>
                                )}
                                {data.isEncryptedMessage ? (
                                    <EncryptionMessageLabel>
                                        &nbsp;-&nbsp;Encrypted
                                    </EncryptionMessageLabel>
                                ) : (
                                    ''
                                )}
                                <br />
                                {/*unencrypted OP_RETURN Message*/}
                                {data.opReturnMessage &&
                                !data.isEncryptedMessage ? (
                                    <p>{data.opReturnMessage}</p>
                                ) : (
                                    ''
                                )}
                                {/*encrypted and wallet is authorized to view OP_RETURN Message*/}
                                {data.opReturnMessage &&
                                data.isEncryptedMessage &&
                                data.decryptionSuccess ? (
                                    <p>{data.opReturnMessage}</p>
                                ) : (
                                    ''
                                )}
                                {/*encrypted but wallet is not authorized to view OP_RETURN Message*/}
                                {data.opReturnMessage &&
                                data.isEncryptedMessage &&
                                !data.decryptionSuccess ? (
                                    <UnauthorizedDecryptionMessage>
                                        {data.opReturnMessage}
                                    </UnauthorizedDecryptionMessage>
                                ) : (
                                    ''
                                )}
                                {!data.outgoingTx && data.replyAddress ? (
                                    <Link
                                        to={{
                                            pathname: `/send`,
                                            state: {
                                                replyAddress: data.replyAddress,
                                            },
                                        }}
                                    >
                                        Reply To Message
                                    </Link>
                                ) : (
                                    ''
                                )}
                            </OpReturnType>
                        </>
                    )}
                </TxWrapper>
            )}
        </>
    );
};

Tx.propTypes = {
    data: PropTypes.object,
    fiatPrice: PropTypes.number,
    fiatCurrency: PropTypes.string,
};

export default Tx;
