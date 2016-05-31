Small AngularJS 1.x example with:
* npm (no grunt nor gulp)
* typescript (incremental compilation)
* tsd (to download typings from DefinitelyTyped)

## Preparation

````
npm install
````

> You must of course install first nodejs & npm. On ubuntu, you can do:
>
> ````
> apt-get install npm nodejs-legacy
> ````

## Run

````
npm run tsc &
npm start
````

## Update typings from DefinitelyTyped

````
./node_modules/.bin/tsd update -o -s
````

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
