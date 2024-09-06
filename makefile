default: build

.include ".env"
# in .env
# WEBSITE_S3BUCKET = https://bucket.s3.amazonws.com/path
# WEBSITE_DEST = /var/www/path
# WEBSITE_PORT = 8000
# WEBSITE_HOST = example.org
# WEBSITE_SSH_USER = www
# WEBSITE_SSH_HOST = srv
# HTTP_SERVER = httpserver
#
BIN = ./bin
DIST = ./dist

.ifndef WEBSITE_DEST
.error "WEBSITE_DEST command is not defined. Hej då."
.endif

build: deps mustache
	@printf "%s" ${WEBSITE_S3BUCKET} > templates/s3bucket.mustache
	${BIN}/build

start:
	${HTTP_SERVER} --directory ${DIST} ${WEBSITE_PORT}

mustache:
	go get
	go build -o mustache mustache.go

deps:
	mkdir -p assets/lib/fonts
	DEST=assets/lib ${BIN}/deps

sync:
	rsync -OPrv \
		--checksum \
		--copy-links \
		--delete-before \
		${DIST}/ \
		${WEBSITE_SSH_USER}@${WEBSITE_HOST}:${WEBSITE_DEST}

deploy: build sync

.PHONY: build deps
