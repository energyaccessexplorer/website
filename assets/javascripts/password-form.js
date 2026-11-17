import { set_password } from './supabase.js';

// GoTrue delivers an established session in the URL fragment: after /verify
// (type=signup) and after /recover (type=recovery).
const hash = new URLSearchParams(location.hash.slice(1));

export const token = hash.get('access_token');
export const type = hash.get('type');

export function status(r) {
	if (r.ok)
		this.parentElement.querySelector('p.status').style.display = '';
	else
		this.parentElement.querySelector('p.error').style.display = '';

	this.remove();
};

export function reset_password_form() {
	document.querySelector('#reset-password-request')?.remove();

	const section = document.querySelector('#reset-password');
	section.style.display = 'block';

	section.querySelector('form').onsubmit = async function(e) {
		e.preventDefault();

		const pi = this.querySelector('[name=password]');
		const ci = this.querySelector('[name=password_confirmation]');

		if (pi.value !== ci.value) {
			this.parentElement.querySelector('p.error').style.display = '';
			return;
		}

		pi.setAttribute('disabled', '');
		ci.setAttribute('disabled', '');
		this.querySelector('[type=submit]').setAttribute('disabled', '');

		status.call(this, await set_password(token, pi.value));
	};
};
