const renderSupervisor = () => {
    const pending = state.entries.filter(e => e.status === 'Pending');
    const arrived = state.entries.filter(e => e.status === 'Arrived');

    const pendingHTML = pending.length === 0
        ? `<div class="p-8 text-center text-gray-500">No pending submissions from clinical staff.</div>`
        : pending.map(e => `
            <div class="p-5 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="font-bold text-gray-900">${e.wasteType} <span class="font-normal text-gray-500 text-sm">(${e.quantity})</span></div>
                        <div class="text-sm text-gray-500 mt-0.5">Submitted by ${e.nurseName}</div>
                    </div>
                    <span class="text-[10px] font-bold uppercase px-2 py-1 rounded border ${getCategoryBadge(e.category)}">${e.category} BIN</span>
                </div>
                <div class="flex justify-between items-center mt-4">
                    <div class="text-xs text-gray-400 font-mono">${formatTime(e.timestamp)}</div>
                    <div class="flex gap-2">
                        <button onclick="updateEntryStatus('${e.id}', 'Rejected')" class="px-4 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-sm font-semibold transition-colors">Reject</button>
                        <button onclick="updateEntryStatus('${e.id}', 'Approved')" class="px-4 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-semibold shadow-sm transition-colors">Approve</button>
                    </div>
                </div>
            </div>`).join('');

    const arrivedHTML = arrived.length === 0
        ? `<div class="p-8 text-center text-gray-500">No waste has been officially verified as arrived.</div>`
        : arrived.map(e => `
            <div class="p-5 flex items-center justify-between border-b border-gray-100 last:border-0">
                <div>
                    <div class="font-semibold text-gray-900">${e.wasteType}</div>
                    <div class="text-xs text-gray-500 mt-1">${e.quantity} &bull; ${e.category} Bin</div>
                </div>
                <div class="text-right">
                    <div class="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded">ARRIVED SECURELY</div>
                    <div class="text-[10px] text-gray-400 mt-1.5">${formatTime(e.history[e.history.length-1]?.timestamp)}</div>
                </div>
            </div>`).join('');

    const supervisorNotes = state.notifications.filter(n => n.recipient === 'Supervisor');
    const supervisorNotesHTML = supervisorNotes.length === 0
        ? ''
        : `
            <div class="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm mb-6">
                <div class="p-5 border-b border-blue-100 bg-blue-50 flex items-center gap-2">
                    <i data-lucide="bell" class="w-5 h-5 text-blue-600"></i>
                    <h2 class="text-lg font-bold text-gray-900">Supervisor Messages</h2>
                </div>
                <div class="divide-y divide-blue-100">
                    ${supervisorNotes.map(note => `
                        <div class="p-4">
                            <div class="text-sm text-gray-600">${note.message}</div>
                            <div class="text-[10px] text-gray-400 mt-2">${note.timestamp}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

    return `
        ${supervisorNotesHTML}
        <div class="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div class="flex items-center gap-4">
                <div class="p-2.5 bg-red-100 rounded-xl text-red-600">
                    <i data-lucide="shield-alert" class="w-6 h-6"></i>
                </div>
                <div>
                    <h3 class="font-bold text-red-900">Protocol Breach Monitor</h3>
                    <p class="text-sm text-red-700 mt-0.5">Report external disposal team if they exceed the 48-hour pickup window.</p>
                </div>
            </div>
            <button onclick="reportDisposalNotArrived()" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors whitespace-nowrap shadow-sm">Report Missing Disposal</button>
        </div>
        <div class="grid xl:grid-cols-2 gap-6">
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div class="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">Awaiting Approval</h2>
                    <span class="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">${pending.length} Items</span>
                </div>
                <div>${pendingHTML}</div>
            </div>
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div class="p-5 border-b border-gray-100 bg-green-50/50 flex items-center gap-2">
                    <i data-lucide="check-circle" class="text-green-600 w-5 h-5"></i>
                    <h2 class="text-lg font-bold text-gray-900">Verified Disposals <span class="font-normal text-sm text-gray-500">(Govt Approved)</span></h2>
                </div>
                <div class="max-h-[500px] overflow-y-auto">${arrivedHTML}</div>
            </div>
        </div>
    `;
};

window.reportDisposalNotArrived = async () => {
    try {
        const payload = {
            id: generateId('ALT'),
            hospitalName: 'Central City Hospital',
            location: 'Downtown District, Sector 4',
            message: 'Disposal team failed to arrive for scheduled pickup.',
            timestamp: getTimestamp(),
            status: 'Active',
            reportedBy: state.currentUser.name
        };
        const data = await apiRequest('POST', '/api/report-alert', payload);
        mergeServerState(data);
        showToast('Critical compliance alert reported.', 'error');
    } catch (error) {
        console.error(error);
        showToast('Unable to report disposal delay.', 'error');
    }
    renderApp();
};
