function login_setup(opts) {
    const {
        server,
        submit_text = "Log in",
        success = console.log,
        error = m => { alert(m.message); },
    } = opts;

    localStorage.removeItem('token');

    const url = new URL(location);

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

    async function sha(str, size = 256) {
        if (![1, 256, 384, 512].includes(size)) throw new Error(`sha: algorithm SHA-${size} not supported.`);

        const hb = await crypto.subtle.digest('SHA-' + size, new TextEncoder().encode(str));
        return Array.from(new Uint8Array(hb)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    form.onsubmit = async function (e) {
        e.preventDefault();

        return fetch(server + '/login', {
            method: "POST",
            body: JSON.stringify({
                email: email.value,
                password: pass.value,
            }),
            headers: {
                'content-type': 'application/json'
            },
        })
            .catch(r => {
                error({
                    type: 'error',
                    title: "This should NOT be happening!",
                    message: r,
                });

                throw new Error(r);
            })
            .then(async r => ({
                status: r.status,
                response: await r.json()
            }))
            .then(r => {
                switch (r.status) {
                    case 200: {
                        let rd;
                        localStorage.setItem("token", r.response.token);

                        if (url.searchParams.get('popup') === "true")
                            window.close();

                        else if (rd = url.searchParams.get('auth-redirect'))
                            window.location = decodeURIComponent(rd);

                        else {
                            success({
                                type: 'success',
                                title: "Logged in"
                            });
                        }

                        break;
                    }

                    case 400: {
                        error({
                            type: 'error',
                            title: "Bad Request",
                            message: r?.response?.details?.errors?.[0]?.detail || "An unknown error occurred"
                        });

                        console.error(r.response);

                        break;
                    }

                    case 401: {
                        error({
                            type: 'error',
                            title: "Unauthorized",
                            message: r?.response?.details?.errors?.[0]?.detail || "An unknown error occurred"
                        });

                        console.error(r.response);

                        break;
                    }

                    default: {
                        error({
                            type: 'error',
                            title: "Server Error!",
                            message: r?.response?.details?.errors?.[0]?.detail || "An unknown error occurred"
                        });

                        console.error(r.response);

                        break;
                    }
                }
            });
    };

    return form;
};