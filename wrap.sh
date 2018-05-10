if [ $# != 2 ]
then
  echo "usage: sh wrap.sh source-path dest-dir"
  exit
fi

if [ ${1: -3} != ".js" ]
then
  echo "error: expected first param to end in '.js'"
  exit
fi

mkdir -p $2 2>/dev/null

name=${1##*/}
base=${name%.js}
dest=$2/$base.hypermod.js

echo '(function(require, module, exports, Hypergrid) {' > $dest
cat $1 >> $dest
echo '})(fin.Hypergrid.require, fin.Hypergrid.modules, fin.$x = {}, fin.Hypergrid);' >> $dest
echo 'fin.Hypergrid.modules.'$base' = fin.$x;' >> $dest
echo 'delete fin.$x;' >> $dest

uglifyjs $dest -cmo $2/$base.hypermod.min.js

ls -lahL $2/$base.hypermod.*