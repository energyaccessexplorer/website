(function() {
	'use strict';

	const SUPPORTED = {
		'en': 'English',
		'fr': 'Français',
		'zh': '中文',
	};

	const MENU_HIDDEN = ['zh'];

	const STORAGE_KEY = 'locale';

	function gated() {
		return new URLSearchParams(location.search).has('lang')
			|| location.hostname.startsWith('protected.')
			|| !!localStorage.getItem(STORAGE_KEY);
	}

	if (!gated()) return;

	window.liveSettings = {
		api_key: "e0fbb2a78c9b473f8c265e3bb1ca1a29",
		staging: !!location.hostname.match(/localhost/),
		picker: false,
	};

	const txScript = document.createElement('script');
	txScript.async = true;
	txScript.type = "text/javascript";
	txScript.src = "//cdn.transifex.com/live.js";
	document.head.append(txScript);

	function normalizeLocale(code) {
		if (!code) return null;
		const base = code.toLowerCase().split('-')[0].split('_')[0];
		return SUPPORTED[base] ? base : null;
	}

	function detectLocale() {
		const params = new URLSearchParams(location.search);
		return normalizeLocale(params.get('lang'))
			|| normalizeLocale(localStorage.getItem(STORAGE_KEY))
			|| normalizeLocale(navigator.language)
			|| 'en';
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

		for (const code of Object.keys(SUPPORTED)) {
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

		for (const [code, label] of Object.entries(SUPPORTED)) {
			if (MENU_HIDDEN.includes(code) && code !== current) continue;

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

	function init() {
		const initial = detectLocale();
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

		withTransifex(live => {
			txMapping = buildTransifexMapping(live);
			applyLocale(initial);
		});

		renderPicker(initial, applyLocale);

		window.addEventListener('storage', e => {
			if (e.key === STORAGE_KEY && e.newValue) {
				applyLocale(e.newValue);
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
