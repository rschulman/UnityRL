package main

import (
	"code.google.com/p/go.net/websocket"
	"fmt"
	"net/http"
	"text/template"
	//"log"
)

type userMessage struct {
	messageType    string
	messageContent string
}

var rootTempl = template.Must(template.ParseFiles("index.html"))

func rootHandler(c http.ResponseWriter, req *http.Request) {
	rootTempl.Execute(c, req.Host)
}

func main() {
	var groundfloor *Level
	http.HandleFunc("/", rootHandler)
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))
	http.Handle("/ws", websocket.Handler(func(ws *websocket.Conn) {
		c := &Player{send: make(chan string, 256), ws: ws, id: 1, dlvl: 1, level: groundfloor, hp: 13, str: 8, dex: 8, intel: 8, wis: 8}
		groundfloor.register <- c
		defer func() { groundfloor.unregister <- c }()
		go c.writer()
		c.reader()
	}))
	fmt.Println("Creating new first level.")
	groundfloor = generate(1)
	groundfloor.buildlevel()
	go groundfloor.run()
	if err := http.ListenAndServe("localhost:8080", nil); err != nil {
		fmt.Println("error")
	}
}
