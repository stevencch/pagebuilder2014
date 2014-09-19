var currentNode=null;
var isFound = false;
var editText = '';
var pbid = null;
var newContent = '';
var tempContent = '';

$(document).ready(function () {
    $('#textEditor').summernote();
    $('#btnEditText').click(function (event) {
        $('#pbTextModal').modal({
            backdrop: false,
            show:true
        });
        event.stopPropagation();
    });
    $('#btnTextSave').click(function () {
        var content=$('#textEditor').code();
        var html=$(content);
        if (currentNode.Children.length > 1) {
            if (html.length == 0) {
                currentNode.Children = [];
                $("*[pbid='" + pbid + "'").html('');
            }
            else {
                newContent = '';
                var lineBreak=''
                var firstChild = currentNode.Children[0];
                if (firstChild.Type != 'li') {
                    lineBreak='<br/>';
                }
                currentNode.Children = [];
                for (var i = 0; i < html.length; i++) {
                    var newNode = $.extend(true, {}, firstChild);
                    var text = $(html[i]).html();
                    updateChildNode(newNode, text);
                    currentNode.Children.push(newNode);
                }
                if (currentNode.Children) {
                    for (var j = 0; j < currentNode.Children.length; j++) {
                        tempContent = '';
                        getHtml(currentNode.Children[j]);
                        newContent += tempContent + lineBreak;
                    }
                }
                $("*[pbid='" + pbid + "'").html(newContent);
            }
        }
        else {
            if (html.length == 0) {
                currentNode.Content = '';
                $("*[pbid='" + pbid + "'").html('');
            }
            else if (html.length == 1) {
                currentNode.Content = html.html();
                $("*[pbid='" + pbid + "'").html(html.html());
            }
            else {
                newContent = '';
                for (var i = 0; i < html.length; i++) {
                    newContent += $(html[i]).html();
                    if (i != html.length - 1) {
                        newContent += '<br/>';
                    }
                }
                currentNode.Content = newContent;
                $("*[pbid='" + pbid + "'").html(newContent);
            }
        }
    });
    $("*[pbid]").click(function () {
        pbid=$(this).attr('pbid');
        searchNode(pagejson, 'pbid', pbid);
        if (currentNode != null) {
            editText = '';
            getEditText(currentNode);
        }
        $('#textEditor').code(editText);
        $("#textKey").val(pbid);
        $('#pbTextModal').modal({
            backdrop: false,
            show: true
        });
    });

    $("img").click(function () {
        $('#imageKey').attr('src', $(this).attr('src'));
        $('#pbImageModal').modal({
            backdrop: false,
            show: true
        });
    });

    $('#btnSearch').click(function (event) {
        $.get('http://localhost:1555/api/image?query='+$('#textSearch').val()+'&filter=size:medium&top=20&skip=60',
            function (data) {
                resultList = ''
                _.each(data, function (item) {
                    resultList += "<img style='width:100px' src='" + item + "'/><br/>";
                });
                alert('ok');
                setTimeout(function () {
                    $('#searchPanel').html(resultList);
                },5000)
            })
            .fail(function () {
                alert('fail');
            });
        event.stopPropagation();
    });
});

function getHtml(node) {
    if (node.Type != '#text') {
        tempContent += '<' + node.Type;
        if (node.Attributes) {
            tempContent += ' ';
            for (var j = 0; j < node.Attributes.length; j++) {
                tempContent += node.Attributes[j].Key + '="' + node.Attributes[j].Value + '" ';
            }
        }
        tempContent += '>';
        if (node.Children) {
            for (var j = 0; j < node.Children.length; j++) {
                getHtml(node.Children[j]);
            }
        }
        tempContent += '</' + node.Type + '>';
    }
    else {
        tempContent += node.Content;
    }
}

function updateChildNode(node, text) {
    if (node.Type == '#text') {
        node.Content = text;
    }
    if (node.Children) {
        for (var j = 0; j < node.Children.length; j++) {
            updateChildNode(node.Children[j], text);
        }
    }
}

function getEditText(node) {
    if (node.Type == '#text') {
        editText += '<p>' + node.Content + '</p>';
    }
    if (node.Children) {
        for (var j = 0; j < node.Children.length; j++) {
            getEditText(node.Children[j]);
        }
    }
}


function searchNode(node, attr, value) {
    if (pagejson == node) {
        currentNode = null;
        isFound = false;
    }
    if (node.Attributes) {
        for (var i = 0; i < node.Attributes.length; i++) {
            if (node.Attributes[i].Key == attr && node.Attributes[i].Value == value) {
                currentNode = node;
                isFound = true;
                break;
            }
        }
    }
    if (!isFound && node.Children) {
        for (var j = 0; j < node.Children.length; j++) {
            searchNode(node.Children[j], attr, value);
            if (isFound) {
                break;
            }
        }
    }
}
