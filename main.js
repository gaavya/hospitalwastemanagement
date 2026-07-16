let state = {
    entries: [],
    alerts: [],
    notifications: [],
    medicines: [],
    currentView: 'landing',
    portal: null,
    currentUser: null,

    tempNurseWasteType: '',
    tempNurseCategory: null,
    tempNurseQuantity: '',

    tempMedName: '',
    tempMedCategory: null,
    tempMedArrival: '',
    tempMedMfg: '',
    tempMedExp: ''
};

const generateId = (prefix) => `${prefix}-${Math.floor(Math.random() * 100000)}`;
const getTimestamp = () => new Date().toLocaleString();
const formatTime = (ts) => {
    if (!ts || typeof ts !== 'string') return 'Time unknown';
    return ts.includes(',') ? ts.split(',')[1].trim() : ts;
};

const apiRequest = async (method, url, body = null) => {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
    }
    return response.json();
};

const mergeServerState = (data) => {
    if (!data) return;
    state.entries = Array.isArray(data.entries) ? data.entries : state.entries;
    state.alerts = Array.isArray(data.alerts) ? data.alerts : state.alerts;
    state.notifications = Array.isArray(data.notifications) ? data.notifications : state.notifications;
    state.medicines = Array.isArray(data.medicines) ? data.medicines : state.medicines;
};

const loadServerState = async () => {
    try {
        const data = await apiRequest('GET', '/api/state');
        mergeServerState(data);
        renderApp();
    } catch (error) {
        console.error('Unable to load backend state:', error);
    }
};

let toastTimeout;
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const styles = {
        info: 'border-l-4 border-blue-500 bg-white text-gray-800',
        success: 'border-l-4 border-green-500 bg-white text-gray-800',
        error: 'border-l-4 border-red-500 bg-white text-gray-800'
    };
    const icons = {
        info: `<i data-lucide="info" class="w-5 h-5 text-blue-500"></i>`,
        success: `<i data-lucide="check-circle" class="w-5 h-5 text-green-500"></i>`,
        error: `<i data-lucide="shield-alert" class="w-5 h-5 text-red-500"></i>`
    };

    container.innerHTML = `
        <div class="animate-fade-in-up px-5 py-4 rounded-lg shadow-xl flex items-center gap-3 font-medium text-sm ${styles[type]}">
            ${icons[type]}
            ${message}
        </div>
    `;
    lucide.createIcons();

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { container.innerHTML = ''; }, 3000);
};

setInterval(() => {
    const clockEl = document.getElementById('live-clock');
    if (clockEl) clockEl.innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}, 1000);
window.setPortal = (portalType) => {
    state.portal = portalType;
    state.currentView = 'login';
    renderApp();
};

window.goLanding = () => {
    state.currentView = 'landing';
    renderApp();
};

window.handleLogin = () => {
    const name = document.getElementById('login-name').value;
    const pass = document.getElementById('login-pass').value;
    const role = document.getElementById('login-role').value;

    if (!name || !pass) return showToast('Please complete all fields.', 'error');

    state.currentUser = { role, name };
    state.currentView = 'dashboard';
    showToast(`Welcome back, ${name}`, 'success');
    renderApp();
};

window.handleLogout = () => {
    state.currentUser = null;
    state.portal = null;
    state.currentView = 'landing';
    renderApp();
};

// Workflow Actions
window.updateEntryStatus = async (id, newStatus, message = null) => {
    try {
        const payload = {
            id,
            newStatus,
            message,
            actor: `${state.currentUser.name} (${state.currentUser.role})`,
            transit_start_time: newStatus === 'In Transit' ? getTimestamp() : undefined,
            transit_person: newStatus === 'In Transit' ? state.currentUser.name : undefined,
            transit_note: newStatus === 'In Transit' ? 'Dispatched from hospital facility' : undefined,
            timestamp: getTimestamp()
        };
        const data = await apiRequest('POST', '/api/update-status', payload);
        mergeServerState(data);

        if (newStatus === 'In Transit') showToast('Transport initiated. Awaiting Govt verification.', 'info');
        if (newStatus === 'Arrived') showToast('Arrival Confirmed & Verified by Govt.', 'success');
        if (newStatus === 'Approved') showToast('Waste approved for transit.', 'success');
        if (newStatus === 'Rejected') showToast('Waste entry rejected.', 'error');
    } catch (error) {
        console.error(error);
        showToast('Unable to update waste status.', 'error');
    }
    renderApp();
};

