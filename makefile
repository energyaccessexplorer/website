include default.mk

start:
	@go run mustache-server.go -port ${WEB_PORT}

stop:
	-@lsof -t -i :${WEB_PORT} | xargs -i kill {}

deps:
	DEST=public/lib deps

build:
	@ buildo "localhost:${WEB_PORT}"

sync:
	@rsync -OPrv \
		--checksum \
		--delete-before \
		--exclude=data--* \
		--exclude=.git \
		--exclude=default.mk \
		--exclude=makefile \
		--exclude=config.json \
		--exclude=tool \
		--exclude=maps-and-data \
		--exclude=welcome.html \
		./dist/ ${SRV_USER}@${SRV_SERVER}:${SRV_DEST}

deploy: build sync
