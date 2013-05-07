LESSC=./components/less.js/bin/lessc
UGLIFYJS=uglifyjs

LESS=$(wildcard css/*.less)
CSS=$(LESS:.less=.css)

JSDIR=js
JSMINDIR=jsmin
JS=$(wildcard $(JSDIR)/*.js)
JSMIN=$(patsubst js/%.js,$(JSMINDIR)/%.min.js,$(JS))

.PHONY: css clean js

main: js css

js: $(JSMIN)

css: $(CSS)

$(JSMINDIR)/%.min.js: $(JSDIR)/%.js $(JSMINDIR)
	echo $< $@
	$(UGLIFYJS) $< -c -o $@

%.css: %.less
	$(LESSC) $< $@

$(JSMINDIR):
	mkdir -p $(JSMINDIR)

clean:
	rm -fr $(CSS) $(JSMINDIR)


