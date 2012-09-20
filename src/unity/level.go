package main

import (
	"math"
	"math/rand"
	"encoding/json"
	"fmt"
)

// stubs... to be moved to their own files later.
type Mob struct{}

type Level struct {
	MAXROWS, MAXCOLS int
	data             [][]tile
	players          map[int]*Player
	mobs             map[int]Mob
	depth            uint
	downstair        point
	upstair          point

	register   chan *Player
	unregister chan *Player
	playermove chan *moveorder
}

func (l *Level) run() {
	var newplayer *Player
	fmt.Println("Level 1 loop started")
	for {
		select {
		case move := <-l.playermove:
			fmt.Println("playermove")
			// Process the move and then call a pov if it succeeds.
			var movevector point
			switch move.direction {
			case "n":
				movevector = point{0, -1}
			case "ne":
				movevector = point{1, -1}
			case "e":
				movevector = point{1, 0}
			case "se":
				movevector = point{1, 1}
			case "s":
				movevector = point{0, 1}
			case "sw":
				movevector = point{-1, 1}
			case "w":
				movevector = point{-1, 0}
			case "nw":
				movevector = point{-1, -1}
			}
			newlocation := point{l.players[move.mover].location.x + movevector.x, l.players[move.mover].location.y + movevector.y}
			if newlocation.x <= l.MAXCOLS && newlocation.x > 0 && newlocation.y <= l.MAXROWS && newlocation.y > 0 && l.data[newlocation.x][newlocation.y].physical == "floor" || l.data[newlocation.x][newlocation.y].physical == "upstair" || l.data[newlocation.x][newlocation.y].physical == "downstair" {
				l.players[move.mover].location.x = newlocation.x
				l.players[move.mover].location.y = newlocation.y
				go l.pov()
			}
		case newplayer = <-l.register:
			fmt.Println("Level: New player registered")
			newplayer.location = point{l.upstair.x, l.upstair.y}
			l.players[newplayer.id] = newplayer
			go l.pov()
		}
	}
}

func (l *Level) pov() {
	var vision int

	type ExportPoint struct {
		X, Y int
	}

	type positionMessage struct {
		MessageType string
		PCs         map[string]Player
		Mobs        map[string]Mob
		Terrain     map[string][]ExportPoint
		You         ExportPoint
	}

	vision = 8

	for _, subject := range l.players {
		messageInstance := new(positionMessage)
		messageInstance.PCs = make(map[string]Player)
		messageInstance.Mobs = make(map[string]Mob)
		messageInstance.Terrain = make(map[string][]ExportPoint)
		messageInstance.MessageType = "update"
		visited := make(map[ExportPoint]bool)

		for radian := 0.0; radian < math.Pi; radian += 0.025 {
			centerx := float64(subject.location.x)
			centery := float64(subject.location.y)
			xmove := math.Cos(radian)
			ymove := math.Sin(radian)
			//wallbug := false
			for dist := 1; dist <= vision; dist++ {
				centerx += xmove
				centery += ymove
				if centerx < 0 || int(centerx) > l.MAXCOLS || centery < 0 || int(centery) > l.MAXROWS {
					break
				}
				curr := ExportPoint{int(math.Floor(centerx)), int(math.Floor(centery))}
				if l.data[curr.X][curr.Y].physical == " " { // We're looking into a wall, so we can safely stop right now.
					continue
				}
				// Check to see if this location has been scanned before.
				if visited[curr] == false {
					visited[curr] = true
					messageInstance.Terrain[l.data[curr.X][curr.Y].physical] = append(messageInstance.Terrain[l.data[curr.X][curr.Y].physical], curr)
				}
			}
		}
		messageInstance.You = ExportPoint{subject.location.x, subject.location.y}
		m, err := json.Marshal(messageInstance)
		fmt.Println(messageInstance)
		if err == nil {
			subject.send <- string(m)
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
	for x := 0; x < int(l.MAXROWS); x++ {
		for y := 0; y < int(l.MAXCOLS); y++ {
			l.data[x][y].physical = " "
		}
	}

	roomx := rand.Intn(10) + 5
	roomy := rand.Intn(10) + 5
	roomw := rand.Intn(10) + 5
	roomh := rand.Intn(10) + 5
	firstroom := room{roomx, roomy, roomw, roomh}
	l.digroom(firstroom)
	rooms := make([]room, 1)
	rooms[0] = room{roomx, roomy, roomw, roomh}
	for room_counter := 0; room_counter < 25; room_counter++ {
		valid := false
		var proposal room
		exitpoints := make([]point, 0)
		for valid == false {
			working_room := rand.Intn(len(rooms))
			exitlength := rand.Intn(7) + 5
			var startx, starty int
			switch rand.Intn(4) + 1 {
			case 1: // North wall of the room
				exitx := rand.Intn(int(rooms[working_room].height)) + rooms[working_room].x
				exity := rooms[working_room].y
				startx = exitx - rand.Intn(roomw)
				starty = exity - roomh - exitlength - 1
				for hallways := 0; hallways < exitlength; hallways++ {
					exitpoints = append(exitpoints, point{exitx, exity + hallways})
				}
			case 2: // East wall of the room
				exitx := rooms[working_room].x + rooms[working_room].width
				exity := rand.Intn(int(rooms[working_room].height)) + rooms[working_room].y
				startx = exitx + exitlength
				starty = exity - rand.Intn(int(rooms[working_room].height))
				for hallways := 0; hallways < exitlength; hallways++ {
					exitpoints = append(exitpoints, point{exitx + hallways, exity})
				}
			case 3: // South wall of the room
				exitx := rand.Intn(int(rooms[working_room].height)) + rooms[working_room].x
				exity := rooms[working_room].y + rooms[working_room].height
				startx = exitx - rand.Intn(roomw)
				starty = exity + exitlength
				for hallways := 0; hallways < exitlength; hallways++ {
					exitpoints = append(exitpoints, point{exitx + hallways, exity})
				}
			case 4: // West wall of the room
				exitx := rooms[working_room].x
				exity := rand.Intn(int(rooms[working_room].height)) + rooms[working_room].y
				startx = exitx - roomw - exitlength - 1
				starty = exity - rand.Intn(int(roomh))
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
		stairx := rand.Intn(l.MAXCOLS)
		stairy := rand.Intn(l.MAXROWS)
		if l.data[stairx][stairy].physical == "floor" {
			l.data[stairx][stairy].physical = "upstair"
			l.upstair.x = stairx
			l.upstair.y = stairy
			stairdone = true
		}
	}
	stairdone = false
	for stairdone == false {
		stairx := rand.Intn(l.MAXCOLS)
		stairy := rand.Intn(l.MAXROWS)
		if l.data[stairx][stairy].physical == "floor" {
			l.data[stairx][stairy].physical = "downstair"
			l.downstair.x = stairx
			l.downstair.y = stairy
			stairdone = true
		}
	}
}

func generate(dlvl uint) *Level {
	working := &Level{MAXROWS: 999, MAXCOLS: 999}
	working.data = make([][]tile, working.MAXROWS)
	for i := range working.data {
		working.data[i] = make([]tile, working.MAXCOLS)
		for j := range working.data[i] {
			working.data[i][j] = tile{" "}
		}
	}
	working.register = make(chan *Player)
	working.unregister = make(chan *Player)
	working.playermove = make(chan *moveorder)
	working.players = make(map[int]*Player)
	working.mobs = make(map[int]Mob)
	working.depth = dlvl
	return working
}
