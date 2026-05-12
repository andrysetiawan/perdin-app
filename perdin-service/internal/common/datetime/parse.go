package datetime

import (
	"time"
)

const DateLayout = "2006-01-02"

func ParseDate(dateStr string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}

	t, err := time.Parse(DateLayout, dateStr)
	if err != nil {
		return nil, err
	}

	return &t, nil
}
