# WEB_PORT = 8000
#
# SRV_USER = username
# SRV_SERVER = example.org
# SRV_DEST = /srv/http/example
#
# or ...
#
include default.mk

start:
	@go run mustache-server.go -port ${WEB_PORT}

stop:
	-@lsof -t -i :${WEB_PORT} | xargs -r kill

deps:
	DEST=public/lib deps

build:
	@ ./build "localhost:${WEB_PORT}"

sync:
	@rsync -OPrv \
		--checksum \
		--delete-before \
		--exclude=.git \
		--exclude=default.mk \
		--exclude=welcome.html \
		--exclude=makefile \
		--exclude=tool \
		./dist/ ${SRV_USER}@${SRV_SERVER}:${SRV_DEST}

deploy: build sync

.PHONY: build
