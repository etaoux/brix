// html5
(function() {
    var tags = [
        'article', 'aside', 'details', 'figcaption',
        'figure', 'footer', 'header', 'hgroup',
        'menu', 'nav', 'section', 'summary',
        'time', 'mark', 'audio', 'video'],
            i = 0, len = tags.length;
    for (; i < len; i++) document.createElement(tags[i]);
})();
