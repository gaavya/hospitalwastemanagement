const getCategoryBadge = (cat) => {
    const b = {
        'Red': 'border-red-200 bg-red-50 text-red-700',
        'Yellow': 'border-yellow-200 bg-yellow-50 text-yellow-700',
        'White': 'border-gray-300 bg-white text-gray-700',
        'Blue': 'border-blue-200 bg-blue-50 text-blue-700',
        'Black': 'border-gray-300 bg-gray-100 text-gray-700'
    };
    return b[cat] || 'border-gray-300 bg-gray-100 text-gray-700';
};

const renderLanding = () => `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 selection:bg-blue-100">
        <div class="text-center mb-16">
            <div class="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-6">
                <i data-lucide="shield-check" class="w-10 h-10 text-blue-600"></i>
            </div>
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Central Hospital Protocol</h1>
            <p class="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">Enterprise-grade tracking and compliance verification for biomedical and clinical waste management.</p>
        </div>
        <div class="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
            <button onclick="setPortal('hospital')" class="flex-1 bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl hover:border-blue-300 transition-all duration-200 group text-left text-gray-800">
                <div class="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <i data-lucide="building" class="w-8 h-8"></i>
                </div>
                <h2 class="text-2xl font-bold mb-2">Hospital Network</h2>
                <p class="text-gray-500 leading-relaxed text-sm">Secure access for clinical staff, administrators, and authorized transit operators.</p>
            </button>
            <button onclick="setPortal('gov')" class="flex-1 bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl hover:border-teal-300 transition-all duration-200 group text-left text-gray-800">
                <div class="bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                    <i data-lucide="landmark" class="w-8 h-8"></i>
                </div>
                <h2 class="text-2xl font-bold mb-2">Govt Oversight</h2>
                <p class="text-gray-500 leading-relaxed text-sm">Federal verification, compliance auditing, and central resolution hub.</p>
            </button>
        </div>
    </div>
`;

const renderLogin = () => {
    const isHosp = state.portal === 'hospital';
    const themeColor = isHosp ? 'blue' : 'teal';
    const roles = isHosp ? ['Nurse', 'Supervisor', 'Disposal Team', 'Pharmacist'] : ['Administrator'];

    let roleOpts = roles.map(r => `<option value="${r}">${r}</option>`).join('');

    return `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
                <div class="flex items-center gap-3 mb-8">
                    <button onclick="goLanding()" class="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <i data-lucide="arrow-right" class="w-5 h-5 rotate-180"></i>
                    </button>
                    <h2 class="text-2xl font-bold text-gray-900 tracking-tight">${isHosp ? 'Hospital Gateway' : 'Oversight Login'}</h2>
                </div>
                <div class="space-y-5">
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">User Identification</label>
                        <div class="relative">
                            <i data-lucide="user" class="absolute left-4 top-3.5 w-5 h-5 text-gray-400"></i>
                            <input id="login-name" type="text" class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none transition-all placeholder-gray-400" placeholder="Enter full name" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Security Credential</label>
                        <input id="login-pass" type="password" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none transition-all placeholder-gray-400" placeholder="••••••••" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Authorized Role</label>
                        <select id="login-role" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none transition-all">
                            ${roleOpts}
                        </select>
                    </div>
                    <button onclick="handleLogin()" class="w-full py-3.5 mt-4 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg bg-${themeColor}-600 hover:bg-${themeColor}-700">
                        Authenticate
                    </button>
                </div>
            </div>
        </div>
    `;
};

const renderNurse = () => {
    const myEntries = state.entries.filter(e => e.nurseName === state.currentUser.name);
    const entryRows = myEntries.length === 0
        ? `<div class="p-8 text-center text-gray-500">No records submitted during this shift.</div>`
        : myEntries.map(e => `
            <div class="p-5 hover:bg-gray-50 transition-colors flex justify-between items-center border-b border-gray-100 last:border-0">
                <div>
                    <div class="font-semibold text-gray-900 flex items-center gap-2">
                        ${e.wasteType || 'Unknown'}
                        <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(e.category)}">${e.category || 'Unknown'} BIN</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${e.quantity} &bull; Logged ${formatTime(e.timestamp)}</div>
                </div>
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${e.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : e.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                    ${e.status}
                </span>
            </div>`).join('');

    const catHTML = state.tempNurseCategory
        ? `<div class="w-full px-4 py-3 rounded-lg border transition-all font-semibold ${state.tempNurseCategory.style}">${state.tempNurseCategory.color}</div>`
        : `<div class="w-full px-4 py-3 rounded-lg border transition-all font-semibold border-dashed border-gray-300 bg-gray-50 text-gray-400">Awaiting input...</div>`;

    return `
        <div class="grid lg:grid-cols-12 gap-6">
            <div class="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit">
                <h2 class="text-lg font-bold mb-5 flex items-center gap-2 text-gray-900">
                    <i data-lucide="file-text" class="w-5 h-5 text-blue-600"></i> Clinical Waste Registration
                </h2>
                <form onsubmit="submitNurseEntry(event)" class="space-y-5">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Description / Item</label>
                        <input id="nurse-waste-input" type="text" value="${state.tempNurseWasteType}" oninput="handleNurseInput(this.value)" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900" placeholder="e.g., Blood-stained gauze, Used scalpel..." />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Auto-Assigned Category</label>
                        ${catHTML}
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Weight / Volume</label>
                        <input id="nurse-qty-input" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 transition-all" placeholder="e.g., 500g, 2 bags" />
                    </div>
                    <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors mt-2">Submit Record</button>
                </form>
            </div>
            <div class="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-0 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 class="text-lg font-bold text-gray-900">Recent Submissions (My Shift)</h2>
                </div>
                <div class="max-h-[500px] overflow-y-auto">
                    ${entryRows}
                </div>
            </div>
        </div>
    `;
};

const renderPharmacist = () => {
    const stats = state.medicines.reduce((acc, med) => {
        const st = getMedStatus(med.expDate).l;
        if (st === 'Valid') acc.valid++;
        else if (st === 'Expiring') acc.expiring++;
        else if (st === 'Expired') acc.expired++;
        return acc;
    }, { valid: 0, expiring: 0, expired: 0 });

    const total = state.medicines.length || 1;
    const validPct = (stats.valid / total) * 100;
    const expiringPct = (stats.expiring / total) * 100;
    const expiredPct = (stats.expired / total) * 100;

    const makeRing = (pct, color, label, count) => {
        const r = 36;
        const c = 2 * Math.PI * r;
        const offset = window.animateChart ? c - (pct / 100) * c : c;
        return `
            <div class="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-all">
                <div class="relative w-24 h-24">
                    <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="${r}" class="stroke-gray-200" stroke-width="8" fill="none" />
                        <circle cx="50" cy="50" r="${r}" class="${color} transition-all duration-[1500ms] ease-out" stroke-width="8" fill="none" stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round" />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-xl font-extrabold text-gray-800 leading-none">${count}</span>
                        <span class="text-[10px] text-gray-400 font-bold mt-1">${Math.round(pct)}%</span>
                    </div>
                </div>
                <span class="text-sm font-bold text-gray-700 mt-3">${label}</span>
            </div>
        `;
    };

    const rows = state.medicines.length === 0
        ? `<tr><td colspan="3" class="px-5 py-10 text-center text-gray-500">Inventory is empty.</td></tr>`
        : state.medicines.map(m => {
            const st = getMedStatus(m.expDate);
            return `
            <tr class="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <td class="px-5 py-4">
                    <div class="font-bold text-gray-900">${m.name}</div>
                    <div class="text-xs text-gray-500 mt-0.5">${m.category}</div>
                </td>
                <td class="px-5 py-4 text-xs text-gray-600">
                    <div>${m.arrivalDate}</div>
                    <div class="font-medium text-gray-900 mt-0.5">${m.expDate}</div>
                </td>
                <td class="px-5 py-4 text-right">
                    <span class="px-2.5 py-1 border rounded text-xs font-semibold ${st.c}">${st.l}</span>
                </td>
            </tr>`;
        }).join('');

    const catHTML = state.tempMedCategory || 'Awaiting input...';
    const tempStatus = state.tempMedExp ? getMedStatus(state.tempMedExp) : { l: 'Awaiting input...', c: 'text-gray-700 bg-gray-50 border-gray-200' };

    return `
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <div class="flex items-center gap-2 mb-6">
                <i data-lucide="activity" class="w-5 h-5 text-blue-600"></i>
                <h2 class="text-lg font-bold text-gray-900">Inventory Health Overview</h2>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                ${makeRing(validPct, 'stroke-green-500', 'Safe / Valid', stats.valid)}
                ${makeRing(expiringPct, 'stroke-yellow-500', 'Expiring Soon', stats.expiring)}
                ${makeRing(expiredPct, 'stroke-red-500', 'Expired (To Disposal)', stats.expired)}
            </div>
        </div>

        <div class="grid md:grid-cols-12 gap-6">
            <div class="md:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit">
                <h2 class="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
                    <i data-lucide="package" class="w-5 h-5 text-blue-600"></i> Inventory Intake
                </h2>
                <form onsubmit="submitMedicine(event)" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Medicine Name</label>
                        <input id="med-name-input" type="text" value="${state.tempMedName}" oninput="handleMedNameChange(this.value)" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-gray-900 text-sm" placeholder="e.g. Amoxicillin" />
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Class</label>
                        <div class="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium">${catHTML}</div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Arrival Date</label>
                        <input id="med-arr" type="date" value="${state.tempMedArrival}" onchange="state.tempMedArrival=this.value" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-gray-900 text-sm" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-1">Mfg Date</label>
                            <input id="med-mfg" type="date" value="${state.tempMedMfg}" onchange="state.tempMedMfg=this.value" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-gray-900 text-sm" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-1">Exp Date</label>
                            <input id="med-exp" type="date" value="${state.tempMedExp}" onchange="state.tempMedExp=this.value; renderApp()" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-gray-900 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Condition</label>
                        <div class="w-full px-3 py-2.5 rounded-lg border text-sm font-medium ${tempStatus.c}">${tempStatus.l}</div>
                    </div>
                    <button type="submit" class="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm">Log to Database</button>
                </form>
            </div>
            <div class="md:col-span-8 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-fit">
                <div class="p-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2"><i data-lucide="file-text" class="w-5 h-5 text-gray-500"></i> Digital Inventory Log</h2>
                </div>
                <div class="overflow-x-auto max-h-[500px]">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 text-gray-500 font-semibold text-xs uppercase sticky top-0 border-b border-gray-200 z-10">
                            <tr>
                                <th class="px-5 py-3">Substance</th>
                                <th class="px-5 py-3">Timeline (In &rarr; Exp)</th>
                                <th class="px-5 py-3 text-right">Condition</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

const renderDashboardWrapper = (content) => {
    const isHosp = state.portal === 'hospital';
    const accent = isHosp ? 'blue' : 'teal';
    const icon = isHosp ? 'building' : 'landmark';
    const title = isHosp ? 'Central City Hospital' : 'E-Waste Govt Authority';

    return `
        <header class="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
            <div class="flex items-center gap-4">
                <div class="p-2.5 rounded-xl bg-${accent}-50 text-${accent}-600">
                    <i data-lucide="${icon}" class="w-6 h-6"></i>
                </div>
                <div>
                    <h1 class="font-bold text-lg text-gray-900 tracking-tight leading-none mb-1">${title}</h1>
                    <p class="text-xs text-gray-500 font-medium">${state.currentUser?.name} &bull; ${state.currentUser?.role}</p>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <div class="hidden sm:flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
                    <i data-lucide="clock" class="w-4 h-4 mr-2"></i>
                    <span id="live-clock">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <button onclick="handleLogout()" class="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold">
                    <i data-lucide="log-out" class="w-4 h-4"></i> <span class="hidden sm:inline">Sign Out</span>
                </button>
            </div>
        </header>
        <main class="flex-1 p-6 max-w-[1400px] w-full mx-auto space-y-6">
            ${content}
        </main>
    `;
};

// Master Render Function
const renderApp = () => {
    const appDiv = document.getElementById('app');

    if (state.currentView === 'landing') {
        appDiv.innerHTML = renderLanding();
    } else if (state.currentView === 'login') {
        appDiv.innerHTML = renderLogin();
    } else if (state.currentView === 'dashboard') {
        let innerContent = '';
        if (state.currentUser.role === 'Nurse') innerContent = renderNurse();
        else if (state.currentUser.role === 'Supervisor') innerContent = renderSupervisor();
        else if (state.currentUser.role === 'Disposal Team') innerContent = renderDisposal();
        else if (state.currentUser.role === 'Administrator') innerContent = renderAdmin();
        else if (state.currentUser.role === 'Pharmacist') innerContent = renderPharmacist();

        appDiv.innerHTML = renderDashboardWrapper(innerContent);
    }

    // Re-initialize Lucide Icons after DOM updates
    lucide.createIcons();
};

// Initial Boot
window.animateChart = true; // Setup for pharmacist chart animation logic
renderApp();
loadServerState();
