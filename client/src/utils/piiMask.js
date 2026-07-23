function maskAadhaar(aadhaar) {
    if (!aadhaar || typeof aadhaar !== 'string') return '';
    const clean = aadhaar.replace(/\D/g, '');
    if (clean.length < 4) return 'X'.repeat(clean.length);
    return 'X'.repeat(clean.length - 4) + clean.slice(-4);
}

function maskPhone(phone) {
    if (!phone || typeof phone !== 'string') return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 4) return 'X'.repeat(clean.length);
    return clean.slice(0, 2) + 'X'.repeat(clean.length - 4) + clean.slice(-2);
}

function revealPii(value) {
    return value;
}

export { maskAadhaar, maskPhone, revealPii };
