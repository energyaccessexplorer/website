# Energy Access Explorer Website

This repository contains a very traditional template/view way of building our
website.

Some of the stylesheets in this repository are used by the
[tool](https://github.com/energyaccessexplorer/tool).

## Building & Hacking

We use [mustache](https://mustache.github.io/) templates, Go and BSDmake.
Once you have these installed, edit the variables in the `.env` file and
run: (`bmake` for Linux)

	$ make build start

**Important:** Do not add images/binary files to this repository. (no non-code, ok?)

## License

This project is licensed under MIT. Additionally, you must read the
[attribution page](https://www.energyaccessexplorer.org/attribution)
before using any part of this project.
