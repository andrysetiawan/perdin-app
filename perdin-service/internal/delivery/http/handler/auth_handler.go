package handler

import (
	"encoding/json"
	"net"
	"net/http"
	"perdin-service/internal/common/response"
	httpDto "perdin-service/internal/delivery/http/dto"
	"perdin-service/internal/usecase/auth"
)

type AuthHandler struct {
	usecase auth.UseCase
}

func NewAuthHandler(usecase auth.UseCase) *AuthHandler {
	return &AuthHandler{usecase: usecase}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input auth.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	// Populate transport-specific fields that don't come from the JSON body.
	input.UserAgent = r.UserAgent()
	input.IPAddress, _, _ = net.SplitHostPort(r.RemoteAddr)

	out, err := h.usecase.Login(r.Context(), input)
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, httpDto.TokenResponse{
		AccessToken:  out.AccessToken,
		RefreshToken: out.RefreshToken,
	})
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var input auth.RefreshTokenInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	input.UserAgent = r.UserAgent()
	input.IPAddress, _, _ = net.SplitHostPort(r.RemoteAddr)

	out, err := h.usecase.RefreshToken(r.Context(), input)
	if err != nil {
		response.HandleError(w, err)
		return
	}

	response.Success(w, httpDto.TokenResponse{
		AccessToken:  out.AccessToken,
		RefreshToken: out.RefreshToken,
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var input auth.LogoutInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.HandleError(w, response.ErrBadRequest)
		return
	}

	if err := h.usecase.Logout(r.Context(), input); err != nil {
		response.HandleError(w, err)
		return
	}

	response.NoContent(w)
}
