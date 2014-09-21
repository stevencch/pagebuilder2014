if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
    };
}

var currentNode = null;
var isFound = false;
var editText = '';
var pbid = null;
var imgid = null;
var newContent = '';
var tempContent = '';
var currentImage = null;
var currentText = null;

$(document).ready(function () {
    $("#pbTextModal").draggable({
        handle: ".modal-title"
    });
    $("#pbImageModal").draggable({
        handle: ".modal-title"
    });
    $('#textEditor').summernote();
    $('#btnEditText').click(function (event) {
        $('#pbTextModal').modal({
            backdrop: false,
            show:true
        });
        event.stopPropagation();
    });
    $('#btnSavePage').click(function (event) {
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/page/save',
            data: JSON.stringify(pagejson),
            contentType: "application/json; charset=utf-8"
        }).done(function () {
            alert('ok');
        }).fail(function () {
            alert('fail');
        });
        event.stopPropagation();
    });
    $('#btnTextSave').click(function () {
        var content=$('#textEditor').code();
        var html = $(content);
        updateAttribute(currentNode, 'isedit', 'true');
        if (currentNode.Children.length > 1) {
            if (html.length == 0) {
                currentNode.Children = [];
                currentText.html('');
            }
            else {
                newContent = '';
                var firstChild = currentNode.Children[0];
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
                        newContent += tempContent;
                    }
                }
                currentText.html(newContent);
            }
        }
        else {
            if (html.length == 0) {
                currentNode.Children[0].Content = '';
                currentText.html('');
            }
            else if (html.length == 1) {
                currentNode.Children[0].Content = html.html();
                currentText.html(html.html());
            }
            else {
                newContent = '';
                for (var i = 0; i < html.length; i++) {
                    newContent += $(html[i]).html();
                    
                    if (i != html.length - 1) {
                        if (!(i == html.length - 2 && $(html[i+1]).html().trim()=='')) {
                            newContent += '<br/>';
                        }
                    }
                }
                currentNode.Children[0].Content = newContent;
                currentText.html(newContent);
            }
        }
    });
    $("*[pbid]").click(function (event) {
        currentText = $(this);
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
        event.stopPropagation();
    });
    $("*[imgid]").click(function () {
        currentImage = $(this);
        imgid = $(this).attr('imgid');
        searchNode(pagejson, 'imgid', imgid);
        $('#imageKey').attr('src', $(this).attr('src'));
        $('#pbImageModal').modal({
            backdrop: false,
            show: true
        });
    });
    $('#btnSearch').click(function (event) {
        $('#btnSearch').html("Loading...");
        $.get('/api/image?query='+$('#textSearch').val()+'&filter=size:medium&top=20&skip=60',
            function (data) {
                resultList = '<div class="clearfix">';
                var count = 0;
                _.each(data, function (item) {
                    count++;
                    resultList += "<img class='resultImage' style='width:100px' src='" + item + "'/>";
                    if (count % 4 == 0) {
                        resultList += '</div><div class="clearfix">';
                    }
                });
                resultList += '</div>';
                setTimeout(function() {
                    $('#searchPanel').html(resultList);
                    $('#btnSearch').html("Search");
                }, 5000);
            })
            .fail(function () {
                alert('fail');
            });
        event.stopPropagation();
    });
    $('#searchPanel').delegate(".resultImage", 'click', function() {
        currentImage.attr("src", $(this).attr("src"));
        var src=_.find(currentNode.Attributes, function(item) {
            return item.Key == 'src';
        });
        src.Value = $(this).attr("src");
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
        var content = node.Content.replace(/<br.>/g, '</p><p>');
        editText += '<p>' + content + '</p>';
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

function updateAttribute(node, key, value) {
    var attr=_.find(node.Attributes, function(item) {
        return item.Key == key;
    });
    if (attr) {
        attr.Value = value;
    } else {
        node.Attributes.push({ Key: key, Value: value });
    }
}
