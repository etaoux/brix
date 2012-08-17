# modules-min.js
cat modules/*.js | uglifyjs > modules-min.js

# style-min.css
lessc --yui-compress style.less > style-min.css
