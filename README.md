# Energy Access Explorer Website

The `build` script renders the mustache templates/views registered in
`routes.tsv` into `dist/<view>/index.html`. Then, it copies the contents of
`assets` into `dist`.

The `deps` script fetches the third-party files registered in `dependencies.tsv`
into `dist/lib` directory.

**Note:** Do not add images/binary files to this repository. (no non-code, ok?)

## License

This project is licensed under MIT. Additionally, please read the
[attribution page](https://www.energyaccessexplorer.org/attribution)
before using any part of this project.
