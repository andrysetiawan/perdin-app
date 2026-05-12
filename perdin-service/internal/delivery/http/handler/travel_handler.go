package handler

import (
	"encoding/json"
	"net/http"
	"perdin-service/internal/common/datetime"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/common/query"
	"perdin-service/internal/common/response"
	httpDto "perdin-service/internal/delivery/http/dto"
	"perdin-service/internal/delivery/http/middleware"
	travelUseCase "perdin-service/internal/usecase/travel"

	"github.com/go-chi/chi/v5"
)

type TravelHandler struct {
	usecase travelUseCase.UseCase
}

func NewTravelHandler(usecase travelUseCase.UseCase) *TravelHandler {
	return &TravelHandler{usecase: usecase}
}

func (h *TravelHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	result, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		response.HandleError(w, response.ErrNotFound)
		return
	}

	// Employees can only view their own travel requests.
	if !isPrivilegedRole(r) {
		userID, _ := r.Context().Value(middleware.UserIDKey).(string)
		if result.UserID != userID {
			response.HandleError(w, response.ErrForbidden)
			return
		}
	}

	response.Success(w, httpDto.ToTravelResponse(result))
}

func (h *TravelHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	input := travelUseCase.ListTravelInput{
		UserID: query.OptionalString(r.URL.Query().Get("user_id")),
		Status: query.OptionalString(r.URL.Query().Get("status")),
		Page:   pagination.ParsePage(r),
		Limit:  pagination.ParseLimit(r),
	}

	// Employees can only see their own travel requests.
	if !isPrivilegedRole(r) {
		userID, _ := r.Context().Value(middleware.UserIDKey).(string)
		input.UserID = &userID
	}

	travels, total, err := h.usecase.GetAll(r.Context(), input)
	if err != nil {
		response.HandleError(w, response.ErrInternal)
		return
	}
	response.SuccessWithPagination(w, httpDto.ToTravelResponses(travels), input.Page, input.Limit, total)
}

func (h *TravelHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req httpDto.CreateTravelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	startDate, err := datetime.ParseDate(req.StartDate)
	if err != nil || startDate == nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}
	endDate, err := datetime.ParseDate(req.EndDate)
	if err != nil || endDate == nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	userID, _ := r.Context().Value(middleware.UserIDKey).(string)

	result, err := h.usecase.Create(r.Context(), travelUseCase.CreateTravelInput{
		UserID:            userID,
		Purpose:           req.Purpose,
		OriginCityID:      req.OriginCityID,
		DestinationCityID: req.DestinationCityID,
		StartDate:         *startDate,
		EndDate:           *endDate,
	})
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Created(w, httpDto.ToTravelResponse(result))
}

func (h *TravelHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Verify ownership: employees can only update their own requests.
	existing, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		response.HandleError(w, response.ErrNotFound)
		return
	}
	if !isPrivilegedRole(r) {
		userID, _ := r.Context().Value(middleware.UserIDKey).(string)
		if existing.UserID != userID {
			response.HandleError(w, response.ErrForbidden)
			return
		}
	}

	var req httpDto.UpdateTravelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	input := travelUseCase.UpdateTravelInput{
		Purpose:           req.Purpose,
		OriginCityID:      req.OriginCityID,
		DestinationCityID: req.DestinationCityID,
	}

	if req.StartDate != nil {
		startDate, err := datetime.ParseDate(*req.StartDate)
		if err != nil || startDate == nil {
			response.HandleError(w, response.ErrBadRequest)
			return
		}
		input.StartDate = startDate
	}
	if req.EndDate != nil {
		endDate, err := datetime.ParseDate(*req.EndDate)
		if err != nil || endDate == nil {
			response.HandleError(w, response.ErrBadRequest)
			return
		}
		input.EndDate = endDate
	}

	result, err := h.usecase.Update(r.Context(), id, input)
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, httpDto.ToTravelResponse(result))
}

// Approve handles SDM approving or rejecting a travel request.
func (h *TravelHandler) Approve(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	approvedBy, _ := r.Context().Value(middleware.UserIDKey).(string)

	result, err := h.usecase.Approve(r.Context(), id, travelUseCase.ApproveInput{
		Status:     "approved",
		ApprovedBy: approvedBy,
	})
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, httpDto.ToTravelResponse(result))
}

func (h *TravelHandler) Reject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	result, err := h.usecase.Reject(r.Context(), id, travelUseCase.ChangeStatusInput{
		Status: "rejected",
	})
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, httpDto.ToTravelResponse(result))
}

func (h *TravelHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	// Verify ownership: employees can only delete their own requests.
	existing, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		response.HandleError(w, response.ErrNotFound)
		return
	}
	if !isPrivilegedRole(r) {
		userID, _ := r.Context().Value(middleware.UserIDKey).(string)
		if existing.UserID != userID {
			response.HandleError(w, response.ErrForbidden)
			return
		}
	}

	if err := h.usecase.Delete(r.Context(), id); err != nil {
		response.HandleError(w, err)
		return
	}
	response.NoContent(w)
}

// ── helpers ──────────────────────────────────────────────────────────────────

// isPrivilegedRole checks if the request comes from an admin or hr user.
func isPrivilegedRole(r *http.Request) bool {
	roles, _ := r.Context().Value(middleware.RolesKey).([]string)
	for _, role := range roles {
		if role == "admin" || role == "hr" {
			return true
		}
	}
	return false
}
