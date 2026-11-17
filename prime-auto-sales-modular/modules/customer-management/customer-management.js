
if (Auth.loggedIn()) {
    /* CUSTOMER MANAGEMENT MODULE
       Requirement fields: CustomerID, Name, Phone, Email, Address.
    */

    moduleShell(
        'Customer Management',
        'Create and maintain customer contact information.',
        `
        <div class="module-layout">

            <section class="form-panel">
                <h2 id="form-title">Add customer</h2>
                <p class="muted">Enter the customer's details below.</p>

                <form id="customer-form">
                    <input type="hidden" id="customer-id">

                    <div class="form-grid">
                        <div class="field full">
                            <label for="name">Full name *</label>
                            <input
                                id="name"
                                maxlength="100"
                                required
                                placeholder="e.g. Alex Jensen"
                            >
                        </div>

                        <div class="field">
                            <label for="phone">Phone *</label>
                            <input
                                id="phone"
                                maxlength="20"
                                required
                                placeholder="Phone number"
                            >
                        </div>

                        <div class="field">
                            <label for="email">Email address *</label>
                            <input
                                id="email"
                                type="email"
                                maxlength="150"
                                required
                                placeholder="name@example.com"
                            >
                        </div>

                        <div class="field full">
                            <label for="address">Home address</label>
                            <textarea
                                id="address"
                                maxlength="225"
                                placeholder="Street, city, postal code"
                            ></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="btn" type="submit">
                            Save customer
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
                        <h2>Customer records</h2>
                        <p class="muted" id="record-count">0 customers</p>
                    </div>
                </div>

                <div class="toolbar">
                    <input
                        class="search"
                        id="search"
                        placeholder="Find by name, phone or email..."
                    >

                    <select class="search-filter" id="customer-filter">
                        <option value="all">All customers</option>
                        <option value="address">Has address</option>
                        <option value="no-address">Missing address</option>
                    </select>

                    <button class="btn secondary" id="export">
                        Export CSV
                    </button>
                </div>

                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
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

    const form = document.getElementById('customer-form');

    // Display customer records
    function render() {
        const q = document.getElementById('search').value.toLowerCase();
        const filter = document.getElementById('customer-filter').value;

        const rows = Store.all('customers').filter(c =>
            [c.name, c.phone, c.email, c.address]
                .join(' ')
                .toLowerCase()
                .includes(q) &&
            (
                filter === 'all' ||
                (filter === 'address' ? !!c.address : !c.address)
            )
        );

        document.getElementById('record-count').textContent =
            `${rows.length} customer${rows.length === 1 ? '' : 's'}`;

        document.getElementById('rows').innerHTML = rows.length
            ? rows.map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td><b>${esc(c.name)}</b></td>
                    <td>${esc(c.phone)}</td>
                    <td>${esc(c.email)}</td>
                    <td>${esc(c.address || '—')}</td>

                    <td>
                        <div class="actions">
                            <button class="small-btn" data-edit="${c.id}">
                                Edit
                            </button>

                            <button class="small-btn" data-delete="${c.id}">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="6" class="empty">
                        No customer records found.
                    </td>
                </tr>
            `;
    }

    // Clear customer form
    function clear() {
        form.reset();

        document.getElementById('customer-id').value = '';
        document.getElementById('form-title').textContent = 'Add customer';
    }

    // Add or update customer
    form.addEventListener('submit', e => {
        e.preventDefault();

        const id = document.getElementById('customer-id').value;

        const item = {
            id: id ? Number(id) : Store.nextId('customers', 'id'),
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim()
        };

        if (!item.name || !item.phone || !item.email) {
            toast('Please complete all required fields.');
            return;
        }

        if (!/^[+0-9()\s.-]{6,20}$/.test(item.phone)) {
            toast('Enter a valid phone number (6–20 characters).');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
            toast('Enter a valid email address.');
            return;
        }

        Store.upsert('customers', 'id', item);

        clear();
        render();

        toast(id ? 'Customer updated.' : 'Customer added.');
    });

    // Form controls
    document.getElementById('clear-form')
        .addEventListener('click', clear);

    document.getElementById('search')
        .addEventListener('input', render);

    document.getElementById('customer-filter')
        .addEventListener('change', render);

    // Edit and delete customer records
    document.getElementById('rows').addEventListener('click', e => {
        const edit = e.target.dataset.edit;
        const del = e.target.dataset.delete;

        if (edit) {
            const c = Store.all('customers')
                .find(x => x.id === Number(edit));

            if (!c) return;

            document.getElementById('customer-id').value = c.id;

            for (const k of ['name', 'phone', 'email', 'address']) {
                document.getElementById(k).value = c[k] || '';
            }

            document.getElementById('form-title').textContent =
                'Edit customer';
        }

        if (del) {
            if (confirm(
                'Delete this customer? Related sales and enquiries will not be deleted.'
            )) {
                Store.remove('customers', 'id', del);

                render();
                toast('Customer deleted.');
            }
        }
    });

    // Export customer records to CSV
    document.getElementById('export').addEventListener('click', () => {
        const rows = Store.all('customers');

        const csv = [
            'CustomerID,Name,Phone,Email,Address',

            ...rows.map(c =>
                [c.id, c.name, c.phone, c.email, c.address]
                    .map(v =>
                        '"' + String(v || '').replace(/"/g, '""') + '"'
                    )
                    .join(',')
            )
        ].join('\n');

        const a = document.createElement('a');

        a.href = URL.createObjectURL(
            new Blob([csv], { type: 'text/csv' })
        );

        a.download = 'customers.csv';
        a.click();

        URL.revokeObjectURL(a.href);
    });

    // Initial customer records display
    render();
}
