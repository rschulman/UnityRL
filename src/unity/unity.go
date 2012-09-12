package main

import (
	"code.google.com/p/go.net/websocket"
	"fmt"
	"net/http"
	"text/template"
)

func (h *hub) run() {
	for {
		select {
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

func wsHandler(ws *websocket.Conn) {
	c := &Player{send: make(chan string, 256), ws: ws, dlvl: 1, hp: 13, str: 8, dex: 8, intel: 8, wis: 8}
	groundfloor.register <- c
	defer func() { groundfloor.unregister <- c }()
	go c.writer()
	c.reader()
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
