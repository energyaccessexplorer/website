# WEBSITE_PORT = 8000
#
# WEBSITE_SSH_USER = username
# WEBSITE_SSH_SERVER = example.org
# WEBSITE_DEST = /srv/http/example
#
# or ...
#
.include <env.mk>

build: mustache
	@printf "%s" ${WEBSITE_S3BUCKET} > templates/s3bucket.mustache
	@./build

start: build deps
	httpserver --port ${WEBSITE_PORT} --dir dist

mustache:
	go build -o mustache mustache.go

deps:
	DEST=assets/lib ./deps

sync:
	rsync -OPrv \
		--checksum \
		--delete-before \
		./dist/ \
		${WEBSITE_SSH_USER}@${WEBSITE_HOST}:${WEBSITE_DEST}

deploy: build sync

.PHONY: build deps
