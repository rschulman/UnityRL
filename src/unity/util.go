package main

type tile struct { // single tile
	physical string             // "floor" or "wall" or "upstair" etc
	pcs      map[string]*Player // Who is in this particular tile
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

type moveorder struct {
	mover     string // its a hash
	direction string
}

type userMessage struct {
	MessageType    string
	MessageContent string
}
