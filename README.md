# HowFastIsTheNBN.com.au
The source for the howfastisthenbn.com website. Feel free to send me pull requests with fixes or enhancements.

## Development
You'll need npm (https://npmjs.org/) and bower (https://github.com/bower/bower) already installed.

```
$ git clone git@github.com:brotchie/howfastisthenbn.com.au.git
$ cd howfastisthenbn.com.au

$ bower install
$ npm install uglify-js

# Compile .less to .css and minify .js files.
$ make
# Run local webserver.
$ twistd web --path=. -p 8080
```
