default: build

.include ".env"
# in .env
# WEBSITE_S3BUCKET = https://bucket.s3.amazonws.com/path
# WEBSITE_DEST = /var/www/path
# SSH_USER = www
# SSH_HOST = srv.example.org
#
BIN = ./bin
DIST = ./dist

.ifndef WEBSITE_S3BUCKET
.error "WEBSITE_S3BUCKET command is not defined. Hej då."
.endif

.ifndef WEBSITE_DEST
.error "WEBSITE_DEST command is not defined. Hej då."
.endif

build: deps mustache
	@ printf "%s" ${WEBSITE_S3BUCKET} > templates/s3bucket.mustache
	@ ${BIN}/build

mustache:
	@ go get
	@ go build -o mustache mustache.go

deps:
	@ mkdir -p assets/lib/fonts
	@ DEST=assets/lib ${BIN}/deps

sync:
	@ rsync -OPrv \
		--checksum \
		--copy-links \
		${DIST}/ \
		${SSH_USER}@${SSH_HOST}:${WEBSITE_DEST}

deploy: build sync

.PHONY: build deps
