
const renderAdmin = () => {
    const transit = state.entries.filter(e => e.status === 'In Transit');
    const verified = state.entries.filter(e => e.status === 'Arrived');

    const alertsHTML = state.alerts.length === 0 ? '' : `
        <div class="bg-white border border-red-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
            <div class="p-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
                <h2 class="text-base font-bold text-red-800 flex items-center gap-2"><i data-lucide="alert-circle" class="w-5 h-5"></i> Action Required: Compliance Alerts</h2>
            </div>
            <div>
                ${state.alerts.map(a => `
                    <div class="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 last:border-0 ${a.status === 'Resolved' ? 'opacity-50 bg-gray-50' : ''}">
                        <div>
                            <div class="flex items-center gap-2 mb-1.5">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${a.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}">${a.status}</span>
                                <span class="text-xs text-gray-400">${a.timestamp}</span>
                            </div>
                            <h4 class="font-bold text-gray-900 text-base">${a.hospitalName}</h4>
                            <p class="text-sm text-gray-600 mt-0.5">${a.message}</p>
                            <p class="text-xs text-gray-400 mt-1">Loc: ${a.location}</p>
                        </div>
                        ${a.status === 'Active' ? `<button onclick="resolveAlert('${a.id}')" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">Resolve Incident</button>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const transitHTML = transit.length === 0
        ? `<p class="text-gray-500 text-center py-4">No waste currently reported in transit.</p>`
        : transit.map(e => `
            <div class="border border-gray-200 rounded-xl p-5 hover:border-teal-300 transition-colors mb-4">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <span class="text-[10px] text-gray-400 font-mono block mb-1">ID: ${e.id}</span>
                        <div class="font-bold text-gray-900 text-lg">${e.wasteType}</div>
                    </div>
                    <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded">IN TRANSIT</span>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 text-sm text-gray-600 space-y-1">
                    <div class="flex justify-between"><span>Driver:</span> <span class="font-medium">${e.transit_person}</span></div>
                    <div class="flex justify-between"><span>Dispatched:</span> <span class="font-medium">${formatTime(e.transit_start_time)}</span></div>
                </div>
                <button onclick="updateEntryStatus('${e.id}', 'Arrived')" class="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm flex justify-center items-center gap-2">
                    <i data-lucide="package" class="w-4 h-4"></i> Confirm Arrival & Approve
                </button>
            </div>`).join('');

    const verifiedHTML = verified.length === 0
        ? `<p class="text-gray-500 text-center py-4">No verified records yet.</p>`
        : verified.map(e => `
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
                <div class="font-bold text-gray-900 mb-0.5">${e.wasteType} <span class="text-gray-500 font-normal text-sm">(${e.quantity})</span></div>
                <div class="text-[10px] text-gray-400 font-mono tracking-widest mb-4 border-b border-gray-200 pb-3">TRK: ${e.id}</div>
                <div class="space-y-3 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
                    ${e.history.map((step, idx) => `
                        <div class="relative flex items-center justify-between md:justify-normal ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}">
                            <div class="flex items-center justify-center w-3 h-3 rounded-full border-2 border-white bg-teal-500 z-10"></div>
                            <div class="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-gray-200 bg-white text-xs shadow-sm">
                                <div class="font-bold text-gray-800">${step.status}</div>
                                <div class="text-[10px] text-gray-500 mt-0.5">${formatTime(step.timestamp)}</div>
                                <div class="text-[10px] text-gray-400 mt-1">By: ${step.actor}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`).join('');

    return `
        ${alertsHTML}
        <div class="grid lg:grid-cols-2 gap-6">
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-fit">
                <div class="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                    <i data-lucide="truck" class="w-5 h-5 text-teal-600"></i>
                    <h2 class="text-lg font-bold text-gray-900">Incoming Transports</h2>
                </div>
                <div class="p-5">${transitHTML}</div>
            </div>
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-fit">
                <div class="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                    <i data-lucide="shield-check" class="w-5 h-5 text-green-600"></i>
                    <h2 class="text-lg font-bold text-gray-900">Secured & Verified Disposals</h2>
                </div>
                <div class="p-5 max-h-[600px] overflow-y-auto">${verifiedHTML}</div>
            </div>
        </div>
    `;
};

window.resolveAlert = async (id) => {
    try {
        const payload = {
            id,
            resolvedAt: getTimestamp(),
            timestamp: getTimestamp(),
            notificationId: generateId('NTF'),
            notificationMessage: 'Action will be taken immediately'
        };
        const data = await apiRequest('POST', '/api/resolve-alert', payload);
        mergeServerState(data);
        showToast('Alert marked as resolved.', 'success');
    } catch (error) {
        console.error(error);
        showToast('Unable to resolve alert.', 'error');
    }
    renderApp();
};