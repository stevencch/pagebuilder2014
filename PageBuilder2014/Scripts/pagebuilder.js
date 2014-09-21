var sortable;
var draggable;
var parentDom;
var pbuid = 0;
var uid;
var data = [];
var selectedNode = null;
var nodeTree = {};
var treeHtml = '';
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
            
        } else {
            if (selectedNode == null && $(this).hasClass('row')) {
                selectedNode = $(this);
                uid = $(this).attr('uid');
            }
        }
    });
    //
    $('#btnDelete').click(function (event) {
        if (selectedNode != null) {
            draggable.draggable("destroy");
            sortable.sortable("destroy");
            selectedNode.remove();
            selectedNode = null;
            sortable = $(".pgPagePanel .sortable");
            sort();
            draggable = $(".draggable");
            drag();
            
        }
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
    
    $('#btnNew').click(function (event) {
        getNodeTree($('.pbRoot'), nodeTree);
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/page/new',
            data: JSON.stringify({action:'new'}),
            contentType: "application/json; charset=utf-8"
        }).done(function () {
            alert('ok');
        }).fail(function () {
            alert('fail');
        });
        event.stopPropagation();
    });
    
    $('#btnReload').click(function (event) {
        getNodeTree($('.pbRoot'), nodeTree);
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/page/reload',
            data: JSON.stringify({ action: 'reload' }),
            contentType: "application/json; charset=utf-8"
        }).done(function (data) {
            draggable.draggable("destroy");
            sortable.sortable("destroy");
            treeHtml = '';
            displayLayout(data);
            $('.pgPagePanel').html(treeHtml);
            sortable = $(".pgPagePanel .sortable");
            draggable = $(".draggable");
            sort();
            drag();
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
            pbuid++;
            if (ui.item.attr('pbnode').substr(0, 1) == 's') {
                ui.item.attr('uid', pbuid);
            }
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
    tree.uid = node.attr('uid')?node.attr('uid'):'0';
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

function displayLayout(layout) {
    if (parseInt(layout.uid) > pbuid) {
        pbuid = parseInt(layout.uid);
    }
    switch(layout.pbnode) {
        case 'root':
            treeHtml += '<div class="node pbRoot" pbnode="'+layout.pbnode+'"><div class="plPage">PAGE TOP</div><div class="sortable">';
            break;
        case 'c12':
            treeHtml += '<div class="row draggable node" pbnode="' + layout.pbnode + '">';
            break;
        case 'c6a':
        case 'c6b':
        case 'c4a':
        case 'c4b':
        case 'c4c':
        case 'c8a':
        case 'c8b':
            treeHtml += '<div pbnode="' + layout.pbnode + '" class="col-xs-' + layout.pbnode.substr(1,1) + ' node"><div class="plSectionPage">SECTION TOP</div><div class="sortable">';
            break;
        default:
            treeHtml += '<div class="row draggable node" pbnode="' + layout.pbnode + '" uid="' + layout.uid + '"><img src="/Content/templates/t1/images/home/' + layout.pbnode + '.png" alt=""></div>';
            break;
    }
    for (var i = 0; i < layout.tree.length; i++) {
        displayLayout(layout.tree[i]);
    }

    switch(layout.pbnode) {
        case 'root':
            treeHtml += '</div><div class="plPage">PAGE BOTTOM</div></div>';
            break;
        case 'c12':
            treeHtml += '</div>';
            break;
        case 'c6a':
        case 'c6b':
        case 'c4a':
        case 'c4b':
        case 'c4c':
        case 'c8a':
        case 'c8b':
            treeHtml += '</div><div class="plSectionPage">SECTION BOTTOM</div></div>';
            break;
        default:
            break;
            
    }
    
}