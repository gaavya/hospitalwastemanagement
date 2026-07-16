
const medRules = [
    { keywords: ['syrup', 'tonic', 'liquid', 'cough'], category: 'Syrup / Tonic' },
    { keywords: ['injection', 'vial', 'vaccine', 'ampoule', 'iv'], category: 'Injection' },
    { keywords: ['ointment', 'cream', 'gel', 'balm'], category: 'Ointment' },
    { keywords: ['drop', 'eye', 'ear'], category: 'Drops' },
];

window.handleMedNameChange = (val) => {
    state.tempMedName = val;
    if (!val.trim()) { state.tempMedCategory = null; }
    else {
        let matched = 'Tablet / Capsule';
        for(let r of medRules) {
            if(r.keywords.some(k => val.toLowerCase().includes(k))) { matched = r.category; break; }
        }
        state.tempMedCategory = matched;
    }
    renderApp();
    const input = document.getElementById('med-name-input');
    if(input) { input.focus(); input.setSelectionRange(val.length, val.length); }
};

window.submitMedicine = async (e) => {
    e.preventDefault();
    const arr = document.getElementById('med-arr').value;
    const mfg = document.getElementById('med-mfg').value;
    const exp = document.getElementById('med-exp').value;

    if(!state.tempMedName || !arr || !mfg || !exp) return showToast('Fill all details', 'error');

    const payload = {
        id: generateId('MED'),
        name: state.tempMedName,
        category: state.tempMedCategory || 'Tablet / Capsule',
        arrivalDate: arr,
        mfgDate: mfg,
        expDate: exp
    };

    try {
        const data = await apiRequest('POST', '/api/medicine', payload);
        mergeServerState(data);
        state.tempMedName = '';
        state.tempMedCategory = null;
        state.tempMedArrival = '';
        state.tempMedMfg = '';
        state.tempMedExp = '';
        showToast('Medicine securely logged', 'success');

        window.animateChart = false;
        renderApp();
        setTimeout(() => { window.animateChart = true; renderApp(); }, 100);
        return;
    } catch (error) {
        console.error(error);
        showToast('Unable to log medicine.', 'error');
    }

    renderApp();
};

window.getMedStatus = (exp) => {
    if (!exp || !exp.includes('-')) return { l: 'Unknown', c: 'text-gray-700 bg-gray-50 border-gray-200' };
    const today = new Date(); today.setHours(0,0,0,0);
    const [year, month, day] = exp.split('-');
    const expiry = new Date(year, month - 1, day);
    const daysLeft = (expiry - today) / (1000 * 60 * 60 * 24);
    if (daysLeft < 0) return { l: 'Expired', c: 'text-red-700 bg-red-50 border-red-200' };
    if (daysLeft <= 30) return { l: 'Expiring', c: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
    return { l: 'Valid', c: 'text-green-700 bg-green-50 border-green-200' };
};