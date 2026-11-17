
if (Auth.loggedIn()) {

    /* CUSTOMER SERVICE MODULE
       Requirement fields: EnquiryId, CustomerID, VehicleID, EnquiryDate, Message, Status.
       Also includes test-drive bookings as described in the system overview.
    */

    moduleShell(
        'Customer Service',
        'Track customer enquiries and arrange test-drive bookings.',
        `
        <section class="panel">
            <div class="panel-head">
                <div>
                    <h2 id="enquiry-form-title">Create customer enquiry</h2>
                    <p class="muted">Record a question or request from a customer.</p>
                </div>
            </div>

            <form id="enquiry-form">
                <input type="hidden" id="enquiry-id">

                <div class="form-grid">
                    <div class="field">
                        <label for="enquiryCustomer">Customer *</label>
                        <select id="enquiryCustomer" required>
                            <option value="">Select customer</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="enquiryVehicle">Vehicle (optional)</label>
                        <select id="enquiryVehicle">
                            <option value="">No vehicle selected</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="enquiryDate">Enquiry date *</label>
                        <input id="enquiryDate" type="datetime-local" required>
                    </div>

                    <div class="field">
                        <label for="enquiryStatus">Status</label>
                        <select id="enquiryStatus">
                            <option>Open</option>
                            <option>In progress</option>
                            <option>Closed</option>
                        </select>
                    </div>

                    <div class="field full">
                        <label for="message">Message *</label>
                        <textarea
                            id="message"
                            required
                            placeholder="Write the customer's question or message..."
                        ></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn" type="submit">Save enquiry</button>
                    <button class="btn secondary" type="reset" id="clear-enquiry">Clear</button>
                </div>
            </form>
        </section>

        <section class="panel">
            <div class="panel-head">
                <div>
                    <h2>Enquiry records</h2>
                    <p class="muted" id="enquiry-count">0 enquiries</p>
                </div>
            </div>

            <div class="toolbar">
                <input
                    class="search"
                    id="enquiry-search"
                    placeholder="Find customer, message or enquiry..."
                >

                <select class="search-filter" id="enquiry-filter">
                    <option value="all">All statuses</option>
                    <option>Open</option>
                    <option>In progress</option>
                    <option>Closed</option>
                </select>

                <button class="btn secondary" id="export-enquiries">Export CSV</button>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Vehicle</th>
                            <th>Date</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody id="enquiry-rows"></tbody>
                </table>
            </div>
        </section>

        <section class="panel">
            <div class="panel-head">
                <div>
                    <h2>Test-drive bookings</h2>
                    <p class="muted">Add and track requested test drives.</p>
                </div>
            </div>

            <form id="booking-form">
                <div class="form-grid">
                    <div class="field">
                        <label for="bookingCustomer">Customer *</label>
                        <select id="bookingCustomer" required>
                            <option value="">Select customer</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="bookingVehicle">Vehicle *</label>
                        <select id="bookingVehicle" required>
                            <option value="">Select vehicle</option>
                        </select>
                    </div>

                    <div class="field">
                        <label for="bookingDate">Date and time *</label>
                        <input id="bookingDate" type="datetime-local" required>
                    </div>

                    <div class="field">
                        <label for="bookingStatus">Status</label>
                        <select id="bookingStatus">
                            <option>Requested</option>
                            <option>Confirmed</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn" type="submit">Add booking</button>
                </div>
            </form>

            <div class="toolbar">
                <input
                    class="search"
                    id="booking-search"
                    placeholder="Find test-drive bookings..."
                >

                <select class="search-filter" id="booking-filter">
                    <option value="all">All bookings</option>
                    <option>Requested</option>
                    <option>Confirmed</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                </select>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Vehicle</th>
                            <th>Date and time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody id="booking-rows"></tbody>
                </table>
            </div>
        </section>
        `
    );

    const enquiryForm = document.getElementById('enquiry-form');


    // Get customer and vehicle names

    function customerName(id) {
        return Store.all('customers').find(c => c.id === Number(id))?.name || 'Customer not found';
    }

    function vehicleName(id) {
        const v = Store.all('vehicles').find(x => x.id === Number(id));

        return v ? `${v.make} ${v.model}` : '—';
    }


    // Fill customer and vehicle dropdowns

    function fillSelects(){
    document.getElementById('enquiryCustomer').innerHTML=
        '<option value="">Select customer</option>'+
        optionsFrom('customers','id',c=>c.name);

    document.getElementById('bookingCustomer').innerHTML=
        '<option value="">Select customer</option>'+
        optionsFrom('customers','id',c=>c.name);

    const allVehicles=Store.all('vehicles');

    const enquiryOptions=allVehicles.map(v=>
        `<option value="${v.id}">${esc(v.make)} ${esc(v.model)} (${esc(v.status)})</option>`
    ).join('');

    const availableVehicles=allVehicles.filter(v=>v.status==='Available');

    const bookingOptions=availableVehicles.map(v=>
        `<option value="${v.id}">${esc(v.make)} ${esc(v.model)}</option>`
    ).join('');

    document.getElementById('enquiryVehicle').innerHTML=
        '<option value="">No vehicle selected</option>'+enquiryOptions;

    document.getElementById('bookingVehicle').innerHTML=
        '<option value="">Select vehicle</option>'+bookingOptions;
}
       


    // Display enquiry records

    function renderEnquiries() {

        const q = document.getElementById('enquiry-search').value.toLowerCase();
        const filter = document.getElementById('enquiry-filter').value;

        const rows = Store.all('enquiries').filter(x =>
            [
                customerName(x.customerId),
                vehicleName(x.vehicleId),
                x.message,
                x.status
            ].join(' ').toLowerCase().includes(q) &&
            (filter === 'all' || x.status === filter)
        );

        document.getElementById('enquiry-count').textContent =
            `${rows.length} enquir${rows.length === 1 ? 'y' : 'ies'}`;

        document.getElementById('enquiry-rows').innerHTML = rows.length
            ? rows.map(x => `
                <tr>
                    <td>${x.id}</td>
                    <td>${esc(customerName(x.customerId))}</td>
                    <td>${esc(vehicleName(x.vehicleId))}</td>
                    <td>${esc((x.enquiryDate || '').replace('T', ' '))}</td>
                    <td>${esc(x.message)}</td>
                    <td>
                        <span class="status ${x.status.toLowerCase().replace(' ', '-')}">
                            ${esc(x.status)}
                        </span>
                    </td>
                    <td>
                        <div class="actions">
                            <button class="small-btn" data-enquiry-edit="${x.id}">Edit</button>
                            <button class="small-btn" data-enquiry-delete="${x.id}">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : `<tr><td colspan="7" class="empty">No enquiries found.</td></tr>`;
    }


    // Display test-drive bookings

    function renderBookings() {

        const q = document.getElementById('booking-search').value.toLowerCase();
        const filter = document.getElementById('booking-filter').value;

        const rows = Store.all('bookings').filter(x =>
            [
                customerName(x.customerId),
                vehicleName(x.vehicleId),
                x.status,
                x.bookingDate
            ].join(' ').toLowerCase().includes(q) &&
            (filter === 'all' || x.status === filter)
        );

        document.getElementById('booking-rows').innerHTML = rows.length
            ? rows.map(x => `
                <tr>
                    <td>${x.id}</td>
                    <td>${esc(customerName(x.customerId))}</td>
                    <td>${esc(vehicleName(x.vehicleId))}</td>
                    <td>${esc((x.bookingDate || '').replace('T', ' '))}</td>
                    <td><span class="status">${esc(x.status)}</span></td>
                    <td>
                        <div class="actions">
                            <button class="small-btn" data-booking-status="${x.id}">Change status</button>
                            <button class="small-btn" data-booking-delete="${x.id}">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('')
            : `<tr><td colspan="6" class="empty">No test-drive bookings found.</td></tr>`;
    }


    // Clear enquiry form

    function clearEnquiry() {

        enquiryForm.reset();

        document.getElementById('enquiry-id').value = '';

        document.getElementById('enquiry-form-title').textContent =
            'Create customer enquiry';

        document.getElementById('enquiryDate').value = dateNow();
    }


    // Save enquiry

    enquiryForm.addEventListener('submit', e => {

        e.preventDefault();

        const id = document.getElementById('enquiry-id').value;

        const item = {
            id: id ? Number(id) : Store.nextId('enquiries', 'id'),
            customerId: Number(document.getElementById('enquiryCustomer').value),
            vehicleId: Number(document.getElementById('enquiryVehicle').value) || null,
            enquiryDate: document.getElementById('enquiryDate').value,
            message: document.getElementById('message').value.trim(),
            status: document.getElementById('enquiryStatus').value
        };

        if (
            !Store.all('customers').some(c => c.id === item.customerId) ||
            !item.message ||
            !item.enquiryDate
        ) {
            toast('Select a customer, date and enter a message.');
            return;
        }

        if (
            item.vehicleId &&
            !Store.all('vehicles').some(v => v.id === item.vehicleId)
        ) {
            toast('Choose a valid vehicle.');
            return;
        }

        Store.upsert('enquiries', 'id', item);

        clearEnquiry();
        renderEnquiries();

        toast(id ? 'Enquiry updated.' : 'Enquiry saved.');
    });


    // Search, filter and clear event listeners

    document.getElementById('clear-enquiry')
        .addEventListener('click', () => setTimeout(clearEnquiry, 0));

    document.getElementById('enquiry-search')
        .addEventListener('input', renderEnquiries);

    document.getElementById('booking-search')
        .addEventListener('input', renderBookings);

    document.getElementById('enquiry-filter')
        .addEventListener('change', renderEnquiries);

    document.getElementById('booking-filter')
        .addEventListener('change', renderBookings);


    // Edit and delete enquiry records

    document.getElementById('enquiry-rows').addEventListener('click', e => {

        const edit = e.target.dataset.enquiryEdit;
        const del = e.target.dataset.enquiryDelete;

        if (edit) {

            const x = Store.all('enquiries').find(v => v.id === Number(edit));

            if (!x) return;

            document.getElementById('enquiry-id').value = x.id;
            document.getElementById('enquiryCustomer').value = x.customerId;
            document.getElementById('enquiryVehicle').value = x.vehicleId || '';
            document.getElementById('enquiryDate').value = x.enquiryDate;
            document.getElementById('message').value = x.message;
            document.getElementById('enquiryStatus').value = x.status;

            document.getElementById('enquiry-form-title').textContent =
                'Edit enquiry';

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        if (del && confirm('Delete this enquiry?')) {

            Store.remove('enquiries', 'id', del);

            renderEnquiries();

            toast('Enquiry deleted.');
        }
    });


    // Add test-drive booking

    document.getElementById('booking-form').addEventListener('submit', e => {

        e.preventDefault();

        const item = {
            id: Store.nextId('bookings', 'id'),
            customerId: Number(document.getElementById('bookingCustomer').value),
            vehicleId: Number(document.getElementById('bookingVehicle').value),
            bookingDate: document.getElementById('bookingDate').value,
            status: document.getElementById('bookingStatus').value
        };

        if (
            !item.customerId ||
            !item.vehicleId ||
            !item.bookingDate ||
            !Store.all('customers').some(c => c.id === item.customerId) ||
            !Store.all('vehicles').some(v => v.id === item.vehicleId)
        ) {
            toast('Select a valid customer, vehicle and booking date.');
            return;
        }

        Store.upsert('bookings', 'id', item);

        e.target.reset();

        document.getElementById('bookingDate').value = dateNow();

        renderBookings();

        toast('Test-drive booking added.');
    });


    // Change booking status and delete bookings

    document.getElementById('booking-rows').addEventListener('click', e => {

        const status = e.target.dataset.bookingStatus;
        const del = e.target.dataset.bookingDelete;

        if (status) {

            const x = Store.all('bookings').find(v => v.id === Number(status));

            if (!x) return;

            const choices = [
                'Requested',
                'Confirmed',
                'Completed',
                'Cancelled'
            ];

            const next = choices[(choices.indexOf(x.status) + 1) % choices.length];

            x.status = next;

            Store.upsert('bookings', 'id', x);

            renderBookings();

            toast('Booking status: ' + next);
        }

        if (del && confirm('Delete this booking?')) {

            Store.remove('bookings', 'id', del);

            renderBookings();

            toast('Booking deleted.');
        }
    });


    // Export enquiries to CSV

    document.getElementById('export-enquiries').addEventListener('click', () => {

        const rows = Store.all('enquiries');

        const csv = [
            'EnquiryID,CustomerID,VehicleID,EnquiryDate,Message,Status',

            ...rows.map(x => [
                x.id,
                x.customerId,
                x.vehicleId || '',
                x.enquiryDate,
                x.message,
                x.status
            ].map(v =>
                '"' + String(v ?? '').replace(/"/g, '""') + '"'
            ).join(','))
        ].join('\n');

        const a = document.createElement('a');

        a.href = URL.createObjectURL(
            new Blob([csv], { type: 'text/csv' })
        );

        a.download = 'enquiries.csv';

        a.click();

        URL.revokeObjectURL(a.href);
    });


    // Initialize Customer Service module

    fillSelects();

    document.getElementById('enquiryDate').value = dateNow();

    document.getElementById('bookingDate').value = dateNow();

    renderEnquiries();

    renderBookings();

}
