(function(S) {
    S.one('.r-resolution').delegate('click', 'li', function(e) {
        var el = S.one(e.currentTarget);
        
        if (el.hasClass('active')) return;

        el.addClass('active');
        el.siblings('.active').removeClass('active');

        S.one('#r-content').width(el.html());
    });

    S.one('#r-content')
        .delegate('click', '.r-add-section', function(e) {
            S.one(e.currentTarget).before(
                '<div class="r-section">' +
                    '<div class="row"></div>' +
                    '<div class="r-panel">' +
                        '<a class="r-add-div btn btn-size25"><span class="iconfont">&#410</span>新增区块</a>' +
                        '<a class="r-clear-section btn btn-size25"><span class="iconfont">&#223</span>清除区域</a>' +
                        '<a class="r-remove-section btn btn-size25"><span class="iconfont">&#356</span>删除区域</a>' +
                    '</div>' +
                '</div>');
        })
        .delegate('click', '.r-add-div', function(e) {
            var el = S.one(e.currentTarget).parent('.r-section').one('.row');

            el.append('<div class="r-div span10"></div>');
        })
        .delegate('click', '.r-clear-section', function(e) {
            S.one(e.currentTarget).parent('.r-section').one('.row').html('');
        })
        .delegate('click', '.r-remove-section', function(e) {
            S.one(e.currentTarget).parent('.r-section').remove();
        });

    



    function color() {
        var index = Math.floor(color.AVALIABLE.length * Math.random());
        var ret = color.AVALIABLE[index];

        color.LAST.push(ret);
        color.AVALIABLE.splice(index, 1);

        if (color.LAST.length > 3) {
            color.AVALIABLE.push( color.LAST.shift() );
        }

        return ret;
    }
    color.AVALIABLE = ['#ccc', '#bbb', '#aaa', '#999', '#888', '#777'];
    color.LAST = [];
})(KISSY);
