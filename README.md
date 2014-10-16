# benchmarked [![NPM version](https://badge.fury.io/js/benchmarked.svg)](http://badge.fury.io/js/benchmarked)

> Easily generate benchmarks from a glob a files.

This is an opinionated wrapper for [benchmarked.js](http://benchmarkjs.com/) to make it easier to do benchmarks.

## Install
#### Install with [npm](npmjs.org):

```bash
npm i benchmarked --save-dev
```

## Run tests

```bash
npm test
```

## Usage

```js
var Suite = require('benchmarked');
var suite = new Suite({
  cwd: 'benchmark', // optionally define a current working directory
  add: 'my-functions/*.js', // path or glob pattern to functions
  fixtures: 'my-fixtures/*.txt'  // path or glob pattern to fixtures
});

// run the benchmarks
suite.run();
```

See the [examples](./example) to get a better understanding of how this works.

### Alternative setup

Add functions to run:

```js
suite.add('benchmark/my-functions/*.js');
```

Add fixtures to use:

```js
suite.fixtures('benchmark/my-fixtures/*.txt');
```

Run benchmarks for each fixture and function defined:

```js
suite.run();
```

Pass additional arguments beyond the content in the fixtures:

```js
// `fixture` is the content returned for each fixture
suite.run(function (fixture) {
  // this array will be applied as arguments to each function
  return [fixture, ':'];
});
```

## Options

### options.cwd

Specify a current working directory to be used for both fixtures and functions:

```js
var suite = new Suite({cwd: 'example'});
```

### options.name

Pass a custom naming function to be used on functions. This only changes the name
that displays in the command line for each function:

```js
var path = require('path');

var suite = new Suite({
  // this is the actual default
  name: function(filepath) {
    return path.basename(filepath);
  }
});
```

## Author

**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014 Jon Schlinkert, contributors.  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 16, 2014._