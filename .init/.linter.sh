#!/bin/bash
cd /home/kavia/workspace/code-generation/ludo-online-223670-223679/ludo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

