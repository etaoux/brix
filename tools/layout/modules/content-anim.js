KISSY.add('modules/content-anim', function(S, D, E, Node) {
    function logPos(nodes) {
        var posList = [];
        var node;

        for (var i=0; i<nodes.length; i++) {
            node = nodes[i];
            posList.push([node.offsetLeft,
                node.offsetTop,
                node.offsetWidth,
                node.offsetHeight]);
        }

        return posList;
    }

    function showChange(nodes, oldPos, newPos) {
        var changed;
        for (var i=0; i<oldPos.length; i++) {
            changed = false;

            // 从1开始，忽略offsetLeft变化
            for (var j=1; j<oldPos[i].length; j++) {
                if (oldPos[i][j] !== newPos[i][j]) {
                    changed = true;
                    break;
                }
            }

            if (!changed) continue;

            // 增
            if (oldPos[i][2] === 0) {
                S.one(nodes[i]).css('background-color', '#ff8400');
            // 删
            } else if (newPos[i][2] === 0) {
                S.one(nodes[i]).parent('.r-section').append(
                    '<div class="r-fake-div" style="' +
                    'background-color: ' + '#488fcd;' +
                    'left: ' + oldPos[i][0] + 'px;' +
                    'top: ' + oldPos[i][1] + 'px;' +
                    'width: ' + oldPos[i][2] + 'px;' +
                    'height: ' + oldPos[i][3] + 'px"></div>');
            // 变
            } else {
                S.one(nodes[i]).css('background-color', '#fb6477');
            }
        }
        S.later(function () {
            S.all('.r-fake-div').css('opacity', 0);
        });
        S.later(function () {
            S.all('.r-div').css('background-color', '#ccc');
        }, 1000);
    }

    return {
        init: function () {
            var nodes, oldPos, newPos;

            App.msg.on('beforePageWidthChange', function (e) {
                S.all('.r-fake-div').remove();

                nodes = document.querySelectorAll('.r-div');
                oldPos = logPos(nodes);
            });
            App.msg.on('afterPageWidthChange', function (e) {
                newPos = logPos(nodes);

                showChange(nodes, oldPos, newPos);
            });
        }
    };
}, {
    requires: ['dom', 'event', 'node']
});
