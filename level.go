package main

import "math/rand"

type Player struct {}
type Mob struct {}

type tile struct { // single tile
    physical string // "floor" or "wall" or "upstair" etc

}

type point struct {
    x int
    y int
}

type room struct {
    x uint
    y uint
    width uint
    height uint
}

type Level struct {
    MAXROWS, MAXCOLS uint
    data [][]tile
    players map[string]Player
    mobs map[int]Mob
    depth uint
}

func roomValid(l *Level, proposal room) bool {
    if proposal.x > 0 && proposal.y > 0 && proposal.y + proposal.height <= l.MAXROWS && proposal.x + proposal.width <= l.MAXCOLS {
        for row := proposal.y; row < proposal.y + proposal.height; row++ {
            for col := proposal.x; col < proposal.x + proposal.width; col++ {
                if l.data[col][row].physical != " " {
                    return false
                }
            }
        }
        return true
    } else {
        return false
    }
}

func (l *Level) buildlevel () {
    for x := 0; x <= int(l.MAXROWS); x++ {
        for y := 0; y <= int(l.MAXCOLS); y++ {
            l.data[x][y].physical = " "
        }
    }

    roomx := uint(rand.Intn(10) + 5)
    roomy := uint(rand.Intn(10) + 5)
    roomw := uint(rand.Intn(10) + 5)
    roomh := uint(rand.Intn(10) + 5)
    digroom(roomx, roomy, roomw, roomh, l.data)
    rooms := make([]room, 1)
    rooms[0] = room{roomx, roomy, roomw, roomh}
    for room_counter := 0; room_counter < 25; room_counter++ {
        valid := false
        for valid == false {
            working_room := rand.Intn(len(rooms))
            exitlength := rand.Intn(7) + 5
            exitpoints := make([]point, 0)
            switch rand.Intn(4) + 1 {
            case 1: // North wall of the room
                exitx := rand.Intn(int(rooms[working_room].height)) + rooms[working_room].x
                exity := rooms[working_room].y
                startx := exitx - rand.Intn(roomw)
                starty := exity - roomh - exitlength - 1
                for hallways := 0; hallways < exitlength; hallways ++ {
                    exitpoints.append(point{exitx, exity + hallways})
                }
            case 2: // East wall of the room
                exitx := rooms[working_room].x + rooms[working_room].width
                exity := rand.Intn(int(rooms[working_room].height)) + rooms[working_room].y
                startx := exitx + exitlength
                starty := exity - rand.Intn(int(rooms[working_room].height))
                for hallways := 0; hallways < exitlength; hallways ++ {
                    exitpoints.append(point{exitx + hallways, exity})
                }
            case 3: // South wall of the room
                exitx := rand.Intn(int(rooms[working_room].height)) + rooms[working_room].x
                exity := rooms[working_room].y + rooms[working_room].height
                startx := exitx - rand.Intn(roomw)
                starty := exity + exitlength
                for hallways := 0; hallways < exitlength; hallways ++ {
                    exitpoints.append(point{exitx + hallways, exity})
                }
            case 4: // West wall of the room
                exitx := rooms[working_room].x
                exity := rand.Intn(int(rooms[working_room].height)) + rooms[working_room].y
                startx := exitx - roomw - exitlength - 1
                starty := exity - rand.Intn(int(roomh))
                for hallways := 0; hallways < exitlength; hallways ++ {
                    exitpoints.append(point{exitx + hallways, exity})
                }
            }

            proposal := room{startx, starty, roomw, roomh}
            valid = roomValid(l, proposal)
        }
        digroom(l, proposal)
        rooms.append(proposal)
    }
    stairdone := false
    for stairdone == false {
        stairx := rand.Intr(l.MAXCOLS)
        stairy := rand.Intr(l.MAXROWS)
        if l.data[stairx][stairy] == "floor" {
            l.data[stairx][stairy] = "upstair"
            stairdone = true;
        }
    }
    stairdone = false
    for stairdone == false {
        stairx := rand.Intr(l.MAXCOLS)
        stairy := rand.Intr(l.MAXROWS)
        if l.data[stairx][stairy] == "floor" {
            l.data[stairx][stairy] = "downstair"
            stairdone = true;
        }
    }
}

func generate (dlvl uint) Level {
    working := Level{MAXROWS:999, MAXCOLS:999}
    working.data = make([][]tile, working.MAXROWS)
    for i := range working.data {
        working.data[i] = make([]tile, working.MAXCOLS)
        for j := range working.data[i] {
            working.data[i][j] = tile{" "}
        }
    }
    working.players = make(map[string]Player)
    working.mobs = make(map[int]Mob)
    working.depth = dlvl
    return working
}