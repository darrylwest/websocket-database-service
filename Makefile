
all:
	@make test

npm:
	@( npm install )

jshint:
	@( [ -d node_modules ] || make npm )
	@( gulp jshint )

test:
	@( [ -d node_modules ] || make npm )
	@( gulp test )

watch:
	@( gulp watch )

integration:
	@( node_modules/.bin/mocha --ui bdd --reporter spec integration-test/*.js )

docs:
	@( gulp jsdoc )

.PHONY: jshint
.PHONY: npm
.PHONY: test
.PHONY: watch
.PHONY: integration
.PHONY: build
.PHONY: docs

