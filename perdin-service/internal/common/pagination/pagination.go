package pagination

import (
	"net/http"
	"strconv"
)

const (
	DefaultPage  = 1
	DefaultLimit = 10

	MaxLimit = 100
)

type Request struct {
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

func (r *Request) Normalize() {

	if r.Page <= 0 {
		r.Page = DefaultPage
	}

	if r.Limit <= 0 {
		r.Limit = DefaultLimit
	}

	if r.Limit > MaxLimit {
		r.Limit = MaxLimit
	}
}

func (r Request) Offset() int {
	return (r.Page - 1) * r.Limit
}

func ParsePage(r *http.Request) int {

	page, err := strconv.Atoi(
		r.URL.Query().Get("page"),
	)
	if err != nil {
		return DefaultPage
	}

	return page
}

func ParseLimit(r *http.Request) int {

	limit, err := strconv.Atoi(
		r.URL.Query().Get("limit"),
	)
	if err != nil {
		return DefaultLimit
	}

	return limit
}
