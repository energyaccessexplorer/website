# WEBSITE_PORT = 8000
#
# SRV_USER = username
# SRV_SERVER = example.org
# WEBSITE_DEST = /srv/http/example
#
# or ...
#
include ../default.mk

start:
	@go build
	@ ./website -port ${WEBSITE_PORT}

stop:
	-@stop-port ${WEBSITE_PORT}

deps:
	DEST=public/lib deps

build:
	@ ./build "localhost:${WEBSITE_PORT}"

sync:
	@rsync -OPrv \
		--checksum \
		--delete-before \
		--exclude=.git \
		--exclude=default.mk \
		--exclude=welcome.html \
		--exclude=makefile \
		--exclude=tool \
		./dist/ ${SRV_USER}@${SRV_SERVER}:${WEBSITE_DEST}

deploy: build sync

.PHONY: build
