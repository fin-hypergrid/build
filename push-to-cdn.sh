# PARAMETERS:
# First (and only) param is version number in M.m.p format (no leading "v")
#
# ASSUMPTIONS:
# The current working directory is the `core` folder
# The `core` branch to be pushed has been checked out and is clean (no pending commits)
# The user has already run `gulp build` and `gulp doc` on this branch
# The user has already run `sh build.sh` on the `build` branch

mv -f doc .. # set doc folder aside

git checkout gh-pages
rm -fdr $1
cp -R ../build/demo ./$1

mv ../doc $1/doc # fold it in

rm -fdr $1/js/testbench/ # we don't want to push testbench's source files
git add $1

if [[ $1 != *-* ]]; # if version has no hyphen (as in "3.0.0-alpha")
then
	rm demo; ln -s $1 demo
	rm doc; ln -s $1/doc doc
fi

git commit -m $1
git push upstream gh-pages

git checkout demo doc
git checkout master
rm -fdr $1
mkdir umd
cp ../build/demo/build/fin-hypergrid* umd