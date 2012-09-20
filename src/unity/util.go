package main

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

type moveorder struct {
	mover     int
	direction string
}
