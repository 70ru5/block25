package main

import (
	"database/sql"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"

	_ "github.com/mattn/go-sqlite3"
)

const DBPath = "./db/block25.sqlite3"

type ServerImpl struct {
	DB *sql.DB
}

type Quiz struct {
	ID         int    `json:"id"`
	Question   string `json:"question"`
	CorrectAns string `json:"correct_ans"`
	AnsLength  int    `json:"ans_length"`
	AnsType    int    `json:"ans_type"`
	ImgPath    string `json:"img_path"`
}

func (s *ServerImpl) pickRandomQuiz() (Quiz, error) {
	var quiz Quiz
	const pickRandomQuiz = "SELECT * FROM quizzes ORDER BY RANDOM() LIMIT 1; "
	row := s.DB.QueryRow(pickRandomQuiz)
	err := row.Scan(&quiz.ID, &quiz.Question, &quiz.CorrectAns, &quiz.AnsLength, &quiz.AnsType, &quiz.ImgPath)
	if err != nil {
		return Quiz{}, err
	}

	return quiz, nil
}

func (s *ServerImpl) giveQuiz(c echo.Context) error {
	quiz, err := s.pickRandomQuiz()
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, quiz)
}

func (s *ServerImpl) checkAnswer(c echo.Context) error {
	ans := c.FormValue("userAns")
	quizID := c.FormValue("quizID")

	var quiz Quiz
	const selectCorrectAnswer = "SELECT correctAns FROM quizzes WHERE id = ?"
	row := s.DB.QueryRow(selectCorrectAnswer, quizID)
	err := row.Scan(&quiz.CorrectAns)
	if err != nil {
		return err
	}

	if ans == quiz.CorrectAns {
		return c.String(http.StatusOK, "正解です")
	} else {
		return c.String(http.StatusOK, "不正解です")
	}
}

// 　connectDB opens database connection.
func connectDB(dbPath string) (*sql.DB, error) {
	dbCon, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	return dbCon, nil
}

func main() {
	e := echo.New()

	// connect to database
	dbCon, err := connectDB(DBPath)
	if err != nil {
		log.Errorf("Error while connecting to database: %w", err)
	}
	defer dbCon.Close()

	db := ServerImpl{DB: dbCon}

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Logger.SetLevel(log.INFO)

	frontURL := os.Getenv("FRONT_URL")
	if frontURL == "" {
		frontURL = "http://localhost:1323"
	}
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{frontURL},
		AllowMethods: []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete},
	}))

	e.Static("/", "index")

	//rooting
	e.GET("/quiz", db.giveQuiz)
	e.POST("/", db.checkAnswer)

	e.Logger.Fatal(e.Start(":1323"))
}
