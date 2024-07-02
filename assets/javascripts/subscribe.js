import selectlist from "/tool/lib/selectlist.js";
import modal from "/lib/modal.js";


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
		n: "gender",
		h: "Gender",
		t: "select",
		o: ["Female", "Male", "Other", "Prefer not to answer"],
		r: false
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
		let i;

		switch (f.t) {
		case 'select': {
			i = document.createElement('select')

			const s = document.createElement('option');
			s.setAttribute('disabled', '');
			s.setAttribute('selected', '');
			s.innerText = f.h;
			i.append(s)

			for (const o of f.o) {
				const e = document.createElement('option');
				e.value = o;
				e.innerText = o;

				i.append(e)
			}

			break;
		}

		default:
			i = document.createElement('input');
			i.type = f.t;

			if (f.o?.length) {
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

			break;
		}

		i.name = f.n;
		i.placeholder = f.h;

		if (f.r) i.setAttribute('required', '');

		form.append(i);
	}

	const typeselect = document.createElement('select');
	typeselect.setAttribute('name', 'subscribe-type');

	const typeoptions = {
		"": "Select a registration type",
		"both": "User account and Mailing list",
		"mailing": "Mailing list",
		"account": "User account",
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
			});
	};

	document.querySelector('main section').append(form);
})();
