// Talks to Supabase Auth's recovery flow. The redirect from /recover puts the
// recovery token in the URL fragment (#access_token=...&type=recovery), which
// is what decides between asking for an email and asking for a new password.
import { recover } from './supabase.js';

import {
	token,
	type,
	reset_password_form,
	status,
} from './password-form.js';

function request() {
	const url = new URL(location);
	const email = url.searchParams.get('email');

	document.querySelector('#reset-password').remove();
	document.querySelector('#reset-password-request').style.display = 'block';
	document.querySelector('#reset-password-request form').onsubmit = function(e) {
		e.preventDefault();

		const ei = this.querySelector('[name=email]');
		ei.setAttribute('disabled', '');

		const bi = this.querySelector('[type=submit]');
		bi.setAttribute('disabled', '');

		recover(ei.value).then(r => status.call(this, r));
	};

	if (email) {
		document.querySelector('[name=email]').value = email;

		document.querySelector('#message').innerText = "We will send you an email to reset your password";
		document.querySelector('#reset-password-request').querySelector('input').setAttribute('disabled', '');
	}
};

if (token && type === 'recovery') reset_password_form();
else request();
