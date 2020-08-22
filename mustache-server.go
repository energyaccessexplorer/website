package main

import (
	"flag"
	"github.com/hoisie/mustache"
	"github.com/hoisie/web"
	"os"
	"strings"
)

var (
	port string
	ip   string
)

func all(ctx *web.Context, v string) string {
	if v == "" {
		v = "index"
	}
	templt := "templates/" + v + ".mustache"
	_, err := os.Stat(templt)

	if err != nil {
		ctx.NotFound(err.Error())
		return ""
	}

	return mustache.RenderFileInLayout(templt, "templates/layout.mustache", nil)
}

func main() {
	flag.StringVar(&ip, "ip", "0.0.0.0", "IP address to listen on.")
	flag.StringVar(&port, "port", "9876", "Port to run on.")
	flag.Parse()

	web.Config.StaticDir = "assets/"

	web.Get("/(.*)", all)

	web.Run(strings.Join([]string{ip, port}, ":"))
}
