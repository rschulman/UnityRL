package main

import (
	"code.google.com/p/go.net/websocket"
	"encoding/json"
	"strings"
	"fmt"
)

type Player struct {
	ws *websocket.Conn
	id int

	send chan string

	dlvl     int
	level    *Level
	location point

	name string

	hp    int
	str   int
	dex   int
	intel int
	wis   int
}

func (c *Player) reader() {
	fmt.Println("Reading from websocket.")
	for {
		var message string
		var decode userMessage

		err := websocket.Message.Receive(c.ws, &message)
		fmt.Println(message)
		if err != nil {
			break
		}
		dec := json.NewDecoder(strings.NewReader(message))
		if err := dec.Decode(&decode); err != nil {
			fmt.Println(err)
			break
		}
		fmt.Print("New message from player", decode.MessageContent)
		switch decode.MessageType {
		case "move":
			c.level.playermove <- &moveorder{c.id, decode.MessageContent}
		}
	}
	c.ws.Close()
}

func (c *Player) writer() {
	fmt.Println("Writing loop started.")
	for message := range c.send {
		err := websocket.Message.Send(c.ws, message)
		if err != nil {
			break
		}
	}
	c.ws.Close()
}
