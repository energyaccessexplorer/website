# Energy Access Explorer Website

This project runs a simple HTTP server (`mustache-server.go` written in Golang)
that renders mustache templates to generate the static HTML/CSS website.

The `build` script generates the different views registered in `routes.tsv` and
the the contents of `assets` into a `dist` directory ready for deployment.

**Note:** Do not add images and the sorts to this repository (no non-code).
