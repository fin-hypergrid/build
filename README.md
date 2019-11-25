## fin-hypergrid/build

### Contents

* **Hypergrid core** bundled build
   * Make file: `./bundle-core.sh`
   * Source files: `./fin-hypergrid` folder
   * Destination files: `./demo/build/fin-hypergrid.js` and `demo/build/fin-hypergrid.min.js`
   * All the demos reference this build
* **Hypergrid Dev Testbench** demo app
   * Make file: `./bundle-demo.sh` shell file
   * Source files: `./testbench` folder
   * Destination files: `./demo/build/testbench.js` and `demo/build/testbench.min.js`
   * Page file: `./demo/index.html`, which requests `testbench.js`

The make file scripts generate the `./demo/build` folder. This folder is ignored by git and never pushed to the repo.

The entire `demo` folder, _including the the `./demo/build` folder,_ is what is pushed to the CDN for each release.

It is also home to the source for the bundled build file (`fin-hypergrid/index.js`).

### Introduction

Various demos are included here.

If all you want to do is run the demos, they are all available on the CDN:

To run the main demo, a.k.a the [_Hypergrid Dev Testbench_](https://fin-hypergrid.github.io/core):
```bash
open https://fin-hypergrid.github.io/core/demo # latest demo
open https://fin-hypergrid.github.io/core/demo/M.m.p # specific version
```
To run other demos, for example the [_Multi-grid Demo_](https://fin-hypergrid.github.io/core/multiple-grids.html):
```bash
open https://fin-hypergrid.github.io/core/demo/multiple-grids.html # latest version
open https://fin-hypergrid.github.io/core/demo/M.m.p/multiple-grids.html # specific version
```
Notes:
1. The `https://fin-hypergrid.github.io/core/demo` folder is a symlink to the latest version folder (same for `doc` folder)
2. `M.m.p` (<major>.<minor>.<patch>) stands for an actual version number (such as `3.3.0`)
2. The `open` command only works on mac OS. For other OS's, paste the URL into your browser address bar

The Hypergrid bundled build files always require an explicit version number and can be found in `core/M.m.p/build/fin-hypergrid.js`. See the [CDN index](https://fin-hypergrid.github.io#index) for details.

### STOP

Do not clone this repo unless you want to contribute fixes or new demos.

### Development
You will need to have an installation of git and node/npm.

Clone the latest version from the repo for further exploration or development:

```bash
git clone https://github.com/fin-hypergrid-bundle.git
cd fin-hypergrid-bundle
```

Note in package.json the Hypergrid dependency:
```json
{
   "dependencies": {
       "fin-hypergrid": "../core"
   }
}
```
This assume you have also cloned **[`fin-hypergrid/core`](https://github.com/fin-hypergrid/core)** because you want to contribute to that repo as well.

**If this is not the case,** and you only wish to develop (or explore) the [`fin-hypergrid/build`](https://github.com/fin-hypergrid/build) repo and do not intend to develop Hypergrid `core`, then before running the general `npm install` as instructed below, select a version of **Hypergrid `core`** for the demos to use and edit your copy of packages.json to reflect your choice. (Do not commit this edit in your pull request.)

Generally, you will select the latest version of Hypergrid `core` to match the latest version of the demo.

Alternatively, before running the general `npm install`, run a specific `npm install <your selected hypergrid package>` (which edits `package.json` for you). Then proceed with the general `npm install` in the next section. Examples:
```bash
npm install --save fin-hypergrid # installs latest version published to npmjs.org
npm install --save fin-hypergrid@M.n.p # installs the specific version M.n.p

npm install --save github:fin-hypergrid/core # installs latest version from master branch on github
npm install --save 'github:fin-hypergrid/core#commit-ish' # installs from a specific branch or tag or SHA
```
(The quotes in the last example above are necessary because the `#` in the arg would otherwise introduce a shell comment.)

#### Historical versions

Historical versions are tagged in parallel in both repos. To work with and build a historical version of the core and the demo, do a `git checkout <version number>` on both repos.

> **Note:** The history of this repo begin with Hypergrid 3.0.0. You will not find any tagged commits for versions prior to v3 here. Prior to v3, the build and the demo were part of the `core` repo. To work with prior versions, look for a tagged commit in that repo.

### Building the Hypergrid bundle

This is the bundle we put up on the CDN; it's built here and referenced with a relative URL by the demos.

> **Before building the bundle:** If and only if you have cloned Hypergrid core into a sister folder (and therefore have _not_ edited package.json), you must go to that folder and run the pre-processor: `npm install; gulp` — which will run the linter, process the images and stylesheets, and run the tests. Note that this does not bundle the core into a single file (which is what we are doing here).

To build the bundle:
```bash
npm install
sh bundle-core.sh
```
The following files should appear:
* `./demo/build/fin-hypergrid.js`
* `./demo/build/fin-hypergrid.min.js`

You only need to do this once (or on any `core` update).

### Building Hypergrid Dev Testbench

Most of the demos are self-contained _.html_ files. Each demo loads the Hypergrid bundle from the `build` folder; and each has its own javascript embedded in a `<script>...</script>` element. As such, these can be run directly wihout any additional processing.

The only exception is the main demo, a.k.a. _Hypergrid Dev Workbench,_ or `testbench`. It relies on `build/testbench.js`, a bundled build of all the files in `js/demo`. To build it (assumes you've already run `npm install` above for its one external dependency, `fin-hypergrid-event-logger`):
```bash
sh bundle-demo.sh
open index.html # (mac OS only)
```
(If you're not on mac OS, use your browser's File -> Open function to point to the file.)

The [`bundle-demo.sh`](https://github.com/fin-hypergrid/demo/blob/master/bundle-demo.sh) shell file installs Browserify globally (if not already installed) and then calls it, which runs `browserify`:

_Excerpt from bundle-demo.js:_
```bash
browserify demo/js/testbench/index.js -do build/testbench.js
```
where `-d` means debug which folds in a source map.

The resulting build is **178KB** (50KB for the demo code + 20KB for the included event logger + 107KB for the source map) _vs._ **26KB** minified (21KB for the demo + 5KB for the event logger + 0KB no source map).

This just builds the demo's script. Hypergrid is not included in this build; the demo's [`index.html`](https://github.com/fin-hypergrid/demo/blob/master/index.html) file loads it separately:
```html
<script src="build/fin-hypergrid.js"></script>
<script src="build/testbench.js"></script>
```

For illustrative purposes, this shell file also produces a minified build. It installs UglifyJS2 globally (if not already installed) and calls it, which runs `uglifyjs`:

_Excerpt from bundle-demo.js:_
```bash
uglifyjs build/testbench.js -cmo build/testbench.min.js
```
where `-c` means compress and `-m` means mangle, for maximum minification.

The resulting minified build is **26KB**.

To actually consume this file, however, you would need to edit `index.html` to reference `testbench.min.js` instead of `testbench.js`.

### Build all

To build both the Hypergrid bundle and the testbench bundle
```
sh build.sh
```

### Folding Hypergrid into your application

This section explains how to including Hypergrid itself in your app bundle to create a _single_ build file, which makes a lot of sense when you would otherwise end up with a lot of `<script>` tags. It also makes it far less obvious that your app is using Hypergrid at all. The downside is of course that the file will be larger, and if you have several apps that all use Hypergrid, users will end up downloading they Hypergrid part multiple times _vs._ all pulling the same copy from the cache.

Taking the Dev Testbench demo as an example, to fold in Hypergrid, in `./demo/js/textbench/index.js` just change:
```js
var Hypergrid = fin.Hypergrid;
```
to:
```js
var Hypergrid = require('fin-hypergrid');
```
and remove the include (`<script>` tag) from the HTML file:
```html
    <script src="build/fin-hypergrid.js"></script>
```
Rebuild:
```bash
sh build.sh
```

The resulting file now includes Hypergrid and is now weighs in at **2.1MB** (787KB for Hypergrid + 71KB for the demo + 1.25MB for the source map). This can however be minified to **246KB** (230KB for Hypergrid + 26KB for the demo + 0KB no source map).

### Pushing to the CDN

The shell script `push-to-cdn.sh` pushes the current build along with all the demo page files to the CDN.

> **Restricted usage:** This script can only be run successfully by contributors with write access to the `gh-pages` branch.

#### Before running the script
* Change to the `core` folder
* Make sure the branch to be pushed to the CDN is checked out
* Run `gulp build`
* Run `gulp doc`
* Change to the `build` folder
* Make sure the branch to be pushed to the CDN is checked out
* Run `sh build.sh`
* Change back to the `core` branch
* Check the git status to make sure the branch is clean (no pending commits)

The reason the above actions are not part of the script is that they are subject to error. User must confirm that all the builds run successfully before running the script.

#### Parameter
The first and only script param is the target version number in M.m.p format (no leading "v").

#### Run the script
Example:
```bash
sh ../build/push-to-cdn.sh 3.3.0
```

### Hypergrid core development

If you're a contributor to Hypergrid core, you can easily try the demos with your latest build with the following methodology:
* Clone `fin-hypergrid/core` repo into a sister folder.
* Out of the box, the `package.json` in this repo specifies `"fin-hypergrid": "file:../core"` which is intended for Hypergrid core development. If you have changed this by installing a specific version of Hypergrid as instructed at the top of this document, make to reset it back to its original value (`"file:../core"`).
* Re-run `npm install` (you may need to delete `package-lock.json` and the `node_modules` folder first)

`npm` brilliantly creates a symlink to your `core` folder so that any changes made there are instantly availble to the demos.
