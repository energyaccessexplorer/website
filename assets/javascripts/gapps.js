(function() {
  if (typeof localStorage === 'undefined') return;

  function ask() {
    const el = document.createElement('div');
    el.id = 'gapps-ask';

    el.innerHTML = `
This website uses <b>Google Analytics</b> and learn from its usage. Would you like to use them?
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<span id="gapps-buttons">
<button bind="opt-in" style="background-color: var(--the-green); color: var(--the-white);">Accept</button>
&nbsp;
<button bind="opt-out" style="background-color: var(--the-white); color: var(--the-green);">Opt Out</button>
<span>
`;

    const oin = el.querySelector('button[bind="opt-in"]');
    oin.addEventListener('mouseup', _ => {
      localStorage.setItem('wants_gapps', true);
      el.remove();
    });

    const oout = el.querySelector('button[bind="opt-out"]');
    oout.addEventListener('mouseup', _ => {
      localStorage.setItem('wants_gapps', false);
      el.remove();
    });

    document.body.appendChild(el);
  };

  function add() {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=UA-67196006-4";
    script.onload = _ => {
      const s = document.createElement('script');
      s.innerHTML = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-67196006-4');
`;
      document.head.appendChild(s);
    };

    document.head.appendChild(script);
  };

  let wants_gapps = localStorage.getItem('wants_gapps');

  switch (wants_gapps) {
  case "true":
    add();
    break;

  case "false":
    break;

  case null:
  default:
    ask();
    break;
  }
})();
