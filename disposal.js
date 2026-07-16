
const renderDisposal = () => {
    const active = state.entries.filter(e => ['Approved', 'In Transit'].includes(e.status));
    const rows = active.length === 0
        ? `<div class="p-12 text-center text-gray-500">No approved payload awaiting transit.</div>`
        : active.map(e => `
            <div class="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <div class="flex-1">
                    <span class="text-[10px] text-gray-400 font-mono block mb-1">ID: ${e.id}</span>
                    <div class="font-bold text-gray-900 text-lg">${e.wasteType}</div>
                    <div class="text-sm text-gray-500 mt-1">${e.quantity} &bull; ${e.category} Bin</div>
                </div>
                <div class="flex-1 md:border-l md:border-r border-gray-200 md:px-6">
                    ${e.status === 'Approved' ? `
                        <div class="text-sm text-gray-500 italic">Payload secured at hospital. Awaiting dispatch.</div>
                    ` : `
                        <div class="space-y-1.5 bg-blue-50 border border-blue-100 p-3 rounded-lg">
                            <div class="text-xs font-bold text-blue-700 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span> Transit Log
                            </div>
                            <div class="text-xs text-gray-600 flex justify-between"><span class="text-gray-500">Driver:</span> <span class="font-medium">${e.transit_person}</span></div>
                            <div class="text-xs text-gray-600 flex justify-between"><span class="text-gray-500">Dispatch:</span> <span class="font-medium">${formatTime(e.transit_start_time)}</span></div>
                        </div>
                    `}
                </div>
                <div class="flex-1 flex md:justify-end">
                    ${e.status === 'Approved' ? `
                        <button onclick="updateEntryStatus('${e.id}', 'In Transit')" class="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm flex justify-center items-center gap-2">
                            <i data-lucide="truck" class="w-4 h-4"></i> Start Transport
                        </button>
                    ` : `
                        <div class="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold text-sm flex justify-center items-center gap-2 border border-gray-200">
                            <i data-lucide="clock" class="w-4 h-4"></i> Awaiting Govt Approval
                        </div>
                    `}
                </div>
            </div>`).join('');

    return `
        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div class="p-6 border-b border-gray-100 flex items-center gap-4">
                <div class="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                    <i data-lucide="truck" class="w-6 h-6"></i>
                </div>
                <div>
                    <h2 class="text-xl font-bold text-gray-900">Transit Protocol Hub</h2>
                    <p class="text-sm text-gray-500">Manage dispatch for approved clinical waste payloads.</p>
                </div>
            </div>
            <div>${rows}</div>
        </div>
    `;
};