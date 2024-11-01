// Copyright (c) 2024 The Bitcoin developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

import { BN } from 'slp-mdm';
import * as bip39 from 'bip39';
import * as randomBytes from 'randombytes';
import * as utxolib from '@bitgo/utxo-lib';
import cashaddr from 'ecashaddrjs';
import appConfig from 'config/app';
import { fromHex, Script, P2PKHSignatory, ALL_BIP143 } from 'ecash-lib';

const SATOSHIS_PER_XEC = 100;
const NANOSATS_PER_XEC = new BN(1e11);
const STRINGIFIED_INTEGER_REGEX = /^[0-9]+$/;

const SCI_REGEX_POSTIIVE = /^(\d*\.?\d+)e([+-]?\d+)$/i;
export const STRINGIFIED_DECIMALIZED_REGEX = /^\d*\.?\d*$/;

const DUMMY_TXID =
    '1111111111111111111111111111111111111111111111111111111111111111';
const DUMMY_WALLET_HASH = fromHex('12'.repeat(20));
const DUMMY_SUFFICIENT_CANCEL_VALUE = 10000;
const DUMMY_SCRIPT = Script.p2pkh(DUMMY_WALLET_HASH);
export const DUMMY_KEYPAIR = {
    sk: fromHex('33'.repeat(32)),
    pk: fromHex(
        '023c72addb4fdf09af94f0c94d7fe92a386a7e70cf8a1d85916386bb2535c7b1b1',
    ),
};
// Used for accept and cancel fee estimation of agora partial offers
const DUMMY_INPUT = {
    input: {
        prevOut: {
            txid: DUMMY_TXID,
            outIdx: 1,
        },
        signData: {
            value: DUMMY_SUFFICIENT_CANCEL_VALUE,
            outputScript: DUMMY_SCRIPT,
        },
    },
    signatory: P2PKHSignatory(DUMMY_KEYPAIR.sk, DUMMY_KEYPAIR.pk, ALL_BIP143),
};

/**
 * Get total value of satoshis associated with an array of chronik utxos
 * @param {array} nonSlpUtxos array of chronik utxos
 * (each is an object with an integer as a string
 * stored at 'value' key representing associated satoshis)
 * e.g. {value: '12345'}
 * @throws {error} if nonSlpUtxos does not have a .reduce method
 * @returns {number | NaN} integer, total balance of input utxos in satoshis
 * or NaN if any utxo is invalid
 */
export const getBalanceSats = nonSlpUtxos => {
    return nonSlpUtxos.reduce(
        (previousBalance, utxo) => previousBalance + parseInt(utxo.value),
        0,
    );
};

/**
 * Convert an amount in XEC to satoshis
 * @param {Number} xecAmount a number with no more than 2 decimal places
 * @returns {Integer}
 */
export const toSatoshis = xecAmount => {
    const satoshis = new BN(xecAmount).times(SATOSHIS_PER_XEC).toNumber();
    if (!Number.isInteger(satoshis)) {
        throw new Error(
            'Result not an integer. Check input for valid XEC amount.',
        );
    }
    return satoshis;
};

/**
 * Convert an amount in satoshis to XEC
 * @param {Integer} satoshis
 * @returns {Number}
 */
export const toXec = satoshis => {
    if (!Number.isInteger(satoshis)) {
        throw new Error('Input param satoshis must be an integer');
    }
    return new BN(satoshis).div(SATOSHIS_PER_XEC).toNumber();
};

/**
 * Convert an amount in nanosatoshis to XEC
 * @param {Integer} nanosats
 * @returns {Number}
 */
export const nanoSatoshisToXec = nanosats => {
    if (!Number.isInteger(nanosats)) {
        throw new Error('Input param nanosats must be an integer');
    }
    return new BN(nanosats).div(NANOSATS_PER_XEC).toNumber();
};

/**
 * xecToNanoSatoshis
 * Note that, because this function may accept prices much lower than one XEC
 * xecAmount may not be in units of XEC
 * Given over-precise XEC values, this function will round to the nearest nanosat
 * @param {Number | BN} xecAmount
 * @returns {Number}
 */
export const xecToNanoSatoshis = xecAmount => {
    const nanosats = Math.round(
        new BN(xecAmount).times(NANOSATS_PER_XEC).toNumber(),
    );
    return nanosats;
};

/**
 * Determine if a given wallet has enough of a certain token to unlock a feature
 * @param {Map} tokens decimalized balance summary tokens reference from wallet.state
 * @param {string} tokenId tokenId of the token we are checking
 * @param {string} tokenQty quantity of the token required for unlock, decimalized string
 */
export const hasEnoughToken = (tokens, tokenId, tokenQty) => {
    // Filter for tokenId
    const thisTokenBalance = tokens.get(tokenId);
    // Confirm we have this token at all
    if (typeof thisTokenBalance === 'undefined') {
        return false;
    }
    return new BN(thisTokenBalance).gte(tokenQty);
};

/**
 * Create a Cashtab wallet object from a valid bip39 mnemonic
 * @param {string} mnemonic a valid bip39 mnemonic
 * @param {number[]} additionalPaths array of paths in addition to 1899 to add to this wallet
 * Default to 1899-only for all new wallets
 * Accept an array, in case we are migrating a wallet with legacy paths 145, 245, or both 145 and 245
 */
export const createCashtabWallet = async (mnemonic, additionalPaths = []) => {
    // Initialize wallet with empty state
    const wallet = {
        state: {
            balanceSats: 0,
            slpUtxos: [],
            nonSlpUtxos: [],
            tokens: new Map(),
            parsedTxHistory: [],
        },
    };

    // Set wallet mnemonic
    wallet.mnemonic = mnemonic;

    const rootSeedBuffer = await bip39.mnemonicToSeed(mnemonic, '');

    const masterHDNode = utxolib.bip32.fromSeed(
        rootSeedBuffer,
        utxolib.networks.ecash,
    );

    // wallet.paths is an array
    // For all newly-created wallets, we only support Path 1899
    // We would support only Path 1899, but Cashtab must continue to support legacy paths 145 and 245
    // Maybe someday we will support multi-path, so the array could help

    // We always derive path 1899
    const pathsToDerive = [appConfig.derivationPath, ...additionalPaths];

    wallet.paths = new Map();
    for (const path of pathsToDerive) {
        const pathInfo = getPathInfo(masterHDNode, path);
        if (path === appConfig.derivationPath) {
            // Initialize wallet name with first 5 chars of Path1899 address
            const prefixLength = `${appConfig.prefix}:`.length;
            wallet.name = pathInfo.address.slice(
                prefixLength,
                prefixLength + 5,
            );
        }
        wallet.paths.set(path, pathInfo);
    }

    return wallet;
};

/**
 * Get address, hash, and wif for a given derivation path
 *
 * @param {utxolib.bip32Interface} masterHDNode calculated from utxolib
 * @param {number} abbreviatedDerivationPath in practice: 145, 245, or 1899
 * @returns {object} {path, hash, address, wif}
 */
const getPathInfo = (masterHDNode, abbreviatedDerivationPath) => {
    const fullDerivationPath = `m/44'/${abbreviatedDerivationPath}'/0'/0/0`;
    const node = masterHDNode.derivePath(fullDerivationPath);
    const address = cashaddr.encode(appConfig.prefix, 'P2PKH', node.identifier);
    const { hash } = cashaddr.decode(address, true);

    return {
        hash,
        address,
        wif: node.toWIF(),
    };
};

/**
 * Generate a mnemonic using the bip39 library
 * This function is a conenvience wrapper for a long lib method
 */
export const generateMnemonic = () => {
    const mnemonic = bip39.generateMnemonic(
        128,
        randomBytes,
        bip39.wordlists['english'],
    );
    return mnemonic;
};

/**
 * Convert user input send amount to satoshis
 * @param {string | number} sendAmountFiat User input amount of fiat currency to send.
 * Input from an amount field is of type number. If we extend fiat send support to bip21 or
 * webapp txs, we should also handle string inputs
 * @param {number} fiatPrice Price of XEC in units of selectedCurrency / XEC
 * @return {Integer} satoshis value equivalent to this sendAmountFiat at exchange rate fiatPrice
 */
export const fiatToSatoshis = (sendAmountFiat, fiatPrice) => {
    return Math.floor((Number(sendAmountFiat) / fiatPrice) * SATOSHIS_PER_XEC);
};

/**
 * Determine if a legacy wallet includes legacy paths that must be migrated
 * @param {object} wallet a cashtab wallet
 * @returns {number[]} array of legacy paths
 */
export const getLegacyPaths = wallet => {
    const legacyPaths = [];
    if ('paths' in wallet) {
        if (Array.isArray(wallet.paths)) {
            // If we are migrating a wallet pre 2.9.0 and post 2.2.0
            for (const path of wallet.paths) {
                if (path.path !== 1899) {
                    // Path 1899 will be added by default, it is not an 'extra' path
                    legacyPaths.push(path.path);
                }
            }
        } else {
            // Cashtab wallet post 2.9.0
            wallet.paths.forEach((pathInfo, path) => {
                if (path !== 1899) {
                    legacyPaths.push(path);
                }
            });
        }
    }
    if ('Path145' in wallet) {
        // Wallet created before version 2.2.0 that includes Path145
        legacyPaths.push(145);
    }
    if ('Path245' in wallet) {
        // Wallet created before version 2.2.0 that includes Path145
        legacyPaths.push(245);
    }
    return legacyPaths;
};

/**
 * Re-organize the user's wallets array so that wallets[0] is a new active wallet
 * @param {object} walletToActivate Cashtab wallet object of wallet the user wishes to activate
 * @param {array} wallets Array of all cashtab wallets
 * @returns {array} wallets with walletToActivate at wallets[0] and
 * the rest of the wallets sorted alphabetically by name
 */
export const getWalletsForNewActiveWallet = (walletToActivate, wallets) => {
    // Clone wallets so we do not mutate the app's wallets array
    const currentWallets = [...wallets];
    // Find this wallet in wallets
    const indexOfWalletToActivate = currentWallets.findIndex(
        wallet => wallet.mnemonic === walletToActivate.mnemonic,
    );

    if (indexOfWalletToActivate === -1) {
        // should never happen
        throw new Error(
            `Error activating "${walletToActivate.name}": Could not find wallet in wallets`,
        );
    }

    // Remove walletToActivate from currentWallets
    currentWallets.splice(indexOfWalletToActivate, 1);

    // Sort inactive wallets alphabetically by name
    currentWallets.sort((a, b) => a.name.localeCompare(b.name));

    // Put walletToActivate at 0-index
    return [walletToActivate, ...currentWallets];
};

/**
 * Convert a token amount like one from an in-node chronik utxo to a decimalized string
 * @param {string} amount undecimalized token amount as a string, e.g. 10012345 at 5 decimals
 * @param {Integer} decimals
 * @returns {string} decimalized token amount as a string, e.g. 100.12345
 */
export const decimalizeTokenAmount = (amount, decimals) => {
    if (typeof amount !== 'string') {
        throw new Error('amount must be a string');
    }

    // Test for scientific notation
    if (SCI_REGEX_POSTIIVE.test(amount)) {
        amount = sciToDecimal(amount);
    }

    if (!STRINGIFIED_INTEGER_REGEX.test(amount)) {
        // If scientific notation, use a different aproach
        //TODO
        throw new Error('amount must be a stringified integer');
    }
    if (!Number.isInteger(decimals)) {
        throw new Error('decimals must be an integer');
    }
    if (decimals === 0) {
        // If we have 0 decimal places, and amount is a stringified integer
        // amount is already correct
        return amount;
    }

    // Do you need to pad with leading 0's?
    // For example, you have have "1" with 9 decimal places
    // This should be 0.000000001 strlength 1, decimals 9
    // So, you must add 9 zeros before the 1 before proceeding
    // You may have "123" with 9 decimal places strlength 3, decimals 9
    // This should be 0.000000123
    // So, you must add 7 zeros before the 123 before proceeding
    if (decimals > amount.length) {
        // We pad with decimals - amount.length 0s, plus an extra zero so we return "0.000" instead of ".000"
        amount = `${new Array(decimals - amount.length + 1)
            .fill(0)
            .join('')}${amount}`;
    }

    // Insert decimal point in proper place
    const stringAfterDecimalPoint = amount.slice(-1 * decimals);
    const stringBeforeDecimalPoint = amount.slice(
        0,
        amount.length - stringAfterDecimalPoint.length,
    );
    return `${stringBeforeDecimalPoint}.${stringAfterDecimalPoint}`;
};

/**
 * JS cannot convert stringified scientific notation to bigint
 * @param {*} str stringified number from slider or user input
 */
export const toBigInt = str => {
    if (SCI_REGEX_POSTIIVE.test(str)) {
        str = sciToDecimal(str);
    }
    return BigInt(str);
};

/**
 * Get a stringified decimal representation of sci notation number
 * @param {string} str
 * @returns {string}
 */
export const sciToDecimal = str => {
    // Regular expression to match scientific notation
    let [, mantissa, exponent] = str.match(SCI_REGEX_POSTIIVE) || [];

    if (!mantissa || !exponent) {
        throw new Error('Invalid scientific notation format');
    }

    // Remove any leading zeros from mantissa
    mantissa = removeLeadingZeros(mantissa);

    const mantissaDecimalPlaces = mantissa.includes('.')
        ? mantissa.split('.')[1].length
        : 0;
    const mantissaWithoutDot = mantissa.replace(/\./, '');
    let exponentValue = parseInt(exponent, 10);
    // If the exponent is negative, we need to handle it differently
    if (exponentValue < 0) {
        throw new Error(
            'Negative exponents require special handling beyond simple conversion',
        );
        // Cashtab is only doing integer conversion
    }
    if (mantissaDecimalPlaces > 0) {
        exponentValue -= mantissaDecimalPlaces;
    }
    if (exponentValue < 0) {
        throw new Error('Value is not an integer');
    }

    // Handle zero case
    if (parseInt(mantissaWithoutDot) === 0) {
        return '0';
    }

    // Construct the decimal number by padding with zeros
    let decimalString = mantissaWithoutDot + '0'.repeat(exponentValue);

    return decimalString;
};

/**
 * Convert a decimalized token amount to an undecimalized amount
 * Useful to perform integer math as you can use BigInt for amounts greater than Number.MAX_SAFE_INTEGER in js
 * @param {string} decimalizedAmount decimalized token amount as a string, e.g. 100.12345 for a 5-decimals token
 * @param {Integer} decimals
 * @returns {string} undecimalized token amount as a string, e.g. 10012345 for a 5-decimals token
 */
export const undecimalizeTokenAmount = (decimalizedAmount, decimals) => {
    if (typeof decimalizedAmount !== 'string') {
        throw new Error('decimalizedAmount must be a string');
    }
    if (
        !STRINGIFIED_DECIMALIZED_REGEX.test(decimalizedAmount) ||
        decimalizedAmount.length === 0
    ) {
        throw new Error(
            `decimalizedAmount must be a non-empty string containing only decimal numbers and optionally one decimal point "."`,
        );
    }
    if (!Number.isInteger(decimals)) {
        throw new Error('decimals must be an integer');
    }

    // If decimals is 0, we should not have a decimal point, or it should be at the very end
    if (decimals === 0) {
        if (!decimalizedAmount.includes('.')) {
            // If 0 decimals and no '.' in decimalizedAmount, it's the same
            return decimalizedAmount;
        }
        if (decimalizedAmount.slice(-1) !== '.') {
            // If we have a decimal anywhere but at the very end, throw precision error
            throw new Error(
                'decimalizedAmount specified at greater precision than supported token decimals',
            );
        }
        // Everything before the decimal point is what we want
        return decimalizedAmount.split('.')[0];
    }

    // How many decimal places does decimalizedAmount account for
    const accountedDecimals = decimalizedAmount.includes('.')
        ? decimalizedAmount.split('.')[1].length
        : 0;

    // Remove decimal point from the string
    let undecimalizedAmountString = decimalizedAmount.split('.').join('');
    // Remove leading zeros, if any
    undecimalizedAmountString = removeLeadingZeros(undecimalizedAmountString);

    if (accountedDecimals === decimals) {
        // If decimalized amount is accounting for all decimals, we simply remove the decimal point
        return undecimalizedAmountString;
    }

    const unAccountedDecimals = decimals - accountedDecimals;
    if (unAccountedDecimals > 0) {
        // Handle too little precision
        // say, a token amount for a 9-decimal token is only specified at 3 decimals
        // e.g. 100.123
        const zerosToAdd = new Array(unAccountedDecimals).fill(0).join('');
        return `${undecimalizedAmountString}${zerosToAdd}`;
    }

    // Do not accept too much precision
    // say, a token amount for a 3-decimal token is specified at 5 decimals
    // e.g. 100.12300 or 100.12345
    // Note if it is specied at 100.12345, we have an error, really too much precision
    throw new Error(
        'decimalizedAmount specified at greater precision than supported token decimals',
    );
};

/**
 * Remove leading '0' characters from any string
 * @param {string} string
 */
export const removeLeadingZeros = givenString => {
    let leadingZeroCount = 0;
    // We only iterate up to the 2nd-to-last character
    // i.e. we only iterate over "leading" characters
    for (let i = 0; i < givenString.length - 1; i += 1) {
        const thisChar = givenString[i];
        if (thisChar === '0') {
            leadingZeroCount += 1;
        } else {
            // Once you hit something other than '0', there are no more "leading" zeros
            break;
        }
    }
    return givenString.slice(leadingZeroCount, givenString.length);
};

/**
 * Get hash values to use for chronik calls and parsing tx history
 * @param {object} wallet valid cashtab wallet
 * @returns {string[]} array of hashes of all addresses in wallet
 */
export const getHashes = wallet => {
    const hashArray = [];
    wallet.paths.forEach(pathInfo => {
        hashArray.push(pathInfo.hash);
    });
    return hashArray;
};

/**
 * Determine if a wallet has unfinalized txs in its state
 * @param {object} wallet
 * @returns {boolean}
 */
export const hasUnfinalizedTxsInHistory = wallet => {
    if (!Array.isArray(wallet.state?.parsedTxHistory)) {
        // If we do not have a valid wallet, we return false
        // Not expected to ever happen
        return false;
    }
    const unfinalizedTxs = wallet.state.parsedTxHistory.filter(
        tx => typeof tx.block === 'undefined',
    );
    return unfinalizedTxs.length > 0;
};

/**
 * Determine input utxos to cover an Agora Partial accept offer
 * @param {AgoraOffer} agoraOffer
 * @param {utxos[]} utxos array of utxos as stored in Cashtab wallet object
 * @param {bigint} acceptedTokens
 * @param {number} feePerKb in satoshis
 * @returns {CashtabUtxo[]} fuelInputs
 * @throws {error} if we cannot afford this tx
 */
export const getAgoraPartialAcceptFuelInputs = (
    agoraOffer,
    utxos,
    acceptedTokens,
    feePerKb,
) => {
    const fuelInputs = [];
    const dummyInputs = [];
    let inputSatoshis = 0n;
    for (const utxo of utxos) {
        // Accumulative utxo selection
        fuelInputs.push(utxo);
        // Match our fuelInput count with dummyInputs
        dummyInputs.push(DUMMY_INPUT);
        inputSatoshis += BigInt(utxo.value);

        const askedSats = agoraOffer.askedSats(BigInt(acceptedTokens));

        // Get the tx fee for this tx
        const acceptFeeSats = agoraOffer.acceptFeeSats({
            recipientScript: DUMMY_SCRIPT,
            extraInputs: dummyInputs,
            acceptedTokens,
            feePerKb,
        });

        // We need to cover the tx fee and the asking price
        const requiredSats = acceptFeeSats + askedSats;

        if (inputSatoshis >= requiredSats) {
            return fuelInputs;
        }
    }
    throw new Error('Insufficient utxos to accept this offer');
};

/**
 * Determine input utxos to cancel an Agora Partial offer
 * @param {AgoraOffer} agoraOffer
 * @param {utxos[]} utxos array of utxos as stored in Cashtab wallet object
 * @param {number} feePerKb in satoshis
 * @returns {CashtabUtxo[]} fuelInputs
 * @throws {error} if we cannot afford this tx
 */
export const getAgoraPartialCancelFuelInputs = (
    agoraOffer,
    utxos,
    feePerKb,
) => {
    const fuelInputs = [];
    const dummyInputs = [];
    let inputSatoshis = 0n;
    for (const utxo of utxos) {
        // Accumulative utxo selection
        fuelInputs.push(utxo);
        // Match our fuelInput count with dummyInputs
        dummyInputs.push(DUMMY_INPUT);
        inputSatoshis += BigInt(utxo.value);

        // Get the tx fee for this tx
        // In practice, this is always bigger than dust
        // So we do not check to make sure the output we cover is at least dust
        const cancelFeeSats = agoraOffer.cancelFeeSats({
            recipientScript: DUMMY_SCRIPT,
            extraInputs: dummyInputs,
            feePerKb,
        });

        // There is no asking price for cancellation
        // cancelFeeSats is the size of the output we need
        if (inputSatoshis >= cancelFeeSats) {
            return fuelInputs;
        }
    }
    throw new Error('Insufficient utxos to cancel this offer');
};
