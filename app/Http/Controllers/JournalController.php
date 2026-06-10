<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\ChartOfAccount;
use App\Services\AccountingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function __construct(
        private AccountingService $accounting
    ) {}

    public function index(): Response
    {
        $stationId = auth()->user()->station_id;

        $journals = Journal::with(['createdBy'])
            ->where('station_id', $stationId)
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(15);

        return Inertia::render('Accounting/JournalList', [
            'journals' => $journals,
        ]);
    }

    public function create(): Response
    {
        $stationId = auth()->user()->station_id;

        $accounts = ChartOfAccount::where('station_id', $stationId)
            ->where('is_active', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/JournalCreate', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $stationId = auth()->user()->station_id;

        $validated = $request->validate([
            'date' => 'required|date',
            'narration' => 'required|string|max:500',
            'entries' => 'required|array|min:2',
            'entries.*.account_id' => 'required|exists:chart_of_accounts,id',
            'entries.*.debit' => 'required|numeric|min:0',
            'entries.*.credit' => 'required|numeric|min:0',
            'entries.*.description' => 'nullable|string|max:255',
        ]);

        $validated['station_id'] = $stationId;
        $validated['type'] = 'general';

        try {
            $this->accounting->post($validated, auth()->id());
            return redirect()->route('journals.index')->with('success', 'Journal entry posted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function show(Journal $journal): Response
    {
        $journal->load(['entries.account', 'createdBy', 'postedBy', 'reversedByJournal']);
        return Inertia::render('Accounting/JournalShow', [
            'journal' => $journal,
        ]);
    }

    public function reverse(Journal $journal): RedirectResponse
    {
        if ($journal->is_reversed) {
            return redirect()->back()->with('error', 'This journal is already reversed.');
        }

        try {
            $this->accounting->reverse($journal, auth()->id());
            return redirect()->back()->with('success', 'Journal entry reversed successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
