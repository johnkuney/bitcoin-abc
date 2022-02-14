import styled from 'styled-components';

export const LoadingCtn = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    flex-direction: column;

    svg {
        width: 50px;
        height: 50px;
        fill: ${props => props.theme.eCashBlue};
    }
`;

export const SidePaddingCtn = styled.div`
    padding: 0px 30px;
    @media (max-width: 768px) {
        padding: 0px 15px;
    }
`;

export const FormLabel = styled.label`
    font-size: 16px;
    margin-bottom: 5px;
    text-align: left;
    width: 100%;
    display: inline-block;
    color: ${props => props.theme.contrast};
`;

export const WalletInfoCtn = styled.div`
    background: ${props => props.theme.walletInfoContainer};
    width: 100%;
    padding: 40px 20px;
`;

export const BalanceHeaderFiatWrap = styled.div`
    color: ${props => props.theme.contrast};
    width: 100%;
    font-size: 16px;
    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

export const BalanceHeaderWrap = styled.div`
    color: ${props => props.theme.contrast};
    width: 100%;
    font-size: 28px;
    margin-bottom: 0px;
    font-weight: bold;
    line-height: 1.4em;
    @media (max-width: 768px) {
        font-size: 24px;
    }
`;

export const ZeroBalanceHeader = styled.div`
    color: ${props => props.theme.contrast};
    width: 100%;
    font-size: 14px;
    margin-bottom: 5px;
`;

export const TokenParamLabel = styled.span`
    font-weight: bold;
`;

export const AlertMsg = styled.p`
    color: ${props => props.theme.forms.error} !important;
`;

export const ConvertAmount = styled.div`
    color: ${props => props.theme.contrast};
    width: 100%;
    font-size: 14px;
    margin-bottom: 10px;
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;
