/**
 * Formats a numeric balance based on the ticker symbol.
 * Handles Fiat (PHP, USD, etc.) with currency symbols 
 * and Crypto (BTC, ETH) with high precision.
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