package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

func checkAnswer(c echo.Context) error {
	ans := c.FormValue("answer")

	if ans == "じゆうのめがみ" {
		return c.String(http.StatusOK, "正解です")
	} else {
		return c.String(http.StatusOK, "不正解です")
	}
}

func main() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Logger.SetLevel(log.INFO)

	e.Static("/", "index")

	//rooting
	e.POST("/", checkAnswer)

	e.Logger.Fatal(e.Start(":1323"))
}
