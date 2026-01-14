import { logger, logError } from '../utils/logger.js';
import type {
  GoogleAdsCredentials,
  GoogleAdsJobData,
  GoogleAdsConversion,
  GoogleAdsUserIdentifier,
  GoogleAdsUploadRequest,
  GoogleAdsUploadResponse,
  GoogleAdsSendResult,
  GoogleOAuthTokenResponse,
} from '../types/google-ads.types.js';

const GOOGLE_ADS_API_VERSION = 'v15';
const GOOGLE_ADS_API_BASE_URL = 'https://googleads.googleapis.com';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REQUEST_TIMEOUT_MS = 30000; // Longer timeout for batch uploads

// Error codes that should not be retried
const NON_RETRYABLE_ERROR_CODES = [
  'INVALID_CONVERSION_ACTION',
  'CUSTOMER_NOT_ENABLED',
  'EXPIRED_GCLID',
  'INVALID_GCLID',
  'DUPLICATE_CLICK_CONVERSION',
  'UNAUTHORIZED',
  'PERMISSION_DENIED',
  'TOO_RECENT_CONVERSION_ACTION',
];

// Simple in-memory token cache
const tokenCache: Map<string, { token: string; expiresAt: number }> = new Map();

export async function refreshAccessToken(
  credentials: GoogleAdsCredentials
): Promise<string> {
  const cacheKey = credentials.customerId;
  const cached = tokenCache.get(cacheKey);

  // Return cached token if still valid (with 5 min buffer)
  if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cached.token;
  }

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google Ads OAuth credentials not configured in environment');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: credentials.refreshToken,
    grant_type: 'refresh_token',
  });

  try {
    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({
        msg: 'Google OAuth token refresh failed',
        status: response.status,
        error: errorText,
      });
      throw new Error(`OAuth token refresh failed: ${response.status}`);
    }

    const data = (await response.json()) as GoogleOAuthTokenResponse;

    // Cache the token
    tokenCache.set(cacheKey, {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    });

    return data.access_token;
  } catch (error) {
    logError('Failed to refresh Google OAuth token', error);
    throw error;
  }
}

export function formatConversionDateTime(timestamp: number): string {
  const date = new Date(timestamp);

  // Format: "YYYY-MM-DD HH:MM:SS+TZ:00"
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Get timezone offset
  const tzOffset = -date.getTimezoneOffset();
  const tzSign = tzOffset >= 0 ? '+' : '-';
  const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const tzMinutes = String(Math.abs(tzOffset) % 60).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`;
}

export function buildUserIdentifiers(
  userData: GoogleAdsJobData['userData']
): GoogleAdsUserIdentifier[] | undefined {
  const identifiers: GoogleAdsUserIdentifier[] = [];

  if (userData.emailHash) {
    identifiers.push({ hashedEmail: userData.emailHash });
  }

  if (userData.phoneHash) {
    identifiers.push({ hashedPhoneNumber: userData.phoneHash });
  }

  return identifiers.length > 0 ? identifiers : undefined;
}

export function buildConversion(
  jobData: GoogleAdsJobData,
  customerId: string,
  conversionActionId: string
): GoogleAdsConversion {
  const conversion: GoogleAdsConversion = {
    conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
    conversionDateTime: formatConversionDateTime(jobData.event.timestamp),
    conversionValue: jobData.event.value,
    currencyCode: jobData.event.currency,
    orderId: jobData.event.id, // Use event ID for deduplication
  };

  // GCLID is the primary matching key
  if (jobData.userData.gclid) {
    conversion.gclid = jobData.userData.gclid;
  }

  // Enhanced conversions with hashed PII
  const userIdentifiers = buildUserIdentifiers(jobData.userData);
  if (userIdentifiers) {
    conversion.userIdentifiers = userIdentifiers;
  }

  return conversion;
}

export function hasMinimumData(userData: GoogleAdsJobData['userData']): boolean {
  // GCLID is required for click conversions
  // Enhanced conversions (email/phone hash) can work without GCLID but are less reliable
  return !!(userData.gclid || userData.emailHash || userData.phoneHash);
}

function extractErrorCode(response: GoogleAdsUploadResponse): string | undefined {
  if (!response.partialFailureError?.details?.[0]?.errors?.[0]) {
    return undefined;
  }

  const errorCode = response.partialFailureError.details[0].errors[0].errorCode;
  // errorCode is an object like { conversionUploadError: 'EXPIRED_GCLID' }
  return Object.values(errorCode)[0];
}

export async function uploadToGoogleAds(
  credentials: GoogleAdsCredentials,
  conversions: GoogleAdsConversion[]
): Promise<GoogleAdsSendResult> {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!developerToken) {
    return {
      success: false,
      error: 'Google Ads developer token not configured',
      isRetryable: false,
    };
  }

  let accessToken: string;
  try {
    accessToken = await refreshAccessToken(credentials);
  } catch (error) {
    return {
      success: false,
      error: 'Failed to obtain access token',
      errorCode: 'UNAUTHORIZED',
      isRetryable: false,
    };
  }

  const url = `${GOOGLE_ADS_API_BASE_URL}/${GOOGLE_ADS_API_VERSION}/customers/${credentials.customerId}:uploadClickConversions`;

  const requestBody: GoogleAdsUploadRequest = {
    conversions,
    partialFailure: true,
    validateOnly: false,
  };

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
  };

  // Add login customer ID if using MCC account
  if (credentials.loginCustomerId) {
    headers['login-customer-id'] = credentials.loginCustomerId;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = (await response.json()) as GoogleAdsUploadResponse;

    if (!response.ok) {
      const errorCode = extractErrorCode(responseData) || 'UNKNOWN';
      const errorMessage = responseData.partialFailureError?.message || 'Unknown error';
      const isRetryable = !NON_RETRYABLE_ERROR_CODES.includes(errorCode);

      logger.warn({
        msg: 'Google Ads API error response',
        statusCode: response.status,
        errorCode,
        errorMessage,
        isRetryable,
      });

      return {
        success: false,
        error: errorMessage,
        errorCode,
        isRetryable,
      };
    }

    // Check for partial failures
    const resultsCount = responseData.results?.length || 0;
    const partialFailureCount = responseData.partialFailureError ? conversions.length - resultsCount : 0;

    if (partialFailureCount > 0) {
      const errorCode = extractErrorCode(responseData);

      logger.warn({
        msg: 'Google Ads partial failure',
        uploaded: resultsCount,
        failed: partialFailureCount,
        errorCode,
        errorMessage: responseData.partialFailureError?.message,
      });

      // If all failed, treat as error
      if (resultsCount === 0) {
        return {
          success: false,
          error: responseData.partialFailureError?.message || 'All conversions failed',
          errorCode,
          isRetryable: !NON_RETRYABLE_ERROR_CODES.includes(errorCode || ''),
        };
      }
    }

    logger.info({
      msg: 'Google Ads conversions uploaded successfully',
      conversionsUploaded: resultsCount,
      partialFailures: partialFailureCount,
    });

    return {
      success: true,
      conversionsUploaded: resultsCount,
      partialFailureCount,
      isRetryable: false,
    };
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logError('Google Ads request failed', error);

    return {
      success: false,
      error: isTimeout ? 'Request timeout' : errorMessage,
      isRetryable: true,
    };
  }
}
