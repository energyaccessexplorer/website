const c = document.querySelector('nav #navigation-links');
const m = document.createElement('a');

m.className = "toggleable";
m.id = "my-eae";

// The login page is the logout target: it clears the session after this
// script has rendered, so the label follows the session rather than the
// localStorage it had at load time.
function render() {
	m.replaceChildren();
	m.removeAttribute('href');

	if (localStorage['token']) {
		m.href = window.BASE + '/tool/m';

		const s = document.createElement('span');
		s.innerText = 'My EAE';
		s.dataset.t = 'nav.my_eae';
		m.append(s);

		const d = document.createElement('div');
		d.id = 'my-eae-dropdown';

		const dashboard = document.createElement('a');
		dashboard.href = window.BASE + '/tool/m';
		dashboard.innerText = 'Dashboard';
		dashboard.dataset.t = 'nav.dashboard';

		const logout = document.createElement('a');
		logout.innerText = "Log Out";
		logout.href = window.BASE + '/login';
		logout.dataset.t = 'nav.logout';

		d.append(dashboard, logout);
		m.append(d);
	} else {
		m.href = window.BASE + '/login';
		m.innerText = 'Login';
		m.dataset.t = 'nav.login';
	}
}

render();

window.addEventListener('session-cleared', render);

c.append(m);

(function() {
	const links = document.querySelectorAll('nav #navigation-links a');

	if (!links) return;

	for (var l of links) {
		if (location.pathname.match(new RegExp(l.getAttribute('href').split('/')[1])))
			l.classList.add("active");
	}
})();
