(function() {
	const mailing = "aHR0cHM6Ly9tYWlsaW5nLmNoZXN0bnV0LnZpc2lvbg==";
	const world = "https://world.energyaccessexplorer.org";

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
		n: "company",
		h: "Organization",
		t: "text",
		r: true
	}, {
		n: "job_title",
		h: "Job Title",
		t: "text",
		r: false
	}, {
		n: "area_of_interest",
		h: "Area of Interest",
		t: "text",
		o: ["Strategic Energy Planning", "Market Identification", "Investment for Impact", "Other"],
		r: true
	}, {
		n: "city",
		h: "City",
		t: "text",
		r: false
		// }, {
		//   n: "country",
		//   h: "Country",
		//   t: "text",
		//   r: true
	}];

	const form = document.querySelector('form');

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

	const data = {
		list_id: '2defa3ad-5193-48ae-b186-dd1446cdca5b',
		settings: {},
		jsondata: {},
	};

	fetch(atob(mailing) + '/token')
		.then(r => r.text())
		.then(x => data['cfs'] = x);

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

		for (const i of form.querySelectorAll('input,button'))
			i.setAttribute('disabled', '');

		data['email'] = form.querySelector(`input[name=email]`).value;

		for (const f of fields) {
			let g = 'jsondata'

			if (f.n === 'email') continue;
			else if (f.n === 'area_of_interest') g = 'settings';

			data[g][f.n] = form.querySelector(`input[name=${f.n}]`).value;
		}

		fetch(mailing + '/signup', {
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
			});
	};
})();
