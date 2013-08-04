var WINDOWW = 0;
var WINDOWH = 0;
var visCenter;

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

var drawMap = function (tempCopy, centery, centerx, ctx) {
    var ytilecounter = 0;
    var zoomlevel = 1;
    var tileswide = Math.floor(WINDOWW/(15 * zoomlevel));
    var tilesheigh = Math.floor(WINDOWH/(15 * zoomlevel));
    ctx.lineWidth = .3;

    if (typeof(visCenter) == "undefined" || centerx < visCenter.X - tileswide/2 || centerx > visCenter.X + tileswide/2 || centery < visCenter.Y - tilesheigh/2 || centery > visCenter.Y + tilesheigh/2) {
      visCenter = {X: centerx, Y: centery};
      if (centerx < tileswide/2) {
          visCenter.X = Math.floor(tileswide/2);
      }
      if (centery < tilesheigh/2) {
          visCenter.Y = Math.floor(tilesheigh/2);
      }
      if (centerx > 999 - tileswide/2) {
          visCenter.X = 999 - Math.floor(tileswide/2);
      }
      if (centery > 999 - tilesheigh/2) {
          visCenter.Y = 999 - Math.floor(tilesheigh/2);
      }
    }

    var fillcolor = "";
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,WINDOWW, WINDOWH);

    for (_j = visCenter.Y - Math.floor(tilesheigh/2), _len2 = visCenter.Y + Math.floor(tilesheigh/2); _j < _len2; _j++) {
      row = tempCopy[_j];
      var xtilecounter = 0;
      for (_x = visCenter.X - Math.floor(tileswide/2), _len3 = visCenter.X + Math.floor(tileswide/2); _x < _len3; _x++) {
        if (row[_x].visible) {
          if (row[_x].tile == "floor" || row[_x].tile == "upstair" || row[_x].tile == "downstair") {
            fillcolor = "#E6E6E6";
          }
          if (row[_x].tile == "wall") {
            fillcolor = "#666666";
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
          ctx.fillStyle = fillcolor;
          ctx.fillRect(xtilecounter * 15 * zoomlevel, ytilecounter * 15 * zoomlevel, 15 * zoomlevel, 15 * zoomlevel);
          ctx.fillStyle = "#556266";
          ctx.strokeRect(xtilecounter * 15 * zoomlevel, ytilecounter * 15 * zoomlevel, 15 * zoomlevel, 15 * zoomlevel);
          if (row[_x].contents == "player") {
            ctx.font = "13px Calibri";
            ctx.fillStyle = "#000000";
            ctx.fillText("@", (xtilecounter * 15 * zoomlevel) + 2, (ytilecounter * 15 * zoomlevel) + 11);
          }
          if (row[_x].tile == "upstair") {
            ctx.font = "13px Calibri";
            ctx.fillStyle = "#000000";
            ctx.fillText("<", (xtilecounter * 15 * zoomlevel) + 2, (ytilecounter * 15 * zoomlevel) + 11);
          }
          if (row[_x].tile == "downstair") {
            ctx.font = "13px Calibri";
            ctx.fillStyle = "#000000";
            ctx.fillText(">", (xtilecounter * 15 * zoomlevel) + 2, (ytilecounter * 15 * zoomlevel) + 11);
          }
        }
        xtilecounter++;
      }
      ytilecounter++;
    }
}

var constructMap = function (object_data, tempCopy, ctx) {
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
	for (pcid in object_data["PCs"]) {
	  player = players_data[pcid];
	  tempCopy[player.Location.Y][player.Location.X].contents = "player";
	  tempCopy[player.Location.Y][player.Location.X].id = player.id;
	  tempCopy[player.Location.Y][player.Location.X].visibile = true;
	  tempCopy[player.Location.Y][player.Location.X].remembered = true;
	}
	playerx = object_data.You.X
	playery = object_data.You.Y
	tempCopy[playery][playerx].contents = "player";
	tempCopy[playery][playerx].id = 0;
	tempCopy[playery][playerx].visible = true
	tempCopy[playery][playerx].remembered = false
	
  drawMap(tempCopy, playery, playerx, ctx);

	return true;
}

$(document).ready(function() {
  $("#map").width($(document).innerWidth() - 20);
  $("#map").prop('width', $(document).innerWidth() - 20);
  WINDOWW = $("#map").width();
  $("#map").height($(document).innerHeight() - 20);
  $("#map").prop('height', $(document).innerHeight() - 20);
  WINDOWH = $("#map").height();

  $("#lchat").css("top", $(document).innerHeight() - 165);
  $("#lchat").hide();

  $("#login").css('top', $(document).innerHeight()/2 - 50);
  $("#login").css('left', $(document).innerWidth()/2 - 125);

  var canvas = document.getElementById("map");
  var ctx = canvas.getContext("2d");
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

  $('#login').keypress(function(event) {
    if (event.which == 13) {
        var message = {MessageType:"login", MessageContent: $('#logintext').val()};
        socket.send(JSON.stringify(message));
        $('#login').val('');
        $('#login').hide();
        $("#lchat").show();
    }
    event.stopPropagation();
  });

  $('#levelchat').keypress(function(event) {
      if (event.which == 13) {
          var message = {MessageType:"levelchat", MessageContent: $('#levelchat').val()};
          socket.send(JSON.stringify(message));
          $('#levelchat').val('');
      }
  event.stopPropagation();
  });

  socket.onmessage = function(message) {
    var servermessage = JSON.parse(message.data)
    switch(servermessage.MessageType) {
      case "update":
        console.log(servermessage)
        constructMap(servermessage, tempCopy, ctx);
        break;
      case "levelchat":
        $('#lchat').append(servermessage.MessageContent + '</br>');
        $("#lchat").scrollTop($("#level")[0].scrollHeight);
        break;
    }
  };
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
	*/
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
