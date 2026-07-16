const wasteRules = [
    { keywords: ['glove', 'plastic', 'tube', 'catheter', 'mask', 'ppe', 'iv', 'urine', 'syringe without'], category: 'Red' },
    { keywords: ['cotton', 'blood', 'tissue', 'bandage', 'swab', 'dressing', 'placenta', 'anatomical', 'chemical'], category: 'Yellow' },
    { keywords: ['needle', 'scalpel', 'blade', 'lancet', 'sharp', 'glass slide', 'syringe with'], category: 'White' },
    { keywords: ['medicine', 'glass', 'ampoule', 'vial', 'implant', 'pill', 'tablet', 'drug', 'expired', 'metal'], category: 'Blue' },
    { keywords: ['general', 'paper', 'food', 'wrapper', 'box', 'cup', 'trash', 'cardboard'], category: 'Black' }
];

const wasteStyles = {
    'Red': { color: 'Red Bin', style: 'border-red-200 bg-red-50 text-red-800' },
    'Yellow': { color: 'Yellow Bin', style: 'border-yellow-200 bg-yellow-50 text-yellow-800' },
    'White': { color: 'White Bin', style: 'border-gray-300 bg-white text-gray-800' },
    'Blue': { color: 'Blue Bin', style: 'border-blue-200 bg-blue-50 text-blue-800' },
    'Black': { color: 'Black Bin', style: 'border-gray-400 bg-gray-100 text-gray-800' }
};

window.handleNurseInput = (val) => {
    state.tempNurseWasteType = val;
    if (!val.trim()) {
        state.tempNurseCategory = null;
    } else {
        const lower = val.toLowerCase();
        let matched = null;
        for (let r of wasteRules) {
            if (r.keywords.some(k => lower.includes(k))) { matched = r.category; break; }
        }
        state.tempNurseCategory = matched ? wasteStyles[matched] : { color: 'Unrecognized', style: 'border-gray-200 bg-gray-50 text-gray-500' };
    }
    renderApp();

    // Restore focus
    const input = document.getElementById('nurse-waste-input');
    if(input) { input.focus(); input.setSelectionRange(val.length, val.length); }
};

window.submitNurseEntry = async (e) => {
    e.preventDefault();
    const qty = document.getElementById('nurse-qty-input').value;
    if (!state.tempNurseWasteType || !qty || !state.tempNurseCategory || state.tempNurseCategory.color === 'Unrecognized') {
        return showToast('Invalid or unrecognized waste entry.', 'error');
    }

    const ts = getTimestamp();
    const safeColorStr = typeof state.tempNurseCategory.color === 'string' ? state.tempNurseCategory.color.split(' ')[0] : 'Unknown';
    const payload = {
        id: generateId('WST'),
        wasteType: state.tempNurseWasteType,
        category: safeColorStr,
        quantity: qty,
        status: 'Pending',
        nurseName: state.currentUser.name,
        timestamp: ts,
        history: [{ status: 'Pending', timestamp: ts, actor: `${state.currentUser.name} (Nurse)` }]
    };

    try {
        const data = await apiRequest('POST', '/api/entry', payload);
        mergeServerState(data);
        state.tempNurseWasteType = '';
        state.tempNurseCategory = null;
        showToast('Waste entry submitted successfully!', 'success');
    } catch (error) {
        console.error(error);
        showToast('Unable to submit waste entry.', 'error');
    }
    renderApp();
};