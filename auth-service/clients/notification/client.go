package notification

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// SendEmailRequest matches the notification service API contract.
type SendEmailRequest struct {
	To         string            `json:"to"`
	Subject    string            `json:"subject"`
	TemplateID string            `json:"templateId"`
	Params     map[string]string `json:"params"`
}

type Client interface {
	SendEmail(ctx context.Context, req *SendEmailRequest) error
}

type HTTPClient struct {
	BaseURL    string
	HTTPClient *http.Client
}

func NewHTTPClient(baseURL string) *HTTPClient {
	return &HTTPClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *HTTPClient) SendEmail(ctx context.Context, req *SendEmailRequest) error {
	body, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("marshal send email request: %w", err)
	}

	url := c.BaseURL + "/api/v1/notifications/send"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("send email request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("notification service returned status %d", resp.StatusCode)
	}
	return nil
}
