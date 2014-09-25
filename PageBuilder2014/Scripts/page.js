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

var cropwidth = 0;
var cropheight = 0;
var cropdata = '';

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


    $('#textPanel').delegate('*[txtpbid]', 'click', function () {
        pbid = $(this).attr('txtpbid');
        currentText = $('*[pbid="' + pbid + '"]');
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

    $('#btnTextSave').click(function () {
        var content = $('#textEditor').code();
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
                        if (!(i == html.length - 2 && $(html[i + 1]).html().trim() == '')) {
                            newContent += '<br/>';
                        }
                    }
                }
                currentNode.Children[0].Content = newContent;
                currentText.html(newContent);
            }
        }
    });

    

    

    var imageCount = 50;
    var tryCount = 3;
    var imageLoad = [];
    var imageUrl = [];
    var step = 0;
    $('#btnSearch').click(function (event) {
        $('.cropForm').hide();
        selectedImage = null;
        $('#btnSearch').html("Loading...");
        $.get('/api/image?query=' + $('#textSearch').val() + '&filter=size:large&top=50&skip=0',
            function (data) {
                resultList = '<div class="clearfix">';
                var count = 0;
                _.each(data, function (item) {
                    imageUrl[count] = item.Url;
                    resultList += "<div class='resultImage pbimage-" +count + "'><div class='imagePlaceHolder'></div><div class='imageSize'>" + item.Width + 'X' + item.Height + '</div></div>';
                    count++;
                    if (count % 4 == 0) {
                        resultList += '</div><div class="clearfix">';
                    }
                });
                resultList += '</div>';
                $('#searchPanel').html(resultList);
                step = 0;
                setTimeout(loadImage, 3000);
            })
            .fail(function () {
                alert('fail');
            });
    });

    function loadImage() {
        step++;
        var allPass = true;
        for (var i = 0; i < imageCount; i++) {
            if (imageUrl[i] != null) {
                imageLoad[i] = new Image();
                imageLoad[i].onload = showImage(i);
                imageLoad[i].alt = imageUrl[i].replace('/content/images/', '').replace('/', '_');
                imageLoad[i].src = imageUrl[i];
                allPass = false;
            }
        }
        if (!allPass && step <= tryCount) {
            //window.console && console.log(step);
            setTimeout(loadImage, 3000);
        } else {
            $('#btnSearch').html('Search');
        }
    }

    function showImage(id) {
        return function () {
            displayImage(id);
        };
    }

    function displayImage(id) {
        window.console && console.log(id);
        $('.pbimage-' + id + ' .imagePlaceHolder').append(imageLoad[id]);
        $('.pbimage-' + id).show();
        imageUrl[id] = null;
    }

    $('.imagePanel').delegate(".resultImage", 'click', function () {
        $('.resultImage').removeClass('selected');
        $(this).addClass('selected');
        selectedImage = $(this);
        $('.cropForm').show();
    });

    $('#myFolderTab').on('shown.bs.tab', showMyFolder);

    function showMyFolder() {
        $.get('/api/image/1',
            function (data) {
                resultList = '<div class="clearfix">';
                var count = 0;
                _.each(data, function (item) {
                    count++;
                    resultList += "<div class='resultImage'><div class='imagePlaceHolder'><img src='" + item.Url + "' alt='" + item.Name + "' /></div><div class='imageSize'>" + item.Width + 'X' + item.Height + '</div></div>';
                    if (count % 4 == 0) {
                        resultList += '</div><div class="clearfix">';
                    }
                });
                resultList += '</div>';
                $('#myFolderPanel').html(resultList);
            })
            .fail(function () {
                alert('fail');
            });
    }

    $('#btnImageSave').click(function () {
        var imageUrl=selectedImage.find('img').attr("src");
        if (currentImage.attr('bgimage')) {
            currentImage.attr("src", imageUrl);
            var src = _.find(currentNode.Attributes, function (item) {
                return item.Key == 'src';
            });
            src.Value = imageUrl;
            currentImage.attr("style", "background-image: url('"+imageUrl+"')");
            var style = _.find(currentNode.Attributes, function (item) {
                return item.Key == 'src';
            });
            src.Value = "background-image: url('" + imageUrl + "')";
        } else {
            currentImage.attr("src", imageUrl);
            var src = _.find(currentNode.Attributes, function (item) {
                return item.Key == 'src';
            });
            src.Value = imageUrl;
        }
    });

    $('#btnCropImage').click(function () {
        $('#pbImageModal').modal('hide');
        cropwidth = $('#txtCropWidth').val();
        cropheight = $('#txtCropHeight').val();
        $('#pbCropImage').attr('src', selectedImage.find('img').attr("src"));
        $('#pbCropModal .modal-dialog').width((parseInt(cropwidth) + 50) + 'px');
        $('#pbCropModal').modal({
            backdrop: false,
            show: true
        });
        cropdata = '';
        $('#pbCropImage').cropbox({ width: cropwidth, height: cropheight, showControls: 'auto' })
            .on('cropbox', function (event, results, img) {
                $('.cropX').text(results.cropX);
                $('.cropY').text(results.cropY);
                $('.cropW').text(results.cropW);
                $('.cropH').text(results.cropH);
                cropdata = img.getDataURL();
            });
    });

    $('#btnUpload').click(function () {
        $('#btnUpload').html("Uploading...");
        var formData = new FormData();
        var opmlFile = $('#fileUpload')[0];
        formData.append("uploadFile", opmlFile.files[0]);
        //formData.append("fileName", 'newfile');

        $.ajax({
            url: '/api/image',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function () {
            $('#btnUpload').html("Upload");
            showMyFolder();
        }).fail(function () {
            alert('fail');
            $('#btnUpload').html("Upload");
        });
    });

    $('#btnSaveCropImage').click(function () {
        $('#btnSaveCropImage').html('Saving...');
        if (cropdata) {
            var imageData = {
                Name: selectedImage.find('img').attr('alt'),
                Data: cropdata
            }
            $.ajax({
                type: 'POST',
                dataType: "json",
                url: '/api/image/save',
                data: JSON.stringify(imageData),
                contentType: "application/json; charset=utf-8"
            }).done(function () {
                $('#pbCropModal').modal('hide');
                $('#pbImageModal').modal({
                    backdrop: false,
                    show: true
                });
                $('#myFolderTab').tab('show');
                showMyFolder();
                $('#btnSaveCropImage').html('Save To My Folder');
            }).fail(function () {
                alert('fail');
                $('#btnSaveCropImage').html('Save To My Folder');
            });
        }
        else {
            alert('please crop the image.')
        }
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
    var attr = _.find(node.Attributes, function (item) {
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
        html += '<li class="list-group-item' + active + '" txtpbid="' + txtpbid + '">' + textList[i].innerHTML.replace(/<[^>]*>/g, '').short(40) + '</li>';
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
    var isFound = false;
    var html = '';
    var beforeHtml = '';
    var imgList = $("*[imgid]");
    var active = '';
    for (var i = 0; i < imgList.length; i++) {
        var size='';
        if ($(imgList[i]).attr('bgimage')) {
            size = currentImage.attr('bgimage');
        }
        else {
            size = imgList[i].width + 'X' + imgList[i].height;
        }
        var editimgid = $(imgList[i]).attr('imgid');
        if (editimgid == imgid) {
            active = ' active';
            isFound = true;
            if ($(imgList[i]).attr('bgimage')) {
                $('#txtCropWidth').val(size.substr(0, size.indexOf('X')));
                $('#txtCropHeight').val(size.substring(size.indexOf('X') + 1, size.length));
            }
            else {
                $('#txtCropWidth').val(imgList[i].width);
                $('#txtCropHeight').val(imgList[i].height);
            }
        }
        else {
            active = '';
        }
        if (isFound) {
            html += '<li class="list-group-item' + active + '" editimgid="' + editimgid + '"><div><img src="' + $(imgList[i]).attr('src') + '"/><div class="imageSize">' + size + '</div><div></li>';
        } else {
            beforeHtml += '<li class="list-group-item' + active + '" editimgid="' + editimgid + '"><div><img src="' + $(imgList[i]).attr('src') + '"/><div class="imageSize">' + size + '</div><div></li>';
        }

    }
    $('#imagePanel').html('<ul>' + html + beforeHtml + '</ul>');

    if (imgid != null) {
        searchNode(pagejson, 'imgid', imgid);
    }
    $('#pbImageModal').modal({
        backdrop: false,
        show: true
    });
}


