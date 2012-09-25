var WINDOWW = 0;
var WINDOWH = 0;
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

var drawMap = function (tempCopy, centery, centerx, layer, stage) {
    layer.clear();
    var tileswide = Math.floor(WINDOWW/15);
    var tilesheigh = Math.floor(WINDOWH/15);
    if (centerx < tileswide/2) {
        centerx = Math.floor(tileswide/2);
    }
    if (centery < tilesheigh/2) {
        centery = Math.floor(tilesheigh/2);
    }
    if (centerx > 999 - tileswide/2) {
        centerx = 999 - Math.floor(tileswide/2);
    }
    if (centery > 999 - tilesheigh/2) {
        centery = 999 - Math.floor(tilesheigh/2);
    }
    var fillcolor = "";
    var ytilecounter = 0;
    for (_j = centery - Math.floor(tilesheigh/2), _len2 = centery + Math.floor(tilesheigh/2); _j < _len2; _j++) {
      row = tempCopy[_j];
      var xtilecounter = 0;
      for (_x = centerx - Math.floor(tileswide/2), _len3 = centerx + Math.floor(tileswide/2); _x < _len3; _x++) {
        if (row[_x].visible) {
          if (row[_x].tile == "floor" || row[_x].tile == "upstair" || row[_x].tile == "downstair") {
            if (row[_x].selected == true) {
              fillcolor = "#A5E8A8";
            }
            else {
              fillcolor = "#E6E6E6";
            }
          }
          if (row[_x].tile == "wall") {
            if (row[_x].selected == true) {
              fillcolor = "#446143";
            }
            else {
              fillcolor = "#666666";
            }
          }
        }
        else if (row[_x].remembered) {
          if (row[_x].tile == "floor" || row[_x].tile == "upstair" || row[_x].tile == "downstair") {
            fillcolor = "#B2B2B2";
          }
          if (row[_x].tile == "wall") {
            fillcolor = "#333333";
          }
        }
        if (row[_x].visible || row[_x].remembered) {
          rect = new Kinetic.Rect({
                x: xtilecounter * 15,
                y: ytilecounter * 15,
                width: 15,
                height: 15,
                fill: fillcolor,
                stroke: "#556266",
                strokeWidth: "0.3"
              });
          layer.add(rect);
          if (row[_x].contents == "player") {
            playertext = new Kinetic.Text({
              text: "@",
              fontFamily: "monospace",
              fontSize: "10",
              x: (xtilecounter * 15) + 4,
              y: (ytilecounter * 15) + 11,
              textFill: 'black'
            });
            layer.add(playertext);
          }
          if (row[_x].tile == "upstair") {
          }
          if (row[_x].tile == "downstair") {
          }
        }
        xtilecounter++;
      }
      ytilecounter++;
    }
    stage.add(layer);
}

var constructMap = function (object_data, tempCopy, viewport) {
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
      if (typeof(tempCopy[point.Y][point.X].kin) != 'undefined') {
        if (tempCopy[point.Y][point.X].tile == "floor") {
          tempCopy[point.Y][point.X].kin.setFill("#E6E6E6");
        } else {
          tempCopy[point.Y][point.X].kin.setFill("#666666");
        }
      } else {
        if (tempCopy[point.Y][point.X].tile == "floor") {
          fillcolor = "#E6E6E6";
        } else {
          fillcolor = "#666666";
        }
        tempCopy[point.Y][point.X].kin = new Kinetic.Rect({
                x: point.X * 15,
                y: point.Y * 15,
                width: 15,
                height: 15,
                fill: fillcolor,
                stroke: "#556266",
                strokeWidth: "0.3"
              });
        viewport.add(tempCopy[point.Y][point.X].kin);
      }
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
	
  //drawMap(tempCopy, centery, centerx, layer, stage);

	return true;
}

$(document).ready(function() {
  $("#map").width($(document).innerWidth() - 30);
  WINDOWW = $("#map").width();
  $("#map").height($(document).innerHeight() - 30);
  WINDOWH = $("#map").height();
  var stage = new Kinetic.Stage({
    container: 'map',
    width: $("#map").width(),
    height: $("#map").height()
  });
  //var layer = new Kinetic.Layer();
  var viewport = new Viewport(stage);
  //layer.setClearBeforeDraw(true);
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
		};
	  }
	}
	
    var socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = function(message) {
      var servermessage = JSON.parse(message.data)
      switch(servermessage.MessageType) {
        case "update":
          console.log(servermessage)
          constructMap(servermessage, tempCopy, viewport);
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
        var message = {MessageType:"move"}
        switch (keycode) {
            case 104:
              message.MessageContent = "w";
              socket.send(JSON.stringify(message));
              break;
            case 106:
              message.MessageContent = "s";
              socket.send(JSON.stringify(message));
              break;
            case 107:
              message.MessageContent = "n";
              socket.send(JSON.stringify(message));
              break;
            case 108:
              message.MessageContent = "e";
              socket.send(JSON.stringify(message));
              break;
            case 121:
              message.MessageContent = "nw";
              socket.send(JSON.stringify(message));
              break;
            case 117:
              message.MessageContent = "ne";
              socket.send(JSON.stringify(message));
              break;
            case 98:
              message.MessageContent = "sw";
              socket.send(JSON.stringify(message));
              break;
            case 110:
              message.MessageContent = "se";
              socket.send(JSON.stringify(message));
              break;
            case 60:
              message.MessageContent = "up"
              socket.send(JSON.stringify(message));
              break;
            case 62:
              message.MessageContent = "down"
              socket.send(JSON.stringify(message));
              break;
        }
    });
});
