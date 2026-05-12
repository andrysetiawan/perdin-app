package query

import (
	"strconv"
	"strings"
)

func Int(q string, def int) int {
	if q == "" {
		return def
	}
	v, err := strconv.Atoi(q)
	if err != nil {
		return def
	}
	return v
}

func OptionalInt(q string) *int {
	if q == "" {
		return nil
	}
	v, err := strconv.Atoi(q)
	if err != nil {
		return nil
	}
	return &v
}

func OptionalString(q string) *string {
	q = strings.TrimSpace(q)
	if q == "" {
		return nil
	}
	return &q
}
