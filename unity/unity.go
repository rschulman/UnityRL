package main

import (
	"code.google.com/p/go.net/websocket"
	"fmt"
	"net/http"
	"text/template"
	"encoding/json"
	"crypto/md5"
	"io"
	//"log"
)

var rootTempl = template.Must(template.ParseFiles("index.html"))
var groundfloor *Level

func rootHandler(c http.ResponseWriter, req *http.Request) {
	rootTempl.Execute(c, req.Host)
}

func loginUser(ws *websocket.Conn) {
	for {
		var message string
		var decode userMessage

		err := websocket.Message.Receive(ws, &message)
		fmt.Println(message)
		if err != nil {
			break
		}
		err = json.Unmarshal([]byte(message), &decode)
		if decode.MessageType == "login" {
			var h = md5.New()
			io.WriteString(h, decode.MessageContent)
			c := &Player{send: make(chan string, 256), ws: ws, name: decode.MessageContent, id: fmt.Sprintf("%x", h.Sum(nil)), dlvl: 1, level: groundfloor, hp: 13, str: 8, dex: 8, intel: 8, wis: 8}
			groundfloor.register <- c
			defer func() { groundfloor.unregister <- c }()
			go c.writer()
			c.reader()
		}
	}
}

func main() {
	http.HandleFunc("/", rootHandler)
	http.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("assets"))))
	http.Handle("/ws", websocket.Handler(func(ws *websocket.Conn) {
		loginUser(ws)
	}))
	fmt.Println("Creating new first level.")
	groundfloor = generate(1)
	groundfloor.buildlevel()
	go groundfloor.run()
	if err := http.ListenAndServe("localhost:8080", nil); err != nil {
		fmt.Println("error")
	}
}
