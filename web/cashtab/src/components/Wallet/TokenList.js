import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import TokenListItem from './TokenListItem';
import { Link } from 'react-router-dom';
import { formatBalance } from '@utils/formatting';

const CreateToken = styled(Link)`
    color: ${props => props.theme.contrast};
    border: 1px solid #fff;
    padding: 4px 15px;
    border-radius: 5px;
    margin-top: 20px;
    display: inline-block;
    :hover {
        background: ${props => props.theme.eCashPurple};
        border-color: ${props => props.theme.eCashPurple};
        color: ${props => props.theme.contrast};
    }
`;

const TokenList = ({ tokens }) => {
    return (
        <div>
            {tokens.map(token => (
                <Link key={token.tokenId} to={`/send-token/${token.tokenId}`}>
                    <TokenListItem
                        ticker={token.info.tokenTicker}
                        tokenId={token.tokenId}
                        balance={formatBalance(token.balance)}
                    />
                </Link>
            ))}
            <CreateToken
                to={{
                    pathname: `/tokens`,
                }}
            >
                Create a Token
            </CreateToken>
        </div>
    );
};

TokenList.propTypes = {
    tokens: PropTypes.array,
};

export default TokenList;
