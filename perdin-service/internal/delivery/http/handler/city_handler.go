package handler

import (
	"encoding/json"
	"net/http"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/common/response"
	httpDto "perdin-service/internal/delivery/http/dto"
	cityUseCase "perdin-service/internal/usecase/city"

	"github.com/go-chi/chi/v5"
)

type CityHandler struct {
	usecase cityUseCase.UseCase
}

func NewCityHandler(usecase cityUseCase.UseCase) *CityHandler {
	return &CityHandler{usecase: usecase}
}

func (h *CityHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	city, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		response.HandleError(w, response.ErrNotFound)
		return
	}
	response.Success(w, httpDto.ToCityResponse(city))
}

func (h *CityHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	req := pagination.Request{
		Page:  pagination.ParsePage(r),
		Limit: pagination.ParseLimit(r),
	}
	cities, total, err := h.usecase.GetAll(r.Context(), req)
	if err != nil {
		response.HandleError(w, response.ErrInternal)
		return
	}
	response.SuccessWithPagination(w, httpDto.ToCityResponses(cities), req.Page, req.Limit, total)
}

func (h *CityHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input cityUseCase.CreateCityInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	city, err := h.usecase.Create(r.Context(), input)
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Created(w, httpDto.ToCityResponse(city))
}

func (h *CityHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var input cityUseCase.UpdateCityInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	city, err := h.usecase.Update(r.Context(), id, input)
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, httpDto.ToCityResponse(city))
}

func (h *CityHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.usecase.Delete(r.Context(), id); err != nil {
		response.HandleError(w, err)
		return
	}
	response.NoContent(w)
}
