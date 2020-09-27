package main

import (
	"fmt"
	"github.com/cbroglie/mustache"
	"os"
	"strings"
)

func view(v string) string {
	v = strings.Replace(v, "/", "", -1)

	if v == "" {
		v = "index"
	}

	templt := "templates/" + v + ".mustache"
	_, err := os.Stat(templt)
	if err != nil {
		panic(err.Error())
	}

	r, err := mustache.RenderFileInLayout(templt, "templates/layout.mustache", nil)
	if err != nil {
		panic(err.Error())
	}

	return r
}

func main() {
	fmt.Print(view(os.Args[1]))
}
