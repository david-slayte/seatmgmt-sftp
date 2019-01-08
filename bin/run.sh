#!/bin/bash

export RUNDIR="/app"

cd $RUNDIR || exit

echo 'Running the server'
node "$RUNDIR/server.js"
