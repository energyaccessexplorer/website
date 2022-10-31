.include ".env"

BIN = ./bin
DIST = ./dist

.ifndef WEBSITE_DEST
.error "WEBSITE_DEST command is not defined. Hej då."
.endif

build: deps mustache
	@printf "%s" ${WEBSITE_S3BUCKET} > templates/s3bucket.mustache
	${BIN}/build

start:
	${HTTP_SERVER} --port ${WEBSITE_PORT} --dir ${DIST}

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
