(function() {
	if (typeof cookieNoticeJS === 'undefined') return;

	if (location.hostname.match('localhost')) return;

	new cookieNoticeJS({
		'messageLocales': {
			'en': "This website uses cookies to provide you with an improved user experience. By continuing to browse this site, you consent to the use of cookies and similar technologies. For further details please visit our"
		},
		'buttonLocales': {
			'en': "OK"
		},
		'learnMoreLinkText':{
			'en': 'privacy policy.'
		},
		'learnMoreLinkEnabled': true,
		'learnMoreLinkHref': '/privacy-policy',
		'cookieNoticePosition': 'bottom',
		'expiresIn': 30,
		'buttonBgColor': '#f0ab00',
		'buttonTextColor': '#131313',
		'noticeBgColor': '#000000',
		'noticeTextColor': '#ffffff',
		'linkColor': '#e3810a',
		'linkTarget': '_blank',
		'debug': false
	});
})();
