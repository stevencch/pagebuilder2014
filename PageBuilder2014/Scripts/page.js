if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
    };
}

String.prototype.short = function (i) {
    if (this.length < i) {
        i = this.length;
    }
    return this.substr(0, i);
};

var currentNode = null;
var isFound = false;
var editText = '';
var pbid = null;
var imgid = null;
var newContent = '';
var tempContent = '';
var currentImage = null;
var currentText = null;
var selectedImage = null;

$(document).ready(function () {
    $("#pbTextModal").draggable({
        handle: ".modal-title"
    });
    $("#pbImageModal").draggable({
        handle: ".modal-title"
    });
    $('#textEditor').summernote();
    $('#btnEditText').click(function (event) {
        pbid = null;
        showTextList();
    });
    $('#btnEditImage').click(function (event) {
        imgid = null;
        showImageList();
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

    $('#textPanel').delegate('*[txtpbid]', 'click', function () {
        pbid = $(this).attr('txtpbid');
        currentText = $('*[pbid="'+pbid+'"]');
        showTextList();
    })

    $('#imagePanel').delegate('*[editimgid]', 'click', function () {
        imgid = $(this).attr('editimgid');
        currentImage = $('*[imgid="' + imgid + '"]');
        showImageList();
    })

    $("*[pbid]").click(function (event) {
        currentText = $(this);
        pbid = $(this).attr('pbid');
        showTextList();
        
        event.stopPropagation();
    });
    $("*[imgid]").click(function () {
        currentImage = $(this);
        imgid = $(this).attr('imgid');
        showImageList();
        
    });
    $('#btnSearch').click(function (event) {
        selectedImage = null;
        $('#btnSearch').html("Loading...");
        $.get('/api/image?query='+$('#textSearch').val()+'&filter=size:medium&top=20&skip=60',
            function (data) {
                resultList = '<div class="clearfix">';
                var count = 0;
                _.each(data, function (item) {
                    count++;
                    resultList += "<div class='resultImage'><img style='width:100px' src='" + item.Url + "'/><div class='imageSize'>" + item.Width + 'X' + item.Height + '</div></div>';
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
        $('.resultImage').removeClass('selected');
        $(this).addClass('selected');
        selectedImage = $(this);
    });

    $('#btnImageSave').click(function () {
        currentImage.attr("src", selectedImage.children('img').attr("src"));
        var src = _.find(currentNode.Attributes, function (item) {
            return item.Key == 'src';
        });
        src.Value = selectedImage.attr("src");
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

function showTextList() {
    var html = '<ul>';
    var textList = $("*[pbid]");
    var active = '';
    for (var i = 0; i < textList.length; i++) {
        var txtpbid = $(textList[i]).attr('pbid');
        if (txtpbid == pbid) {
            active = ' active';
        }
        else {
            active = '';
        }
        html += '<li class="list-group-item' + active + '" txtpbid="' +txtpbid +'">' + textList[i].innerHTML.replace(/<[^>]*>/g, '').short(40) + '</li>';
    }
    html += '</ul>';
    $('#textPanel').html(html);

    if (pbid != null) {
        searchNode(pagejson, 'pbid', pbid);
        if (currentNode != null) {
            editText = '';
            getEditText(currentNode);
        }
        $('#textEditor').code(editText);
    }
    $('#pbTextModal').modal({
        backdrop: false,
        show: true
    });
}

function showImageList() {
    var html = '<ul>';
    var imgList = $("*[imgid]");
    var active = '';
    for (var i = 0; i < imgList.length; i++) {
        var editimgid = $(imgList[i]).attr('imgid');
        if (editimgid == imgid) {
            active = ' active';
        }
        else {
            active = '';
        }

        html += '<li class="list-group-item' + active + '" editimgid="' + editimgid + '"><div><img src="' + $(imgList[i]).attr('src') + '"/><div class="imageSize">' + imgList[i].width + 'X' + imgList[i].height + '</div><div></li>';
    }
    html += '</ul>';
    $('#imagePanel').html(html);

    $('#imagePanel')[0].scrollTop = 0;
    var height = 0;
    for (var j = 0; j < $('#imagePanel').find('img').length; j++) {
        height += $('#imagePanel').find('img')[j].height * 135 / $('#imagePanel').find('img')[j].width + 20;
        console.log($('#imagePanel').find('img')[j].height * 135 / $('#imagePanel').find('img')[j].width + 20);
        if ($($('#imagePanel').find('img')[j]).parent().parent().hasClass('active')) {
            break;
        }
    }
    setTimeout(function () {
        $('#imagePanel')[0].scrollTop = height;
    }, 1000);
    

    if (imgid != null) {
        searchNode(pagejson, 'imgid', imgid);
    }
    $('#pbImageModal').modal({
        backdrop: false,
        show: true
    });
}


