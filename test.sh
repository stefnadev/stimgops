#!/usr/bin/env bash

file=temp/balance.jpg
if [ $# -gt 0 ]; then
	file="$1"
fi

if [ ! -f "$file" ]; then
	echo "'$file' not found" >&2
	exit 1
fi

suffix=""
if [ $# -gt 1 ]; then
	suffix="$2"
fi

res=$(echo "$file"|sed "s@\(\.\w\+\)\$@_opt${suffix}\1@")
if [ "$res" == "$file" ]; then
	res="$file.opt${suffix}"
fi

curl -s -D - -w "%{http_code}\n" -o "$res" -X POST -H "Expect:" -H "Content-Type: multipart/form-data" \
	-F "img=@$file" http://localhost:8082/qwer

echo -n "Orig: "
ls -laF "$file"
echo -n "New:  "
ls -laF "$res"
file "$res"
