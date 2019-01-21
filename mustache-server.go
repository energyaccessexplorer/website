package main

import (
	"os"
	"strings"
	"flag"
	"github.com/hoisie/web"
	"github.com/hoisie/mustache"
)

var port string
var ip string

var layout = "templates/layout.mustache"

func all(ctx *web.Context, val string) string {
	if val == "" { val = "index" }
	var templt = "templates/" + val +  ".mustache"

	if _, err := os.Stat(templt); err != nil {
		ctx.NotFound("NO")
		return ""
	}

	return mustache.RenderFileInLayout(templt, layout, nil)
}

func main() {
	flag.StringVar(&ip,  "ip", "0.0.0.0", "IP address to liten on.")
	flag.StringVar(&port, "port", "9876", "Port to run on.")
	flag.Parse()

	web.Config.StaticDir = "public/"

	web.Get("/(.*)", all)

	web.Run(strings.Join([]string{ip, port}, ":"))
}
