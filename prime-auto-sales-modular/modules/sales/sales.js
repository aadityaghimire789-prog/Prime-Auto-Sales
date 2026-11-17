
if (Auth.loggedIn()) {

    /* SALES MODULE
       Requirement fields:
       SaleID, CustomerID, VehicleID, SaleDate, SalePrice, PaymentStatus.
    */

    moduleShell(
        'Sales Management',
        'Record vehicle sales and track customer payments.',
        `
        <div class="module-layout">

            <section class="form-panel">
                <h2 id="form-title">Record a sale</h2>
                <p class="muted">
                    Choose a customer and vehicle to link the sale.
                </p>

                <form id="sale-form">
                    <input type="hidden" id="sale-id">

                    <div class="form-grid">

                        <div class="field full">
                            <label for="customerId">Customer *</label>
                            <select id="customerId" required>
                                <option value="">Select customer</option>
                            </select>
                        </div>

                        <div class="field full">
                            <label for="vehicleId">Vehicle *</label>
                            <select id="vehicleId" required>
                                <option value="">Select available vehicle</option>
                            </select>
                        </div>

                        <div class="field">
                            <label for="saleDate">Sale date *</label>
                            <input
                                id="saleDate"
                                type="datetime-local"
                                required
                            >
                        </div>

                        <div class="field">
                            <label for="salePrice">Sale price (DKK) *</label>
                            <input
                                id="salePrice"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                            >
                        </div>

                        <div class="field full">
                            <label for="paymentStatus">Payment status *</label>
                            <select id="paymentStatus">
                                <option>Pending</option>
                                <option>Paid</option>
                                <option>Cancelled</option>
                            </select>
                        </div>

                    </div>

                    <div class="form-actions">
                        <button class="btn" type="submit">
                            Save sale
                        </button>

                        <button
                            class="btn secondary"
                            type="reset"
                            id="clear-form"
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </section>

            <section class="list-panel">
                <div class="panel-head">
                    <div>
                        <h2>Sales records</h2>
                        <p class="muted" id="record-count">0 sales</p>
                    </div>
                </div>

                <div class="toolbar">
                    <input
                        class="search"
                        id="search"
                        placeholder="Find customer, vehicle or sale..."
                    >

                    <select class="search-filter" id="payment-filter">
                        <option value="all">All payments</option>
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Cancelled</option>
                    </select>

                    <button class="btn secondary" id="export">
                        Export CSV
                    </button>
                </div>

                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Sale ID</th>
                                <th>Customer</th>
                                <th>Vehicle</th>
                                <th>Date</th>
                                <th>Sale price</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody id="rows"></tbody>
                    </table>
                </div>
            </section>

        </div>
        `
    );

    const form = document.getElementById('sale-form');

    // Get customer name using CustomerID
    function customerName(id) {
        const c = Store.all('customers')
            .find(x => x.id === Number(id));

        return c ? c.name : 'Customer not found';
    }

    // Get vehicle name using VehicleID
    function vehicleName(id) {
        const v = Store.all('vehicles')
            .find(x => x.id === Number(id));

        return v
            ? `${v.make} ${v.model}`
            : 'Vehicle not found';
    }

    // Populate customer and vehicle dropdowns
    function refreshOptions(
        selectedCustomer = '',
        selectedVehicle = ''
    ) {
        document.getElementById('customerId').innerHTML =
            '<option value="">Select customer</option>' +
            optionsFrom(
                'customers',
                'id',
                c => c.name,
                selectedCustomer
            );

        document.getElementById('vehicleId').innerHTML =
            '<option value="">Select vehicle</option>' +
            Store.all('vehicles').filter(v =>
    String(v.id) === String(selectedVehicle) ||
    !Store.all('sales').some(s =>
        Number(s.vehicleId) === Number(v.id) &&
        s.paymentStatus !== 'Cancelled'
    )
)
                .map(v => `
                    <option
                        value="${v.id}"
                        ${String(v.id) === String(selectedVehicle)
                            ? 'selected'
                            : ''}
                    >
                        ${esc(v.make)} ${esc(v.model)}
                        — ${money(v.price)}
                        (${esc(v.status)})
                    </option>
                `)
                .join('');
    }

    // Display sales records
    function render() {
        const q = document.getElementById('search')
            .value.toLowerCase();

        const filter = document.getElementById('payment-filter')
            .value;

        const rows = Store.all('sales').filter(s =>
            [
                customerName(s.customerId),
                vehicleName(s.vehicleId),
                s.paymentStatus
            ]
                .join(' ')
                .toLowerCase()
                .includes(q) &&
            (
                filter === 'all' ||
                s.paymentStatus === filter
            )
        );

        document.getElementById('record-count').textContent =
            `${rows.length} sale${rows.length === 1 ? '' : 's'}`;

        document.getElementById('rows').innerHTML = rows.length
            ? rows.map(s => `
                <tr>
                    <td>${s.id}</td>

                    <td>
                        ${esc(customerName(s.customerId))}
                    </td>

                    <td>
                        ${esc(vehicleName(s.vehicleId))}
                    </td>

                    <td>
                        ${esc((s.saleDate || '').replace('T', ' '))}
                    </td>

                    <td>
                        ${money(s.salePrice)}
                    </td>

                    <td>
                        <span class="status ${s.paymentStatus.toLowerCase()}">
                            ${esc(s.paymentStatus)}
                        </span>
                    </td>

                    <td>
                        <div class="actions">
                            <button
                                class="small-btn"
                                data-edit="${s.id}"
                            >
                                Edit
                            </button>

                            <button
                                class="small-btn"
                                data-delete="${s.id}"
                            >
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="7" class="empty">
                        No sales recorded yet. Add customers and vehicles first.
                    </td>
                </tr>
            `;
    }

    // Clear sale form
    function clear() {
        form.reset();

        document.getElementById('sale-id').value = '';

        document.getElementById('saleDate').value =
            dateNow();

        document.getElementById('form-title').textContent =
            'Record a sale';

        refreshOptions();
    }

    // Add or update a sale
    form.addEventListener('submit', e => {
        e.preventDefault();

        const id = document.getElementById('sale-id').value;

        const customerId = Number(
            document.getElementById('customerId').value
        );

        const vehicleId = Number(
            document.getElementById('vehicleId').value
        );

        const vehicle = Store.all('vehicles')
            .find(v => v.id === vehicleId);

        if (
            !Store.all('customers').some(c => c.id === customerId) ||
            !vehicle
        ) {
            toast('Select an existing customer and vehicle.');
            return;
        }

        const item = {
            id: id
                ? Number(id)
                : Store.nextId('sales', 'id'),

            customerId,
            vehicleId,

            saleDate: document.getElementById('saleDate').value,

            salePrice: Number(
                document.getElementById('salePrice').value
            ),

            paymentStatus: document.getElementById('paymentStatus').value
        };

        if (
            !item.saleDate ||
            !Number.isFinite(item.salePrice) ||
            item.salePrice <= 0
        ) {
            toast('Enter a valid sale date and a price greater than zero.');
            return;
        }

        if(!id&&Store.all('sales').some(s=>Number(s.vehicleId)===vehicleId&&s.paymentStatus!=='Cancelled')){
            toast('This vehicle has already been sold.');
            return;
        }

        Store.upsert('sales', 'id', item);

        // Update vehicle availability
        const allSales = Store.all('sales');

        const sold = allSales.some(s =>
            s.vehicleId === vehicleId &&
            s.paymentStatus !== 'Cancelled'
        );

        vehicle.status = sold ? 'Sold' : 'Available';

        Store.upsert('vehicles', 'id', vehicle);

        clear();
        render();

        toast(id ? 'Sale updated.' : 'Sale recorded.');
    });

    // Form controls
    document.getElementById('clear-form')
        .addEventListener('click', () => {
            setTimeout(clear, 0);
        });

    document.getElementById('search')
        .addEventListener('input', render);

    document.getElementById('payment-filter')
        .addEventListener('change', render);

    // Edit and delete sales records
    document.getElementById('rows').addEventListener('click', e => {

        const edit = e.target.dataset.edit;
        const del = e.target.dataset.delete;

        // Edit sale
        if (edit) {
            const s = Store.all('sales')
                .find(x => x.id === Number(edit));

            if (!s) return;

            document.getElementById('sale-id').value = s.id;

            refreshOptions(s.customerId, s.vehicleId);

            document.getElementById('saleDate').value =
                s.saleDate;

            document.getElementById('salePrice').value =
                s.salePrice;

            document.getElementById('paymentStatus').value =
                s.paymentStatus;

            document.getElementById('form-title').textContent =
                'Edit sale';
        }

        // Delete sale
        if (del && confirm('Delete this sale record?')) {

            const s = Store.all('sales')
                .find(x => x.id === Number(del));

            Store.remove('sales', 'id', del);

            if (s) {
                const v = Store.all('vehicles')
                    .find(x => x.id === s.vehicleId);

                if (
                    v &&
                    !Store.all('sales').some(x =>
                        x.vehicleId === v.id &&
                        x.paymentStatus !== 'Cancelled'
                    )
                ) {
                    v.status = 'Available';

                    Store.upsert('vehicles', 'id', v);
                }
            }

            render();
            toast('Sale deleted.');
        }
    });

    // Export sales records to CSV
    document.getElementById('export')
        .addEventListener('click', () => {

            const rows = Store.all('sales');

            const csv = [
                'SaleID,CustomerID,VehicleID,SaleDate,SalePrice,PaymentStatus',

                ...rows.map(s =>
                    [
                        s.id,
                        s.customerId,
                        s.vehicleId,
                        s.saleDate,
                        s.salePrice,
                        s.paymentStatus
                    ]
                        .map(x =>
                            '"' + String(x).replace(/"/g, '""') + '"'
                        )
                        .join(',')
                )
            ].join('\n');

            const a = document.createElement('a');

            a.href = URL.createObjectURL(
                new Blob([csv], { type: 'text/csv' })
            );

            a.download = 'sales.csv';
            a.click();

            URL.revokeObjectURL(a.href);
        });

    // Initial setup
    refreshOptions();

    document.getElementById('saleDate').value =
        dateNow();

    render();

}
