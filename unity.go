// You can edit this code!
// Click here and start typing.
package main

import (
	"fmt"
	"net/http"
	"code.google.com/p/go.net/websocket"
	"text/template"
)

type connection struct {
	ws *websocket.Conn

	send chan string
}

func (c *connection) reader() {
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

func (c *connection) writer() {
	for message := range c.send {
		err := websocket.Message.Send(c.ws, message)
		if err != nil {
			break
		}
	}
	c.ws.Close()
}

func wsHandler(ws *websocket.Conn) {
	c := &connection{send: make(chan string, 256), ws: ws}
	h.register <- c
	defer func() { h.unregister <- c }()
	go c.writer()
	c.reader()
}

type hub struct {
	// Registered connections.
	connections map[*connection]bool

	// Inbound messages from the connections.
	broadcast chan string

	// Register requests from the connections.
	register chan *connection

	// Unregister requests from connections.
	unregister chan *connection
}

func (h *hub) run() {
	for {
		select {
		case c := <-h.register:
			h.connections[c] = true
		case c := <-h.unregister:
			delete(h.connections, c)
			close(c.send)
		case m := <-h.broadcast:
			for c := range h.connections {
				select {
				case c.send <- m:
				default:
					delete(h.connections, c)
					close(c.send)
					go c.ws.Close()
				}
			}
		}
	}
}

var rootTempl = template.Must(template.ParseFiles("index.html"))

func rootHandler(c http.ResponseWriter, req *http.Request) {
	rootTempl.Execute(c, req.Host)
}

func main() {
	http.HandleFunc("/", rootHandler)
	http.Handle("/ws", websocket.Handler(wsHandler))
	if err := http.ListenAndServe("localhost:8080", nil); err != nil {
		fmt.Println("error")
	}
	var groundfloor = generate(1)
	groundfloor.buildlevel()
}
