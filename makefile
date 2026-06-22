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

build: deps mustache
.ifndef WEBSITE_S3BUCKET
.error "WEBSITE_S3BUCKET command is not defined. Hej då."
.endif

	@ printf "%s" ${WEBSITE_S3BUCKET} > templates/s3bucket.mustache
	@ ${BIN}/build

mustache:
	@ go get
	@ go build -o mustache mustache.go

clean:
	@ rm -rf assets/lib ${DIST}

deps:
	@ mkdir -p assets/lib/fonts
	@ DEST=assets/lib ${BIN}/deps

sync:
.ifndef WEBSITE_DEST
.error "WEBSITE_DEST command is not defined. Hej då."
.endif

	@ rsync -OPrv \
		--checksum \
		--copy-links \
		${DIST}/ \
		${SSH_USER}@${SSH_HOST}:${WEBSITE_DEST}

	@ rsync -OPrv \
		--checksum \
		--copy-links \
		${DIST}/lib/fonts/ \
		${SSH_USER}@${SSH_HOST}:/var/www/html/fonts/

deploy: build sync

.PHONY: build deps
