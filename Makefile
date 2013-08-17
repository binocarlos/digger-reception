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
	browserify src/clients/core.js > src/clients/build/core.js

uglify: browserify
	uglifyjs src/clients/build/core.js > src/clients/build/core.min.js

build: uglify

install:
	npm install

.PHONY: test