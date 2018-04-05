if [ $# != 2 ]
then
  echo "usage: sh wrap-mods.sh source-dir dest-dir"
  exit
fi

mkdir -p $2 2>/dev/null

ls -1 $1/*.js | grep -v index.js | while read filename
do
  sh wrap.sh $filename $2
done
