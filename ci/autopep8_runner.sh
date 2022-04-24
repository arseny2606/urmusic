#!/bin/bash

# run autopep8
cd backend
pip install -r requirements.txt
autopep8 --in-place --recursive --agressive --agressive .

#commit changes
cd ../
export CI_PUSH_REPO=`echo $CI_REPOSITORY_URL | perl -pe 's#.*@(.+?(\:\d+)?)/#git@\1:#'`
git checkout CI_COMMIT_BRANCH
git config --global user.name "CI Job"
git config --global user.email "ci@.example.com"
git remote set-url --push origin "${CI_PUSH_REPO}"
git commit -am "CI: autopep8"
git push origin ${CI_COMMIT_BRANCH}:${CI_BUILD_REF_NAME} || true