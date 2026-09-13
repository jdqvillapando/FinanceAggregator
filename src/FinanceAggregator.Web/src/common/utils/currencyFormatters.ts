import type { DropdownOption } from '../components/Dropdown';
import cryptoData from '../lib/cryptocurrency.json';
import localeData from '../lib/locale.json';


/**
 * Checks if ticker is available in `locale.json` and `cyptocurrency.json`.
 * @param ticker Ticker symbol (eg: PHP, USD, BTC, etc.)
 */
export const isTickerAvailable = (ticker: string) => {
    const localeTickers = [...new Set(localeData.map((t) => t.fiat))];
    const cryptoTickers = [...new Set(cryptoData.map((t) => t.fiat))];
    return localeTickers.includes(ticker) || cryptoTickers.includes(ticker);
};

/**
 * Populates the locale dropdown options based on the ticker symbol.
 * @param ticker Ticker symbol (eg: PHP, USD, BTC, etc.)
 * @returns Available locales related to the ticker
 */
export const getLocaleOptions = (ticker: string): DropdownOption[] => {
    const locales = localeData.filter((t) => t.fiat === ticker) || [];

    if (locales.length === 0) {
        return [];
    }

    return locales.map((l) => ({ label: l.localeCountry, value: l.abbreviation } as DropdownOption));
};

/**
 * Formats a numeric balance based on the ticker symbol.
 * Handles Fiat (PHP, USD, etc.) with currency symbols 
 * and Crypto (BTC, ETH) with high precision.
 * @param ticker Ticker symbol (eg: PHP, USD, BTC, etc.)
 * @param balance Amount to be applied with localization
 */
export const formatAssetDisplay = (ticker: string, balance: number): string => {
    const fiatTickers = ['PHP', 'USD', 'EUR', 'JPY', 'GBP', 'CAD', 'AUD'];

    if (fiatTickers.includes(ticker.toUpperCase())) {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: ticker.toUpperCase(),
                minimumFractionDigits: 2
            }).format(balance);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            return `${ticker.toUpperCase()} ${balance.toLocaleString()}`;
        }
    }

    // Default Crypto/Asset Formatting (8 decimal places)
    return `${balance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
    })} ${ticker.toUpperCase()}`;
};