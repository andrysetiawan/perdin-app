package handler

import (
	"encoding/json"
	"net/http"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/common/response"
	httpDto "perdin-service/internal/delivery/http/dto"
	"perdin-service/internal/delivery/http/middleware"
	userUseCase "perdin-service/internal/usecase/user"

	"github.com/go-chi/chi/v5"
)

type UserHandler struct {
	usecase userUseCase.UseCase
}

func NewUserHandler(usecase userUseCase.UseCase) *UserHandler {
	return &UserHandler{usecase: usecase}
}

func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	user, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		response.HandleError(w, response.ErrNotFound)
		return
	}
	response.Success(w, httpDto.ToUserResponse(user))
}

func (h *UserHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	req := pagination.Request{
		Page:  pagination.ParsePage(r),
		Limit: pagination.ParseLimit(r),
	}
	users, total, err := h.usecase.GetAll(r.Context(), req)
	if err != nil {
		response.HandleError(w, response.ErrInternal)
		return
	}
	response.SuccessWithPagination(w, httpDto.ToUserResponses(users), req.Page, req.Limit, total)
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input userUseCase.CreateUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	user, err := h.usecase.Create(r.Context(), input)
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Created(w, httpDto.ToUserResponse(user))
}

func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var input userUseCase.UpdateUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	user, err := h.usecase.Update(r.Context(), id, input)
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, httpDto.ToUserResponse(user))
}

func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.usecase.Delete(r.Context(), id); err != nil {
		response.HandleError(w, err)
		return
	}
	response.NoContent(w)
}

func (h *UserHandler) AssignRole(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")
	roleID := chi.URLParam(r, "roleId")

	if err := h.usecase.AssignRole(r.Context(), userID, roleID); err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, map[string]string{"message": "role assigned"})
}

func (h *UserHandler) RemoveRole(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")
	roleID := chi.URLParam(r, "roleId")

	if err := h.usecase.RemoveRole(r.Context(), userID, roleID); err != nil {
		response.HandleError(w, err)
		return
	}

	response.NoContent(w)
}

// GetProfile returns the authenticated user's own profile.
func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)

	user, err := h.usecase.GetByID(r.Context(), userID)
	if err != nil {
		response.HandleError(w, response.ErrNotFound)
		return
	}

	response.Success(w, httpDto.ToUserResponse(user))
}

// ChangePassword allows the authenticated user to change their own password.
func (h *UserHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.UserIDKey).(string)

	var input userUseCase.ChangePasswordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	if err := h.usecase.ChangePassword(r.Context(), userID, input); err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, map[string]string{"message": "password changed successfully"})
}
