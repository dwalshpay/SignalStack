// Google Ads Offline Conversion API Types (v15)

export interface GoogleAdsCredentials {
  customerId: string; // Google Ads Customer ID (without dashes, e.g., "1234567890")
  refreshToken: string; // OAuth2 refresh token (per organization)
  loginCustomerId?: string; // MCC account ID if using manager account
  conversionActionId?: string; // Default conversion action ID
}

export interface GoogleAdsJobData {
  conversionEventId: string;
  organizationId: string;
  leadId: string;
  event: {
    name: string;
    id: string;
    value: number;
    currency: string;
    timestamp: number; // Unix timestamp in milliseconds
  };
  userData: {
    gclid?: string; // Primary matching key
    emailHash?: string; // SHA256 hash for enhanced conversions
    phoneHash?: string; // SHA256 hash for enhanced conversions
    externalId?: string;
  };
  retryCount?: number;
}

export interface GoogleAdsUserIdentifier {
  hashedEmail?: string;
  hashedPhoneNumber?: string;
}

export interface GoogleAdsConversion {
  gclid?: string;
  conversionAction: string; // Format: "customers/{customerId}/conversionActions/{actionId}"
  conversionDateTime: string; // Format: "2024-01-15 14:30:00+11:00"
  conversionValue: number;
  currencyCode: string;
  orderId?: string; // For deduplication
  userIdentifiers?: GoogleAdsUserIdentifier[];
}

export interface GoogleAdsUploadRequest {
  conversions: GoogleAdsConversion[];
  partialFailure: boolean;
  validateOnly?: boolean;
}

export interface GoogleAdsConversionResult {
  gclid?: string;
  conversionAction: string;
  conversionDateTime: string;
}

export interface GoogleAdsPartialFailureError {
  code: number;
  message: string;
  details?: Array<{
    errors: Array<{
      errorCode: { [key: string]: string };
      message: string;
      location?: {
        fieldPathElements: Array<{ fieldName: string; index?: number }>;
      };
    }>;
  }>;
}

export interface GoogleAdsUploadResponse {
  results?: GoogleAdsConversionResult[];
  partialFailureError?: GoogleAdsPartialFailureError;
}

export interface GoogleAdsSendResult {
  success: boolean;
  conversionsUploaded?: number;
  partialFailureCount?: number;
  error?: string;
  errorCode?: string;
  isRetryable: boolean;
}

// OAuth2 token response
export interface GoogleOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}
