const c = document.querySelector('nav #navigation-links');
const m = document.createElement('a');

m.className = "toggleable";
m.id = "my-eae";

let d = "";

if (localStorage['token']) {
	m.href = window.BASE + '/tool/m';

	const s = document.createElement('span');
	s.innerText = 'My EAE';
	s.dataset.t = 'nav.my_eae';
	m.append(s);

	d = document.createElement('div');
	d.id = 'my-eae-dropdown';

	e = document.createElement('a');
	e.href = window.BASE + '/tool/m';
	e.innerText = 'Dashboard';
	e.dataset.t = 'nav.dashboard';

	o = document.createElement('a');
	o.innerText = "Log Out";
	o.href = window.BASE + '/login';
	o.dataset.t = 'nav.logout';

	d.append(e, o);
	m.append(d);
} else {
	m.href = window.BASE + '/login';
	m.innerText = 'Login';
	m.dataset.t = 'nav.login';
}

c.append(m);

(function() {
	const links = document.querySelectorAll('nav #navigation-links a');

	if (!links) return;

	for (var l of links) {
		if (location.pathname.match(new RegExp(l.getAttribute('href').split('/')[1])))
			l.classList.add("active");
	}
})();
