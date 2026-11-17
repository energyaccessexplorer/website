// Supabase Auth over REST. There is no npm dependency graph here, so this
// module is the only place that knows GoTrue's endpoint shapes and the
// localStorage keys the tool reads the session back from.

const BASE = window.SUPABASE.url;
const KEY = window.SUPABASE.key;

export const ACCESS_KEY = 'token';
export const REFRESH_KEY = 'refresh_token';

let pending = null;

export function headers(token) {
	const h = {
		"apikey":       KEY,
		"Content-Type": 'application/json',
	};

	if (token) h['Authorization'] = `Bearer ${token}`;

	return h;
};

export function call(path, options = {}) {
	const {method = 'POST', body, token} = options;

	return fetch(`${BASE}/auth/v1${path}`, {
		"method":  method,
		"headers": headers(token),
		"body":    (body === undefined) ? undefined : JSON.stringify(body),
	})
		.then(async r => ({
			"ok":     r.ok,
			"status": r.status,
			"body":   await r.json().catch(_ => ({})),
		}))
		.catch(err => ({
			"ok":     false,
			"status": 0,
			"body":   { "message": String(err) },
		}));
};

export function error_message(r) {
	const b = r.body || {};

	return b.msg || b.error_description || b.message || b.error || `Status code: ${r.status}`;
};

export function store(session) {
	if (session.access_token) localStorage.setItem(ACCESS_KEY, session.access_token);
	if (session.refresh_token) localStorage.setItem(REFRESH_KEY, session.refresh_token);
};

export function clear() {
	localStorage.removeItem(ACCESS_KEY);
	localStorage.removeItem(REFRESH_KEY);
	window.dispatchEvent(new Event('session-cleared'));
};

export function signin(email, password) {
	return call('/token?grant_type=password', { "body": { email, password } })
		.then(r => {
			if (r.ok) store(r.body);

			return r;
		});
};

// GoTrue rotates the refresh token on use, so concurrent grants have to share
// one request: the second would present a token the first already spent.
export function renew() {
	const rt = localStorage.getItem(REFRESH_KEY);

	if (!rt) return Promise.resolve({ "ok": false, "status": 0, "body": {} });

	if (!pending)
		pending = call('/token?grant_type=refresh_token', { "body": { "refresh_token": rt } })
			.then(r => {
				if (r.ok) store(r.body);
				else clear();

				return r;
			})
			.finally(_ => { pending = null; });

	return pending;
};

export function signout() {
	const t = localStorage.getItem(ACCESS_KEY);

	clear();

	if (!t) return Promise.resolve(null);

	return call('/logout', { "token": t });
};

// The site may be served under a prefix (previews, worktrees), so the root is
// derived from the page's own path rather than assumed.
export function site_root() {
	return location.origin + location.pathname.replace(/[^/]*\/*$/, '');
};

export function signup(email, password, data) {
	const to = encodeURIComponent(site_root() + 'email-confirmation/');

	return call(`/signup?redirect_to=${to}`, { "body": { email, password, data } });
};

export function recover(email) {
	const to = encodeURIComponent(location.href.split(/[?#]/)[0]);

	return call(`/recover?redirect_to=${to}`, { "body": { email } });
};

export function set_password(token, password) {
	return call('/user', { "method": 'PUT', "body": { password }, token });
};
