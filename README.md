Small AngularJS 1.x example with:
* npm (no grunt nor gulp)
* typescript (incremental compilation)
* tsd (to download typings from DefinitelyTyped)

## Preparation

````
npm run setup
````

> You must of course install first nodejs & npm. On ubuntu, you can do:
>
> ````
> apt-get install npm nodejs-legacy
> ````

## Run

The web server will always have access to only build folder, so `npm run build` will generate
only the js/html/css that will be available.

````
//In dev, the command allow the user to see the generated content, but this is not user by webpack-dev-server
// because webpack-dev-server store content in memory (not on disk)
npm run build:dev
//In prod, needs to be generated on the prod server
npm run build:prod
````

## Server

````
//In dev, webpack-dev-server is used with hot reload and inline options
npm run server:dev
//In prod, this is a simple prod server in order to test prod environment in dev
npm run server:prod
````

## Typings

The version used is 0.7, so option --ambient must be used

```
typings install jquery --ambient --save
```

## Browser

### Readable stack trace

When AngularJS catch an exception, it logs it in console.
* chromium: since [version 42](https://code.google.com/p/chromium/issues/detail?id=357958), the stack trace correctly handles typescript.
* firefox: no good solution.

## Use atom editor to modify typescript code

On ubuntu:
````
sudo add-apt-repository ppa:webupd8team/atom
sudo apt-get update
sudo apt-get install atom
````

Then install typescript package:
````
apm install typescript
````

Interesting initial configuration:

````
echo '"*": { "tree-view": { hideIgnoredNames: true, hideVcsIgnoredFiles: true } }' > ~/.atom/config.cson
````
