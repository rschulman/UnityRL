var WINDOW = 40;
var getCursorPosition = function (e) {
    var x, y;
    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    var offset = $('#map').offset();
    x -= offset.left;
    y -= offset.top;
    return [Math.floor(y/15), Math.floor(x/15)];
}

var drawMap = function (tempCopy, centery, centerx) {
    if (centerx < WINDOW/2) {
        centerx = WINDOW/2;
    }
    if (centery < WINDOW/2) {
        centery = WINDOW/2;
    }
    if (centerx > 1000 - WINDOW/2) {
        centerx = 1000 - WINDOW/2;
    }
    if (centery > 1000 - WINDOW/2) {
        centery = 1000 - WINDOW/2;
    }
    var our_canvas = $('#map');
    var ctx = our_canvas.get(0).getContext('2d');
    var tilecounter = 0;
    ctx.fillStyle = "rgb(41,41,41)";
    ctx.lineWidth = .3;
    ctx.fillRect(0,0, our_canvas.width(), our_canvas.height());
    for (_j = centery - WINDOW/2, _len2 = centery + WINDOW/2; _j < _len2; _j++) {
      row = tempCopy[_j];
      for (_x = centerx - WINDOW/2, _len3 = centerx + WINDOW/2; _x < _len3; _x++) {
        ctx.strokeStyle = "rgb(85,98,102,0.2)";
        if (row[_x].visible) {
          if (row[_x].tile == "floor" || row[_x].tile == "upstair" || row[_x].tile == "downstair") {
            if (row[_x].selected == true) {
              ctx.fillStyle = "rgb(165,232,168)";
            }
            else {
              ctx.fillStyle = "rgb(230,230,230)";
            }
          }
          if (row[_x].tile == "wall") {
            if (row[_x].selected == true) {
              ctx.fillStyle = "rgb(68,97,67)";
            }
            else {
              ctx.fillStyle = "rgb(102,102,102)";
            }
          }
        }
        else if (row[_x].remembered) {
          if (row[_x].tile == "floor" || row[_x].tile == "upstair" || row[_x].tile == "downstair") {
            ctx.fillStyle = "rgb(178,178,178)";
          }
          if (row[_x].tile == "wall") {
            ctx.fillStyle = "rgb(51,51,51)";
          }
        }
        if (row[_x].visible || row[_x].remembered) {
          ctx.fillRect((tilecounter % 40) * 15, Math.floor(tilecounter/40) * 15, 15, 15); // Top, left, width, height
          ctx.strokeStyle = "rgb(85,98,102)";
          ctx.strokeRect((tilecounter % 40) * 15, Math.floor(tilecounter/40) * 15, 15, 15);
          ctx.fillStyle = "rgb(36,36,36)";
          if (row[_x].contents == "player") {
            ctx.font = "1.2em monospace"
            ctx.fillText("@", (tilecounter % 40) * 15 + 4, Math.floor(tilecounter/40) * 15 + 11);
          }
          if (row[_x].tile == "upstair") {
            ctx.font = "1.2em monospace"
            ctx.fillText("<", (tilecounter % 40) * 15 + 4, Math.floor(tilecounter/40) * 15 + 11);
          }
          if (row[_x].tile == "downstair") {
            ctx.font = "1.2em monospace"
            ctx.fillText(">", (tilecounter % 40) * 15 + 4, Math.floor(tilecounter/40) * 15 + 11);
          }
        }
        tilecounter++;
      }
    }
}

var constructMap = function (object_data, tempCopy) {
	var key, location, _ref;
	var col, row, _i, _j, _len, _len2;
    var userx, usery;

    for (_i = 0, _len = tempCopy.length; _i < _len; _i++) {
      row = tempCopy[_i];
      for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
        row[_j].visible = false;
        row[_j].contents = "";
      }
    }

	_ref = object_data.Terrain;
	for (key in _ref) {
		location = _ref[key];
		//console.log(location);
		var point, _i, _len;
		for (_i = 0, _len = location.length; _i < _len; _i++) {
		  point = location[_i];
		  tempCopy[point.Y][point.X].tile = key.toString();
		  tempCopy[point.Y][point.X].visible = true
		  tempCopy[point.Y][point.X].remembered = true
		}
	}
	
	var name, player;
	var players_data = object_data["PCs"];
	for (name in object_data["PCs"]) {
	  player = players_data[name];
	  tempCopy[player.Y][player.X].tile = "floor";
	  tempCopy[player.Y][player.X].contents = "player";
	  tempCopy[player.Y][player.X].id = player.id;
	  tempCopy[player.Y][player.X].visibile = true;
	  tempCopy[player.Y][player.X].remembered = true;
	}
	
	centerx = object_data.You.X
	centery = object_data.You.Y
	tempCopy[centery][centerx].tile = "floor"
	tempCopy[centery][centerx].contents = "player";
	tempCopy[centery][centerx].id = 0;
	tempCopy[centery][centerx].visible = true
	tempCopy[centery][centerx].remembered = false
	
    drawMap(tempCopy, centery, centerx);

	return true;
}

$(document).ready(function() {
	var tempCopy = [];
    var userx, usery;
	for (var row = 0; row <= 999; row++)
		tempCopy[row] = []
	for (var col = 0; col <= 999; col++) {
	  for (var row = 0; row <= 999; row++) {
	    tempCopy[row][col] = {
		  tile: "&nbsp;",
		  visible: false,
		  remembered: false
		};;
	  }
	}
	
    var socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = function(message) {
      var servermessage = JSON.parse(message.data)
      switch(servermessage.MessageType) {
        case "update":
          console.log(servermessage)
          constructMap(servermessage, tempCopy);
          break;
      }
    }
/*    socket.on('level chat', function(message) {
        $('#level').append(message + '</br>');
        $("#level").scrollTop($("#level")[0].scrollHeight);
    });
    
    socket.on('update', function (message) {
		console.log(message);
        userx = message.you[0];
        usery = message.you[1];
        constructMap(message, tempCopy);
    });
*/

    $('#levelChat').keypress(function(event) {
        if (event.which == 13) {
            var message = $('#levelChat').val();
            socket.emit('level chat', message);
            $('#levelChat').val('');
        }
		event.stopPropagation();
    });

	$("#map").click(function (event) {
		var infotext = "<p>A ";
        var relativecell = getCursorPosition(event);
        var visionx = userx;
        var visiony = usery;
        if (userx < WINDOW/2) {
            visionx = WINDOW/2;
        }
        if (usery < WINDOW/2) {
            visiony = WINDOW/2;
        }
        if (userx > 1000 - WINDOW/2) {
            visionx = 1000 - WINDOW/2;
        }
        if (usery > 1000 - WINDOW/2) {
            visiony = 1000 - WINDOW/2;
        }
        visiony -= WINDOW/2;
        visionx -= WINDOW/2;
        var absolutecell = [relativecell[0] + visiony, relativecell[1] + visionx];
        var tile = tempCopy[absolutecell[0]][absolutecell[1]];
        //console.log(tile);
        if (tile.selected == true) {
            tempCopy[absolutecell[0]][absolutecell[1]].selected = false;
            $("#info").html("");
        }
        else {
            var _i, _len, row, _j, _len2;
            for (_i = 0, _len = tempCopy.length; _i < _len; _i++) {
              row = tempCopy[_i];
              for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
                row[_j].selected = false;
              }
            }
            tempCopy[absolutecell[0]][absolutecell[1]].selected = true;
            if (tile.visible == true) {
                infotext += "visible ";
            }
            else if (tile.remembered == true) {
                infotext += "remembered ";
            }
            if (tile.tile == "upstair") {
                infotext += "up stair. ";
            }
            else if (tile.tile == "downstair") {
                infotext += "down stair.";
            }
            else if (tile.tile == "floor") {
                infotext += "floor.";
            }
            else if (tile.tile == "wall") {
                infotext += "wall.";
            }
            infotext += "</p><p>Contents:</p>"
            $("#info").html(infotext);
        }

        drawMap(tempCopy, usery, userx);
	});
	
    $('html').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        var message = {messageType:"move"}
        console.log(keycode);
        switch (keycode) {
            case 104:
              message.direction = "w";
              socket.send('move', JSON.stringify(message));
              break;
            case 106:
              message.direction = "s";
              socket.send('move', JSON.stringify(message));
              break;
            case 107:
              message.direction = "n";
              socket.send('move', JSON.stringify(message));
              break;
            case 108:
              message.direction = "e";
              socket.send('move', JSON.stringify(message));
              break;
            case 121:
              message.direction = "nw";
              socket.send('move', JSON.stringify(message));
              break;
            case 117:
              message.direction = "ne";
              socket.send('move', JSON.stringify(message));
              break;
            case 98:
              message.direction = "sw";
              socket.send('move', JSON.stringify(message));
              break;
            case 110:
              message.direction = "se";
              socket.send('move', JSON.stringify(message));
              break;
            case 60:
              message.direction = "up"
              socket.send('levelchange', JSON.stringify(message));
              break;
            case 62:
              message.direction = "down"
              socket.send('levelchange', JSON.stringify(message));
              break;
        }
    });
});
