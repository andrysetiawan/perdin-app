package handler

import (
	"encoding/json"
	"net/http"
	"perdin-service/internal/common/response"
	httpDto "perdin-service/internal/delivery/http/dto"
	roleUseCase "perdin-service/internal/usecase/role"

	"github.com/go-chi/chi/v5"
)

type RoleHandler struct {
	usecase roleUseCase.UseCase
}

func NewRoleHandler(usecase roleUseCase.UseCase) *RoleHandler {
	return &RoleHandler{usecase: usecase}
}

func (h *RoleHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	roles, err := h.usecase.GetAll(r.Context())
	if err != nil {
		response.HandleError(w, response.ErrInternal)
		return
	}
	response.Success(w, httpDto.ToRoleResponses(roles))
}

func (h *RoleHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input roleUseCase.CreateRoleInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	role, err := h.usecase.Create(r.Context(), input)
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Created(w, httpDto.ToRoleResponse(role))
}

func (h *RoleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.usecase.Delete(r.Context(), id); err != nil {
		response.HandleError(w, err)
		return
	}
	response.NoContent(w)
}
