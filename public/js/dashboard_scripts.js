//an implementation example, which sets click handler for delete elements of all notifications on the page, in Vanilla Javascript. 
document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
        $notification = $delete.parentNode;
        $delete.addEventListener('click', () => {
            $notification.parentNode.removeChild($notification);
        });
    });
});

function fetchAllNotes(offsetx) {
    document.getElementById("notesArea").innerHTML = "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.response);
            var x = "";
            var j = 0;
            var i = 1;
            if (offsetx > 3) {
                if (offsetx + 2 <= json.numPages) {
                    i = offsetx - 2;
                } else if (offsetx + 1 == json.numPages) {
                    i = offsetx - 3;
                } else if (offsetx == json.numPages) {
                    i = offsetx - 4;
                    if (i == 0) {
                        i = 1;
                    }
                }
            }

            for (; i <= json.numPages; i++) {
                var pp = "<input type='button' class='button is-primary' value='" + i + "' onclick = fetchAllNotes(" + i + ")>";
                x = x + pp + " ";
                j++;
                if (j == 5) break;
            }
            document.getElementById("pageNumLinks").innerHTML = x;

            var notesContent = "";
            if (json.payload.length > 0) {
                notesContent += "<table class='table'><thead><tr><th>Title</th><th>Text</th><th>Edit</th><th>Delete</th>\
            </tr></thead><tbody>";
                for (var i = 0; i < json.payload.length; i++) {
                    notesContent += makeRows(json.payload[i].title, json.payload[i].note_text, json.payload[i].note_id);
                }
                notesContent += "</tbody></table>";
                document.getElementById("notesArea").innerHTML = notesContent;
            }

        }
    };
    xhttp.open("POST", "/fetchNotes", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({ offset: offsetx }));
}

function editNote(note_id, title, text) {
    var content = '<label class="label is-medium">Edit note:</label>';
    content += "<form action='/updateNote' method='POST'>";
    content += "<input type = 'hidden' name = 'note_id' value = " + note_id + "><br>";
    content += '<div class="field">\
    <div class="control is-4 column">\
        <input id ="editInputTitle" class="input is-rounded" type="text" name="noteTitle" value="'+ title + '" required placeholder="Note Title" />\
    </div>\
    </div>';
    content += '<div class="field">\
        <div class="control  is-4 column">\
        <textarea class="textarea" name="noteBody"  minlength="10" required placeholder="Note Body">'+ text + '</textarea>\
        </div>\
    </div>';
    content += '<div class="control is-4 column">\
        <button class="button is-primary" type="submit" name="submit">Save Changes</button>\
    </div>';
    content += "</form><hr>";
    document.getElementById("noteEditor").innerHTML = content;
    document.getElementById('editInputTitle').focus();
}

function deleteNote(id) {
    var xhttp = new XMLHttpRequest();
    var flag;
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == 'success') {
                document.getElementById('deleteResultSuccess').style.display = 'block';
                flag = 2;
            }
            else {
                document.getElementById('deleteResultFailure').style.display = 'block';
                flag = 4;
            }
            fetchAllNotes(1);
            if (document.getElementById("searchRes").innerHTML != "") {
                searchNotes();
            }
            if (flag == 2) {
                document.getElementById('deleteResultSuccess').focus();
            }
            else if (flat == 4) {
                document.getElementById('deleteResultFailure').focus();
            }
        }
    };
    xhttp.open("GET", "/deleteNote?note_id=" + id, false);
    //xhttp.setRequestHeader("Content-type","application/json");
    //xhttp.send(JSON.stringify({note_id:id}));
    xhttp.send();
}

function searchNotes() {
    var searchT = document.getElementById("searchTerm").value;
    if (searchT == "")
        return;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.response);
            window.searchResult = json.searchResult;
            var content = "";
            window.numPages = Math.ceil(json.searchResult.length / 4);
            content += "<table class='table'><thead><tr><th>Title</th><th>Text</th><th>Edit</th><th>Delete</th>\
            </tr></thead><tbody>";
            for (var i = 0; i < json.searchResult.length && i < 4; i++) {
                content += makeRows(json.searchResult[i].title, json.searchResult[i].note_text, json.searchResult[i].note_id);
            }
            content += "</tbody></table>";
            var x = "";
            for (var i = 1, j = 0; i <= window.numPages && j < 5; i++ , j++) {
                var pp = "<input type='button' class='button is-primary' value='" + i + "'onclick = shiftsearchRes(" + i + ")>";
                x = x + pp + " ";
            }
            document.getElementById("pageLinksForSearch").innerHTML = x;
            if (json.searchResult.length == 0) {
                document.getElementById("searchRes").innerHTML =
                    "<font color = 'RED'> No matches </font>";
            } else {
                document.getElementById("searchRes").innerHTML = content;
            }
            location.href = "#";
            location.href = "#searchRes";
        }
    };
    xhttp.open("GET", "/searchNotes?searchTerm=" + searchT, true);
    xhttp.send();
}

function deleteThis(obj) {
    var p = obj.parentNode;
    var q = p.parentNode;
    q.removeChild(p);
}

function shiftsearchRes(pageNum) {
    var pageShiftBegn = 1;
    if (pageNum > 3) {
        if (pageNum + 2 <= window.numPages) {
            pageShiftBegn = pageNum - 2;
        } else if (pageNum + 1 == window.numPages) {
            pageShiftBegn = pageNum - 3;
        } else if (pageNum == window.numPages) {
            pageShiftBegn = pageNum - 4;
            if (pageShiftBegn == 0) pageShiftBegn = 1;
        }
    }
    var x = "";
    for (var i = pageShiftBegn, j = 0; i <= window.numPages && j < 5; i++ , j++) {
        var pp = "<input type='button' class='button is-primary' value='" + i + "' onclick = shiftsearchRes(" + i + ")>";
        x = x + pp + " ";
    }
    document.getElementById("pageLinksForSearch").innerHTML = x;
    x = "";
    var content = "";
    content += "<table class='table'><thead><tr><th>Title</th><th>Text</th><th>Edit</th><th>Delete</th>\
            </tr></thead><tbody>";
    for (i = (pageNum - 1) * 4, j = 0; j < 4 && i < window.searchResult.length; i++ , j++) {
        content += makeRows(window.searchResult[i].title, window.searchResult[i].note_text, window.searchResult[i].note_id);
    }
    content += "</tbody></table>";
    document.getElementById("searchRes").innerHTML = content;
}

function makeRows(title, text, id) {
    var x = "";
    x += "<tr><td>" + title + "</td><td>" + text + "</td><td>" + "<button class='button is-primary' onclick=editNote(" +
        id + ",'" + title + "','" + text + "')>Edit</button></td><td><button class= 'button is-danger' onclick=deleteNote(" +
        id + ")>Delete</button></td></tr>";
    return x;
}