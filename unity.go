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

var rootTempl = template.Must(template.ParseFiles("index.html"))

func rootHandler (c http.ResponseWriter, req *http.Request) {
    rootTempl.Execute(c, req.Host)
}

func main() {
    http.HandleFunc("/", rootHandler)
    if err := http.ListenAndServe("localhost:8080", nil); err != nil {
        fmt.Println("error")
    }
    var level = generate(1)
    level.buildlevel()

}