# BUILD BUNDLED FILE w/browserify

if ! [ -a /usr/local/bin/browserify ]; then
npm install -g browserify
fi

browserify testbench/index.js -do demo/build/testbench.js
ls -lahL demo/build/testbench.js

# BUILD MINIFIED FILE w/uglify

if ! [ -a /usr/local/bin/uglifyjs ]; then
npm install -g uglify-js
fi

uglifyjs demo/build/testbench.js -cmo demo/build/testbench.min.js
ls -lahL demo/build/testbench.min.js
