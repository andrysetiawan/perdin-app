package response

import (
	"errors"
	"net/http"

	"github.com/go-playground/validator/v10"
)

var (
	ErrBadRequest   = errors.New("bad request")
	ErrUnauthorized = errors.New("unauthorized")
	ErrForbidden    = errors.New("forbidden")
	ErrNotFound     = errors.New("resource not found")
	ErrConflict     = errors.New("resource conflict")
	ErrInternal     = errors.New("internal server error")
)

type ErrorResponse struct {
	Success bool              `json:"success"`
	Message string            `json:"message"`
	Errors  map[string]string `json:"errors,omitempty"`
}

func HandleError(
	w http.ResponseWriter,
	err error,
) {

	if err == nil {
		return
	}

	// Validator Error
	var validationErr validator.ValidationErrors

	if errors.As(err, &validationErr) {

		JSON(
			w,
			http.StatusBadRequest,
			ErrorResponse{
				Success: false,
				Message: "validation error",
				Errors:  ParseValidationErrors(validationErr),
			},
		)

		return
	}

	// Application Errors (sentinel check)
	switch {

	case errors.Is(err, ErrBadRequest):

		JSON(
			w,
			http.StatusBadRequest,
			ErrorResponse{
				Success: false,
				Message: err.Error(),
			},
		)

	case errors.Is(err, ErrUnauthorized):

		JSON(
			w,
			http.StatusUnauthorized,
			ErrorResponse{
				Success: false,
				Message: err.Error(),
			},
		)

	case errors.Is(err, ErrForbidden):

		JSON(
			w,
			http.StatusForbidden,
			ErrorResponse{
				Success: false,
				Message: err.Error(),
			},
		)

	case errors.Is(err, ErrNotFound):

		JSON(
			w,
			http.StatusNotFound,
			ErrorResponse{
				Success: false,
				Message: err.Error(),
			},
		)

	case errors.Is(err, ErrConflict):

		JSON(
			w,
			http.StatusConflict,
			ErrorResponse{
				Success: false,
				Message: err.Error(),
			},
		)

	default:
		// For non-sentinel errors, map by message content to avoid leaking
		// internal details while still returning appropriate status codes.
		msg := err.Error()
		switch msg {
		case "invalid credentials",
			"invalid refresh token",
			"refresh token revoked",
			"refresh token expired",
			"old password is incorrect":
			JSON(w, http.StatusUnauthorized, ErrorResponse{
				Success: false,
				Message: msg,
			})

		case "user not found",
			"city not found",
			"travel not found",
			"role not found",
			"origin city not found",
			"destination city not found":
			JSON(w, http.StatusNotFound, ErrorResponse{
				Success: false,
				Message: msg,
			})

		case "email already registered",
			"role name already exists":
			JSON(w, http.StatusConflict, ErrorResponse{
				Success: false,
				Message: msg,
			})

		case "end_date must be after start_date",
			"start_date and end_date are required",
			"only pending travel requests can be updated",
			"only pending travel requests can be deleted",
			"only pending travel requests can be approved or rejected",
			"refresh token required":
			JSON(w, http.StatusBadRequest, ErrorResponse{
				Success: false,
				Message: msg,
			})

		default:
			JSON(
				w,
				http.StatusInternalServerError,
				ErrorResponse{
					Success: false,
					Message: ErrInternal.Error(),
				},
			)
		}
	}
}

func ParseValidationErrors(
	errs validator.ValidationErrors,
) map[string]string {

	result := make(map[string]string)

	for _, err := range errs {

		field := err.Field()

		result[field] = ValidationMessage(err)
	}

	return result
}

func ValidationMessage(
	err validator.FieldError,
) string {

	switch err.Tag() {

	case "required":
		return "this field is required"

	case "email":
		return "invalid email format"

	case "min":

		if err.Kind().String() == "string" {
			return "minimum length is " + err.Param()
		}

		return "minimum value is " + err.Param()

	case "max":

		if err.Kind().String() == "string" {
			return "maximum length is " + err.Param()
		}

		return "maximum value is " + err.Param()

	case "gte":
		return "value must be greater than or equal to " + err.Param()

	case "lte":
		return "value must be less than or equal to " + err.Param()

	case "uuid4":
		return "invalid uuid format"

	case "oneof":
		return "must be one of: " + err.Param()

	}

	return "invalid value"
}
