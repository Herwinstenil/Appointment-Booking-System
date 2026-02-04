export const formatInternationalPhoneNumber = (value) => {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    const trimmed = String(value).trim();
    if (trimmed.length === 0) {
        return 'N/A';
    }

    const normalized = trimmed.replace(/[^\d+]/g, '');
    const digitsOnly = normalized.replace(/\D/g, '');
    if (digitsOnly.length === 0) {
        return 'N/A';
    }

    if (digitsOnly.length < 7) {
        return trimmed;
    }

    const LOCAL_LENGTH = 10;
    let countryCode = '';
    let localPart = digitsOnly;

    if (digitsOnly.length > LOCAL_LENGTH) {
        countryCode = digitsOnly.slice(0, digitsOnly.length - LOCAL_LENGTH);
        localPart = digitsOnly.slice(-LOCAL_LENGTH);
    }

    if (!countryCode) {
        return normalized.startsWith('+') ? normalized : trimmed;
    }

    return `+${countryCode} ${localPart}`;
};
