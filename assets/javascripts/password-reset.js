const url = new URL(location);

const uuid = url.searchParams.get('uuid');
const world = "eae";

const s = atob("aHR0cHM6Ly9ub29wLm51L2F1dGg=");

function status(r) {
	if (r.ok)
		this.parentElement.querySelector('p.status').style.display = '';
	else
		this.parentElement.querySelector('p.error').style.display = '';

	this.remove();
};

function request() {
	const email = url.searchParams.get('email');

	document.querySelector('#reset-password').remove();
	document.querySelector('#reset-password-request').style.display = 'block';
	document.querySelector('#reset-password-request form').onsubmit = function(e) {
		e.preventDefault();

		const ei = this.querySelector('[name=email]');
		ei.setAttribute('disabled', '');

		const bi = this.querySelector('[type=submit]');
		bi.setAttribute('disabled', '');

		fetch(`${s}/password-reset`, {
			"method": "POST",
			"headers": { "Accept": "application/json", "Content-Type": "application/json" },
			"body": JSON.stringify({
				world,
				"email": ei.value,
			})
		}).then(r => status.call(this, r));
	};

	if (email) {
		document.querySelector('[name=email]').value = email;

		document.querySelector('#message').innerText = "We will send you an email to reset your password";
		document.querySelector('#reset-password-request').querySelector('input').setAttribute('disabled', '');
	}
};

async function sha256(message) {
	return Array.from(new Uint8Array((await crypto.subtle.digest("SHA-256", (new TextEncoder().encode(message)))))).map((b) => b.toString(16).padStart(2, "0")).join("");
};

function reset() {
	document.querySelector('#reset-password-request')?.remove();

	document.querySelector('#reset-password').style.display = 'block';
	document.querySelector('#reset-password form').onsubmit = async function(e) {
		e.preventDefault();

		const pi = this.querySelector('[name=password]');
		pi.setAttribute('disabled', '');

		const ci = this.querySelector('[name=password_confirmation]');
		ci.setAttribute('disabled', '');

		const bi = this.querySelector('[type=submit]');
		bi.setAttribute('disabled', '');

		fetch(`${s}/password-reset`, {
			"method": "PATCH",
			"headers": { "Accept": "application/json", "Content-Type": "application/json" },
			"body": JSON.stringify({
				uuid, world,
				"password": (await sha256(pi.value)),
				"password_confirmation": (await sha256(ci.value)),
			})
		}).then(r => status.call(this, r));
	};
};

if (uuid) reset();
else request();
