# WEBSITE_PORT = 8000
#
# WEBSITE_SRV_USER = username
# WEBSITE_SRV_SERVER = example.org
# WEBSITE_DEST = /srv/http/example
#
# or ...
#
.include <env.mk>

build: mustache
	@./build

start: build deps
	httpserver -dir dist

mustache:
	go build -o mustache mustache.go

deps:
	DEST=dist/lib ./deps

sync:
	rsync -OPrv \
		--checksum \
		--delete-before \
		--exclude=.git \
		--exclude=default.mk \
		--exclude=welcome.html \
		--exclude=makefile \
		--exclude=tool \
		./dist/ ${WEBSITE_SRV_USER}@${WEBSITE_SRV_SERVER}:${WEBSITE_DEST}

deploy: build sync

.PHONY: build deps
