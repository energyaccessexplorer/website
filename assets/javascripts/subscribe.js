import selectlist from "/tool/lib/selectlist.js";
import modal from "/lib/modal.js";

function show_pass(str) {
	const d = document.createElement('div');
	const p = document.createElement('p');
	const pre = document.createElement('pre');

	const p1 = document.createElement('p');
	const login = document.createElement('a');

	pre.style = `
font-size: 3em;
margin: auto;
background-color: #eee;
text-align: center;
padding: 20px;
`;

	pre.innerHTML = str;

	p.innerText = "Please save your store your password safely. You will need it to log in into MyEAE.";

	login.href = "/login";
	login.innerText = "Go to login";

	p1.style = `
margin: 1em;
text-align: right;
font-weight: bold;
font-size: 1.3em;
`;

	p1.append(login);

	d.append(p, pre, p1);

	const m = new modal({
		"header": "Save your password",
		"content": d,
	});

	m.show();
};

(async function() {
	const mailing = "aHR0cHM6Ly9ub29wLm51L2JvdW5jZXI=";
	const world = "https://world.energyaccessexplorer.org";
	const url = new URL(location);

	const fields = [{
		n: "first_name",
		h: "First Name",
		t: "text",
		r: true
	}, {
		n: "last_name",
		h: "Last Name",
		t: "text",
		r: true
	}, {
		n: "email",
		h: "Email",
		t: "email",
		r: true
	}, {
		n: "organization",
		h: "Organization",
		t: "text",
		r: true
	}, {
		n: "job_title",
		h: "Job Title",
		t: "text",
		r: false
	}, {
		n: "areas_of_interest",
		h: "Areas of Interest",
		t: "text",
		o: ["Strategic Energy Planning", "Market Intelligence", "Investment for Impact", "Education", "Health", "Agriculture", "Clean Cooking", "Other"],
		r: true
	}, {
		n: "city",
		h: "City",
		t: "text",
		r: false
	}];

	const data = {
		list_id: '2defa3ad-5193-48ae-b186-dd1446cdca5b',
		settings: {},
		jsondata: {},
	};

	function tokenfail() {
		const m = document.querySelector("main section");
		const p = document.createElement("p");
		p.className = "error";

		p.innerText = "Something went wrong with our setup. Could you come back later, please?";
		m.append(p);
	};

	const token = await fetch(atob(mailing) + '/token')
		.catch(e => tokenfail)
		.then(r => {
			if (!r.ok) {
				tokenfail();
				throw "Failed to get token."
			}

			return r;
		})
		.then(r => r.text())
		.then(x => data['cfs'] = x);

	const form = document.createElement('form');

	for (const f of fields) {
		const i = document.createElement('input');
		i.name = f.n;
		i.type = f.t;
		i.placeholder = f.h;

		if (f.r) i.setAttribute('required', '');

		if (f.o) {
			i.setAttribute('list', 'datalist-' + f.n);
			i.setAttribute('autocomplete', 'off');

			const list = document.createElement('datalist');
			list.id = 'datalist-' + f.n;

			for (const o of f.o) {
				const e = document.createElement('option');
				e.value = o;
				e.innerText = o;

				list.append(e)
			}

			document.body.append(list);
		}

		form.append(i);
	}

	const typeselect = document.createElement('select');
	typeselect.setAttribute('name', 'subscribe-type');

	const typeoptions = {
		"": "Select a registration type",
		"mailing": "Mailing list",
		"account": "User account",
		"both": "User account and Mailing list",
	};

	const os = Object.keys(typeoptions).map(k => {
		const o = document.createElement('option')
		o.innerText = typeoptions[k];
		o.setAttribute('value', k);

		return o;
	});

	os[0].setAttribute('disabled', '');
	os[0].setAttribute('selected', '');

	typeselect.append(...os);
	typeselect.setAttribute('required', '');

	const sel = url.searchParams.get('select');
	if (typeoptions[sel]) typeselect.value = sel;

	form.prepend(typeselect);

	fetch(world + '/countries?select=name')
		.then(r => r.json())
		.then(countries => {
			const dict = [];
			for (const c of countries) {
				const n = c['name'];
				dict[n] = n;
			}

			const csl = new selectlist(`countries-select`, dict);
			csl.input.setAttribute('name', 'country');
			csl.input.setAttribute('placeholder', 'Country');
			csl.input.setAttribute('required', '');

			form.append(csl.el);
		})
		.then(_ => {
			const submit = document.createElement('button');
			submit.type = 'submit';
			submit.innerText = "Submit";

			form.append(submit);
		});

	form.onsubmit = function(e) {
		e.preventDefault();

		for (const i of form.querySelectorAll('input,button,select'))
			i.setAttribute('disabled', '');

		data['email'] = form.querySelector(`input[name=email]`).value;

		for (const f of fields) {
			const v = form.querySelector(`input[name=${f.n}]`).value;

			data['jsondata'][f.n] = v;

			if (f.n === 'areas_of_interest')
				data['settings'][f.n] = v;
		}

		data['jsondata']['country'] = form.querySelector(`input[name=country]`).value;

		data['jsondata']['account'] = ['both', 'account'].includes(typeselect.value);
		data['jsondata']['mailing'] = ['both', 'mailing'].includes(typeselect.value);

		if (data['jsondata']['account'])
			data['jsondata']['pass'] = crypto.randomUUID().slice(0,8);

		fetch(atob(mailing) + '/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8;'
			},
			body: JSON.stringify(data)
		})
			.then(async r => {
				const p = document.createElement('p');
				p.className = 'status';
				p.innerText = await r.text();
				document.querySelector('section').append(p);

				if (r.status < 400)
					p.className = 'status';
				else if (r.status < 500)
					p.className = 'warn';
				else
					p.className = 'error';

				if (r.ok && data['jsondata']['account'])
					show_pass(data['jsondata']['pass']);
			});
	};

	document.querySelector('main section').append(form);
})();
