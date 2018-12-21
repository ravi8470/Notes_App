function fetchAllNotes(offsetx){
    console.log("func called");
    var xhttp = new XMLHttpRequest();
    console.log("obj created");
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4  && this.status == 200){
            console.log("response received", this.responseText);
            var json = JSON.parse(this.response);
            console.log("json received is ", json); 
            console.log("Pages received: ",json.numPages);
            var x = "";
            var j = 0;
            var i = 1;
            if(offsetx > 3)
                i = offsetx - 2;
            for(; i <= json.numPages; i++){
                //console.log(i);
                var pp = "<input type='button' value='"+ i + "' onclick = fetchAllNotes("+ i + ")>";
                //console.log(pp);
                x = x + pp + " ";
                j++
                if(j == 5)
                    break;
            }
            document.getElementById('pageNumLinks').innerHTML = x;
            
            var notesContent = "";
            for(var i = 0;i < json.payload.length; i++){
                var dd = "Title: " + json.payload[i].title + " Note: " + json.payload[i].note_text;
                notesContent = notesContent + dd + "    <input type = 'button' value='Edit' onclick=editNote("+
                json.payload[i].note_id + ",'"+ json.payload[i].title + "','" + json.payload[i].note_text + 
                "')> <input type = 'button' value='Delete' onclick=deleteNote("+json.payload[i].note_id + ")>  <br>";
            }
            document.getElementById('notesArea').innerHTML = notesContent;
        }
    }
    xhttp.open("POST", "/fetchNotes", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({offset: offsetx})); 
}

function editNote(note_id, title, text){
    console.log("edit note called");
    var content = "<h3> Edit the Note: </h3>";
    content += "<form action='/updateNote' method='POST'>"
    content += "<input type = 'hidden' name = 'note_id' value = " + note_id + "><br>";
    content += "Title: <input type = 'text' value='" + title + "' name = 'noteTitle'><br>" ;
    content += "Text: <input type = 'text' value='" + text + "' name = 'noteBody'><br>";
    content += "<input type = 'submit' value='Apply'>"
    content += "</form>";
    console.log(content);
    document.getElementById('noteEditor').innerHTML = content;
}

function deleteNote(id){
    console.log("deeleteNote called with id =", id);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4  && this.status == 200){
            //console.log("resp for ajax call is ", this.response);
            document.getElementById("deleteResult").innerHTML = this.responseText;
            fetchAllNotes(1);
        }
    }
    xhttp.open("GET", "/deleteNote?note_id="+id, false);
    //xhttp.setRequestHeader("Content-type","application/json");
    //xhttp.send(JSON.stringify({note_id:id}));
    xhttp.send();
    console.log("reached end");
}