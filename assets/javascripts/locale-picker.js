(function() {
	'use strict';

	const SUPPORTED = {
		'en': 'English',
		'fr': 'Français',
		'zh': '中文',
	};

	const STORAGE_KEY = 'locale';

	// Which locales each environment offers (EAE-515/EAE-516): the French
	// translations go live in every environment, the Simplified Chinese ones
	// only in protected so far. The website has no window.ENV (it is mustache,
	// not the tool), so the subdomain is the only environment signal.
	const ENV_LOCALES = {
		'public':    ['en', 'fr'],
		'protected': ['en', 'fr', 'zh'],
		'training':  ['en', 'fr'],
		'test':      ['en', 'fr', 'zh'],
		'dev':       ['en', 'fr', 'zh'],
	};

	function env() {
		// The site is served as <env>.energyaccessexplorer.org, so the first label
		// is the environment; www and the bare apex (plus localhost) are public.
		const parts = location.hostname.split('.');
		return parts.length < 3 || parts[0] === 'www' ? 'public' : parts[0];
	}

	function available() {
		const allowed = new Set(ENV_LOCALES[env()] ?? ['en']);

		// ?lang= stays an explicit escape hatch: translators and ticket previews
		// use it on hosts where the locale is not deployed.
		const override = normalizeLocale(new URLSearchParams(location.search).get('lang'));
		if (override) allowed.add(override);

		return allowed;
	}

	function gated() {
		return new URLSearchParams(location.search).has('lang')
			|| available().size > 1
			|| !!localStorage.getItem(STORAGE_KEY);
	}

	let booted = false;
	let applyLocaleFn = null;

	function loadTransifex() {
		window.liveSettings = {
			api_key: "e0fbb2a78c9b473f8c265e3bb1ca1a29",
			staging: location.hostname.startsWith('protected.') || location.hostname.startsWith('test.') || !!location.hostname.match(/localhost/),
			picker: false,
		};

		const txScript = document.createElement('script');
		txScript.async = true;
		txScript.type = "text/javascript";
		txScript.src = "//cdn.transifex.com/live.js";
		document.head.append(txScript);
	}

	function normalizeLocale(code) {
		if (!code) return null;
		const base = code.toLowerCase().split('-')[0].split('_')[0];
		return SUPPORTED[base] ? base : null;
	}

	function detectLocale() {
		const params = new URLSearchParams(location.search);
		const allowed = available();

		return [
			normalizeLocale(params.get('lang')),
			normalizeLocale(localStorage.getItem(STORAGE_KEY)),
			normalizeLocale(navigator.language),
		].find(l => l && allowed.has(l)) || 'en';
	}

	function transifexReady() {
		if (typeof window.Transifex === 'undefined' || !window.Transifex.live) return false;
		const live = window.Transifex.live;
		if (typeof live.getAllLanguages !== 'function') return false;
		return (live.getAllLanguages() || []).length > 0;
	}

	function withTransifex(callback, attempts = 100) {
		if (transifexReady()) {
			callback(window.Transifex.live);
			return;
		}
		if (attempts <= 0) return;
		setTimeout(() => withTransifex(callback, attempts - 1), 100);
	}

	function buildTransifexMapping(live) {
		const languages = live.getAllLanguages() || [];
		const map = {};

		const allowed = available();

		for (const code of Object.keys(SUPPORTED)) {
			if (!allowed.has(code)) continue;
			const match = languages.find(l =>
				l.code === code
				|| l.code.toLowerCase() === code
				|| l.code.toLowerCase().startsWith(code + '_')
				|| l.code.toLowerCase().startsWith(code + '-')
			);
			if (match) map[code] = match.code;
		}

		return map;
	}

	function renderPicker(current, onSelect) {
		const nav = document.querySelector('nav');
		if (!nav) return;

		let picker = document.getElementById('locale-picker');
		if (picker) picker.remove();

		picker = document.createElement('div');
		picker.id = 'locale-picker';

		const currentSpan = document.createElement('span');
		currentSpan.id = 'locale-current';
		currentSpan.textContent = current.toUpperCase();

		const dropdown = document.createElement('div');
		dropdown.id = 'locale-dropdown';

		const allowed = available();

		for (const [code, label] of Object.entries(SUPPORTED)) {
			if (!allowed.has(code) && code !== current) continue;

			const item = document.createElement('a');
			item.href = '#';
			item.textContent = label;
			item.dataset.locale = code;
			if (code === current) item.classList.add('active');
			item.onclick = e => {
				e.preventDefault();
				onSelect(code);
			};
			dropdown.append(item);
		}

		picker.append(currentSpan, dropdown);
		nav.append(picker);
	}

	function updatePicker(current) {
		const currentSpan = document.getElementById('locale-current');
		if (currentSpan) currentSpan.textContent = current.toUpperCase();

		document.querySelectorAll('#locale-dropdown a').forEach(a => {
			a.classList.toggle('active', a.dataset.locale === current);
		});
	}

	function boot(initial) {
		if (booted) return;
		booted = true;

		loadTransifex();

		let txMapping = {};

		function applyLocale(code) {
			const normalized = normalizeLocale(code) || 'en';
			window.LOCALE = normalized;
			localStorage.setItem(STORAGE_KEY, normalized);
			updatePicker(normalized);

			withTransifex(live => {
				const txCode = txMapping[normalized];
				if (txCode && live.translateTo) {
					live.translateTo(txCode);
				}
			});
		}

		applyLocaleFn = applyLocale;

		renderPicker(initial, applyLocale);
		applyLocale(initial);

		withTransifex(live => {
			txMapping = buildTransifexMapping(live);

			const txCode = txMapping[normalizeLocale(window.LOCALE) || 'en'];
			if (txCode && live.translateTo) {
				live.translateTo(txCode);
			}
		});
	}

	function init() {
		if (gated()) boot(detectLocale());

		window.addEventListener('storage', e => {
			if (e.key !== STORAGE_KEY || !e.newValue) return;

			const code = normalizeLocale(e.newValue);
			if (!code || !available().has(code)) return;

			if (booted) applyLocaleFn(code);
			else boot(code);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
