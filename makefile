default: build

.include ".env"
# in .env
# WEBSITE_S3BUCKET = https://bucket.s3.amazonws.com/path
# WEBSITE_DEST = /var/www/path
# SSH_USER = www
# SSH_HOST = srv.example.org
# SUPABASE_URL = https://ref.supabase.co
# SUPABASE_ANON_KEY = sb_publishable_...
#
# Supabase Auth, read by assets/javascripts/supabase.js. The key is public by
# design; the dev-server rewrites both values to the local gateway in local builds.
SUPABASE_URL ?= https://fjuzeptiewrqfxunivnu.supabase.co
SUPABASE_ANON_KEY ?= sb_publishable_fyBFmd4Q_XsbecX6_9-h_w_1_EQz0lF

BIN = ./bin
DIST = ./dist

build: deps mustache
.ifndef WEBSITE_S3BUCKET
.error "WEBSITE_S3BUCKET command is not defined. Hej då."
.endif

	@ printf "%s" ${WEBSITE_S3BUCKET} > templates/s3bucket.mustache
	@ printf '{"url": "%s", "key": "%s"}' ${SUPABASE_URL} ${SUPABASE_ANON_KEY} > templates/supabase.mustache
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
