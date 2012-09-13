package main

import (
	"math"
)

// stubs... to be moved to their own files later.
type Mob struct{}

type tile struct { // single tile
	physical string // "floor" or "wall" or "upstair" etc

}

type point struct {
	x int
	y int
}

type room struct {
	x      int
	y      int
	width  int
	height int
}

type Level struct {
	MAXROWS, MAXCOLS int
	data             [][]tile
	players          map[string]Player
	mobs             map[int]Mob
	depth            uint

	register   chan *Player
	unregister chan *Player
}

func (l *Level) pov() {
	var vision int
	type positionMessage struct {
		pcs     map[string]Player
		mobs    map[int]Mob
		terrain map[string][]tile
	}
	vision = 8

	for _, subject := range l.players {
		messageInstace := new(positionMessage)
		messageInstance.pcs = make(map[string]Player)
		messageInstace.mobs = make(map[int]Mob)
		messageInstace.terrain = make(map[string][]tile)
		visited := make(map[int][]bool)

		for radian := 0; radian < Pi; radian += 0.025 {
			centerx := subject.location.x
			centery := subject.location.y
			xmove := Math.Cos(radian)
			ymove := Math.Sin(radian)
			wallbug := false
			for dist := 1; dist <= vision; dist++ {
				centerx += xmove
				centery += ymove
				if centerx < 0 || centerx > l.MAXCOLS || centery < 0 || centery > l.MAXROWS {
					break
				}
				// Check to see if this location has been scanned before.
				currx := Math.Floor(centerx)
				curry := Math.Floor(centery)
				if visited[currx][curry] == false {
					visited[currx][curry] = true
					messageInstace.terrain[l.data[currx][curry]].
				}
			}
		}
	}
}

func roomValid(l *Level, proposal room) bool {
	if proposal.x > 0 && proposal.y > 0 && proposal.y+proposal.height <= l.MAXROWS && proposal.x+proposal.width <= l.MAXCOLS {
		for row := proposal.y; row < proposal.y+proposal.height; row++ {
			for col := proposal.x; col < proposal.x+proposal.width; col++ {
				if l.data[col][row].physical != " " {
					return false
				}
			}
		}
		return true
	}
	return false
}

func (l *Level) digroom(proposal room) {
	for col := proposal.x - 1; col < proposal.x+proposal.width; col++ {
		l.data[col][proposal.y-1].physical = "wall"
		l.data[col][proposal.y+proposal.height].physical = "wall"
	}
	for row := proposal.y - 1; row < proposal.y+proposal.height; row++ {
		l.data[proposal.x-1][row].physical = "wall"
		l.data[proposal.x+proposal.width][row].physical = "wall"
	}
	for col := proposal.x; col < proposal.x+proposal.width-1; col++ {
		for row := proposal.y; row < proposal.y+proposal.height-1; row++ {
			l.data[col][row].physical = "floor"
		}
	}
}

func (l *Level) digpoint(target point) {
	for xmod := -1; xmod <= 1; xmod++ {
		for ymod := -1; ymod <= 1; ymod++ {
			if l.data[target.x+xmod][target.y+ymod].physical == " " {
				l.data[target.x+xmod][target.y+ymod].physical = "wall"
			}
		}
	}
	l.data[target.x][target.y].physical = "floor"
}

func (l *Level) buildlevel() {
	for x := 0; x <= int(l.MAXROWS); x++ {
		for y := 0; y <= int(l.MAXCOLS); y++ {
			l.data[x][y].physical = " "
		}
	}

	roomx := Math.rand.Intn(10) + 5
	roomy := Math.rand.Intn(10) + 5
	roomw := Math.rand.Intn(10) + 5
	roomh := Math.rand.Intn(10) + 5
	firstroom := room{roomx, roomy, roomw, roomh}
	l.digroom(firstroom)
	rooms := make([]room, 1)
	rooms[0] = room{roomx, roomy, roomw, roomh}
	for room_counter := 0; room_counter < 25; room_counter++ {
		valid := false
		var proposal room
		exitpoints := make([]point, 0)
		for valid == false {
			working_room := Math.rand.Intn(len(rooms))
			exitlength := Math.rand.Intn(7) + 5
			var startx, starty int
			switch Math.rand.Intn(4) + 1 {
			case 1: // North wall of the room
				exitx := Math.rand.Intn(int(rooms[working_room].height)) + rooms[working_room].x
				exity := rooms[working_room].y
				startx = exitx - Math.rand.Intn(roomw)
				starty = exity - roomh - exitlength - 1
				for hallways := 0; hallways < exitlength; hallways++ {
					exitpoints = append(exitpoints, point{exitx, exity + hallways})
				}
			case 2: // East wall of the room
				exitx := rooms[working_room].x + rooms[working_room].width
				exity := Math.rand.Intn(int(rooms[working_room].height)) + rooms[working_room].y
				startx = exitx + exitlength
				starty = exity - Math.rand.Intn(int(rooms[working_room].height))
				for hallways := 0; hallways < exitlength; hallways++ {
					exitpoints = append(exitpoints, point{exitx + hallways, exity})
				}
			case 3: // South wall of the room
				exitx := Math.rand.Intn(int(rooms[working_room].height)) + rooms[working_room].x
				exity := rooms[working_room].y + rooms[working_room].height
				startx = exitx - Math.rand.Intn(roomw)
				starty = exity + exitlength
				for hallways := 0; hallways < exitlength; hallways++ {
					exitpoints = append(exitpoints, point{exitx + hallways, exity})
				}
			case 4: // West wall of the room
				exitx := rooms[working_room].x
				exity := Math.rand.Intn(int(rooms[working_room].height)) + rooms[working_room].y
				startx = exitx - roomw - exitlength - 1
				starty = exity - Math.rand.Intn(int(roomh))
				for hallways := 0; hallways < exitlength; hallways++ {
					exitpoints = append(exitpoints, point{exitx + hallways, exity})
				}
			}

			proposal = room{startx, starty, roomw, roomh}
			valid = roomValid(l, proposal)
		}
		l.digroom(proposal)
		for iter := 0; iter < len(exitpoints); iter++ {
			l.digpoint(exitpoints[iter])
		}
		rooms = append(rooms, proposal)
	}
	stairdone := false
	for stairdone == false {
		stairx := Math.rand.Intn(l.MAXCOLS)
		stairy := Math.rand.Intn(l.MAXROWS)
		if l.data[stairx][stairy].physical == "floor" {
			l.data[stairx][stairy].physical = "upstair"
			stairdone = true
		}
	}
	stairdone = false
	for stairdone == false {
		stairx := Math.rand.Intn(l.MAXCOLS)
		stairy := Math.rand.Intn(l.MAXROWS)
		if l.data[stairx][stairy].physical == "floor" {
			l.data[stairx][stairy].physical = "downstair"
			stairdone = true
		}
	}
}

func generate(dlvl uint) Level {
	working := Level{MAXROWS: 999, MAXCOLS: 999}
	working.data = make([][]tile, working.MAXROWS)
	for i := range working.data {
		working.data[i] = make([]tile, working.MAXCOLS)
		for j := range working.data[i] {
			working.data[i][j] = tile{" "}
		}
	}
	working.register = make(chan *Player)
	working.unregister = make(chan *Player)
	working.players = make(map[string]Player)
	working.mobs = make(map[int]Mob)
	working.depth = dlvl
	return working
}