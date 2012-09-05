package main

type Player struct {
	ws *websocket.Conn

	send chan string

	dlvl int

	hp    int
	str   int
	dex   int
	intel int
	wis   int
}

func (c *Player) reader() {
	for {
		var message string
		err := websocket.Message.Receive(c.ws, &message)
		if err != nil {
			break
		}
		h.broadcast <- message
	}
	c.ws.Close()
}

func (c *Player) writer() {
	for message := range c.send {
		err := websocket.Message.Send(c.ws, message)
		if err != nil {
			break
		}
	}
	c.ws.Close()
}
