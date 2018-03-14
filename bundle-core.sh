if ! [ -a /usr/local/bin/browserify ]; then
npm install -g browserify
fi

browserify fin-hypergrid/index.js -do demo/build/fin-hypergrid.js
ls -lahL demo/build/fin-hypergrid.js

if ! [ -a /usr/local/bin/uglifyjs ]; then
npm install -g uglify-js
fi

uglifyjs demo/build/fin-hypergrid.js -cmo demo/build/fin-hypergrid.min.js
ls -lahL demo/build/fin-hypergrid.min.js

