# Energy Access Explorer Website

This repository contains a very traditional template/view way of building our
website.

Some of the stylesheets in this repository are used by the
[tool](https://github.com/energyaccessexplorer/tool).

## Requirements

This project uses [Mustache](https://mustache.github.io/) templates, Go, and BSDmake. 

- **Mustache**: You can use any Mustache implementation you prefer. A small utility written in Go is provided. If you already have Go installed, proceed to the next section.
- **Nginx**: Ensure Nginx is installed and running on your system.

## Installation

### Configuring Nginx

After installing Nginx, configure your server with the following settings:

```nginx
server {
    listen 80;
    server_name eae.localhost eae.linux;

    # Static files for the website
    location / {
        alias /var/www/website/dist;
        add_header Access-Control-Allow-Origin '*';
    }

    # API backend
    location /api/ {
        proxy_pass http://unix:/tmp/postgrest-ea.sock:/;
    }

    # Tool backend
    location /tool/ {
        rewrite ^/tool/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8740;
    }

    # Tool frontend assets with caching disabled
    location ~ /tool/([a-z])/main\.(js|css) {
        rewrite ^/tool/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8740;
        add_header Cache-Control "no-cache";
        expires -1;
    }

    # Admin panel
    location /admin {
        alias /var/www/admin/dist;
        add_header Cache-Control "no-cache";
    }

    # Paver service
    location /paver/ {
        rewrite ^/paver/(.*) /$1 break;
        proxy_pass http://unix:/tmp/paver-server.sock:/;

        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Notes
- Ensure the directories `/var/www/website/dist` and `/var/www/admin/dist` exist and contain the respective static files.

### Testing Your Configuration
After applying the configuration, reload or restart Nginx to apply the changes:

```bash
sudo nginx -t  # Test the configuration for errors
sudo systemctl reload nginx  # Reload Nginx to apply the configuration
```

## Building & Hacking

Once you have the requirements installed, edit the variables in the `.env` file
and run: (`bmake` in Linux)

	$ make build start

**Important:** Do not add images/binary files to this repository. (no non-code, ok?)

## License

This project is licensed under MIT. Additionally, you must read the
[attribution page](https://www.energyaccessexplorer.org/attribution)
before using any part of this project.
