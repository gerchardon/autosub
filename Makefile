test:
	npm test

test-w:
	npm run-script test-w

test-cov: lib-cov
	@INSTINCT_COV=1 $(MAKE) test REPORTER=html-cov > public/coverage.html

lib-cov:
	@jscoverage lib lib-cov

.PHONY: test test-w
