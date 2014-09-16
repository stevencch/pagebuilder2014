var sortable;
var draggable;
var parentDom;
var domCount = 0;
var uid;
var data = [];
var selectedNode = null;
var nodeTree = {};
$(function () {
    sortable = $(".pgPagePanel .sortable");
    draggable = $(".pgToolbar .draggable").not(".ui-draggable");
    $(".accordion").accordion({ heightStyle: "fill" });
    sort();
    drag();
    //
    $('.pgPagePanel').delegate('.node', 'click', function () {
        if ($(this).hasClass("pbRoot")) {
            $('.pgPagePanel .node').removeClass('pgSelected');
            selectedNode.addClass('pgSelected');
            selectedNode = null;
        } else {
            if (selectedNode == null) {
                selectedNode = $(this);
                uid = $(this).attr('uid');
                parent = $(this).parent();
            }
        }
    });
    //
    $('#btnImage').click(function (event) {
        $.get('http://localhost:1555/api/image?query=dog&filter=size:medium&top=10&skip=0',
            function (data) {
                var html=''
                _.each(data, function (item) {
                    html+="<img style='width:200px' src='" + item + "'/><br/>";
                });
                $('#testPanel').html(html);
                alert('ok');
            })
            .fail(function () {
                alert('fail');
            });
        event.stopPropagation();
    });
    //
    $('#btnPreview').click(function (event) {
        getNodeTree($('.pbRoot'), nodeTree);
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/page',
            data: JSON.stringify(nodeTree),
            contentType: "application/json; charset=utf-8"
        }).done(function () {
            alert('ok');
        }).fail(function () {
            alert('fail');
        });
        event.stopPropagation();
    });
});

function sort() {
    sortable.sortable({
        revert: true,
        stop: function (event, ui) {
            domCount++;
            ui.item.find('.node').attr('uid', domCount);
        }
    });
}

function drag() {
    draggable.draggable({
        connectToSortable: ".pgPagePanel .sortable",
        helper: "clone",
        stop: function (event, ui) {
            setTimeout(dragAndSort, 500);
        }
    });
}

function dragAndSort() {
    draggable.draggable("destroy");
    sortable.sortable("destroy");
    sortable = $(".pgPagePanel .sortable");
    sort();
    draggable = $(".pgToolbar .draggable").not('.ui-draggable-handle');
    drag();
}

function getNodeTree(node, tree) {
    tree.pbnode = node.attr('pbnode');
    tree.tree = [];
    if (tree.pbnode.substr(0, 1) == 's') {
        return;
    } else {
        var nodes;
        if (node.children('.sortable').length > 0) {
            nodes = node.children('.sortable').children('.node');
        } else {
            nodes = node.children('.node');
        }
        _.each(nodes, function (item) {
            var child = {};
            tree.tree.push(child);
            getNodeTree($(item), child);
        });
    }
}