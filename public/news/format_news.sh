#!/bin/sh
#Add paragraph tags to news articles

for file in *.html
do
	sed -i '1 s/\(.*\)/<p>\n\1/' "$file"
	sed -i 's/^$/<\/p>\n<p>/' "$file"
	sed -i '$ s/\(.*\)/\1\n<\/p>/' "$file"
done
