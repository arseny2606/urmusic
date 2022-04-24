#!/bin/bash

cd backend
mkdir public
pycodestyle . --statistics > public/pycodestyle.txt
exit 0
