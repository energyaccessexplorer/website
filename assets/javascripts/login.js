import {
	signin,
	signout,
	error_message,
} from './supabase.js';

// The login page is also the logout target: arriving here ends whatever
// session the browser still holds, then asks for credentials again.
export default function login_setup(opts = {}) {
	const {
		submit_text = "Log in",
		success = _ => null,
		error = m => { alert(m.message); },
	} = opts;

	const url = new URL(location);

	signout();

	const form = document.createElement('form');
	form.setAttribute('autocomplete', 'off');

	const email = document.createElement('input');
	email.setAttribute('type', 'email');
	email.setAttribute('name', 'email');
	email.setAttribute('placeholder', 'email');
	email.setAttribute('autofocus', '');
	email.setAttribute('required', '');

	const pass = document.createElement('input');
	pass.setAttribute('type', 'password');
	pass.setAttribute('name', 'pass');
	pass.setAttribute('placeholder', 'password');
	pass.setAttribute('required', '');

	const submit = document.createElement('button');
	submit.setAttribute('type', 'submit');
	submit.innerText = submit_text;

	form.append(email, pass, submit);

	form.onsubmit = async function(e) {
		e.preventDefault();

		email.setAttribute('disabled', '');
		pass.setAttribute('disabled', '');
		submit.setAttribute('disabled', '');

		const r = await signin(email.value, pass.value);

		if (!r.ok)
			error({
				"type":    'error',
				"title":   "Unauthorized",
				"message": error_message(r),
			});

		else if (url.searchParams.get('popup') === "true")
			window.close();

		else if (url.searchParams.get('auth-redirect'))
			window.location = decodeURIComponent(url.searchParams.get('auth-redirect'));

		else
			success({
				"type":  'success',
				"title": "Logged in",
			});

		email.removeAttribute('disabled');
		pass.removeAttribute('disabled');
		submit.removeAttribute('disabled');
	};

	return form;
};
