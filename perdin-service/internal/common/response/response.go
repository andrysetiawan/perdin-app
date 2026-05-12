package response

import (
	"encoding/json"
	"net/http"
)

type Meta struct {
	Page      int   `json:"page,omitempty"`
	Limit     int   `json:"limit,omitempty"`
	Total     int64 `json:"total,omitempty"`
	TotalPage int64 `json:"total_page,omitempty"`
}

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

func JSON(
	w http.ResponseWriter,
	status int,
	payload interface{},
) {

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	err := json.NewEncoder(w).Encode(payload)
	if err != nil {
		http.Error(
			w,
			"internal server error",
			http.StatusInternalServerError,
		)
	}
}

func Success(
	w http.ResponseWriter,
	data interface{},
) {

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

func Created(
	w http.ResponseWriter,
	data interface{},
) {

	JSON(w, http.StatusCreated, Response{
		Success: true,
		Data:    data,
	})
}

func NoContent(
	w http.ResponseWriter,
) {

	w.WriteHeader(http.StatusNoContent)
}

func SuccessWithPagination(
	w http.ResponseWriter,
	data interface{},
	page int,
	limit int,
	total int64,
) {

	totalPage := int64(0)

	if limit > 0 {
		totalPage = (total + int64(limit) - 1) / int64(limit)
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    data,
		Meta: &Meta{
			Page:      page,
			Limit:     limit,
			Total:     total,
			TotalPage: totalPage,
		},
	})
}
