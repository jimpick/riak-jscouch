#!/bin/sh

# Adapted from client_lib/javascript/tests in the Riak source tree

## Edit these values to point to point to
## your Riak server.
HOST=127.0.0.1
PORT=8098

BUCKET=riak-jscouch
BASEURL=http://$HOST:$PORT/riak/$BUCKET

storefiles() {
  for file in `ls *.$1`; do
      echo "Storing $file"
      curl -X PUT -H "content-type:$2" $BASEURL/`basename $file` --data-binary @$file
  done
}

storefiles "js" "text/javascript"
storefiles "html" "text/html"
storefiles "css" "text/css"
echo
echo "Now go to $BASEURL/index.html"
echo
