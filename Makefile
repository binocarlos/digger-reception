TESTS = test/*.js
REPORTER = spec
#REPORTER = dot

check: test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 300 \
		--require should \
		--growl \
		$(TESTS)

browserify:
	browserify -r digger-sockets > src/clients/sockets.js

uglify: browserify
	uglifyjs src/clients/sockets.js > src/clients/sockets.min.js

build: uglify

install:
	npm install

.PHONY: test