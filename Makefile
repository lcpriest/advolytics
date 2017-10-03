##
# Binaries
##

ESLINT := node_modules/.bin/eslint
KARMA := node_modules/.bin/karma

##
# Files
##

LIBS = $(shell find lib -type f -name "*.js")
TESTS = $(shell find test -type f -name "*.test.js")
SUPPORT = $(shell find karma.conf*.js)
ALL_FILES = $(LIBS) $(TESTS) $(SUPPORT)

##
# Program options/flags
##

# A list of options to pass to Karma
# Overriding this overwrites all options specified in this file (e.g. BROWSERS)
KARMA_FLAGS ?=

# A list of Karma browser launchers to run
# http://karma-runner.github.io/0.13/config/browsers.html
BROWSERS ?= Chrome
ifdef BROWSERS
KARMA_FLAGS += --browsers $(BROWSERS)
endif

ifdef CI
KARMA_CONF ?= karma.conf.ci.js
else
KARMA_CONF ?= karma.conf.js
endif

# Mocha flags.
GREP ?= .

# Install dependencies.
node_modules: package.json
	npm install
	touch $@

# Remove temporary files and build artifacts.
clean:
	rm -rf *.log dist advocately.js advocately.min.js coverage

distclean: clean
	rm -rf components node_modules

advocately.js: node_modules $(LIB) package.json
	./node_modules/.bin/browserify lib/index.js -o advocately.js

advocately.min.js: advocately.js
	./node_modules/.bin/uglifyjs $< --compress --mangle --output $@

build: clean advocately.min.js
	mkdir dist
	mv ./advocately.min.js dist/

# Lint JavaScript source files.
lint: node_modules
	@$(ESLINT) $(ALL_FILES)

# Attempt to fix linting errors.
fmt: node_modules
	@$(ESLINT) --fix $(ALL_FILES)
.PHONY: fmt

# Run browser unit tests in a browser.
test-browser: node_modules
	@$(KARMA) start $(KARMA_FLAGS) $(KARMA_CONF)
.PHONY: test-browser

# Default test target.
test: lint test-browser
.PHONY: test
.DEFAULT_GOAL = test
