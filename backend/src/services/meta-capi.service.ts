import { logger, logError } from '../utils/logger.js';
import type {
  MetaEvent,
  MetaEventPayload,
  MetaUserData,
  MetaCustomData,
  MetaAPIResponse,
  MetaAPIError,
  MetaCapiCredentials,
  MetaCapiJobData,
  SendEventResult,
} from '../types/meta-capi.types.js';

const META_API_VERSION = 'v18.0';
const META_API_BASE_URL = 'https://graph.facebook.com';
const REQUEST_TIMEOUT_MS = 10000;

const NON_RETRYABLE_ERROR_CODES = [
  190, // Invalid OAuth access token
  100, // Invalid parameter
  2,   // API Unknown (bad request)
];

export function buildUserData(userData: MetaCapiJobData['userData']): MetaUserData {
  const result: MetaUserData = {};

  if (userData.emailHash) {
    result.em = [userData.emailHash];
  }

  if (userData.phoneHash) {
    result.ph = [userData.phoneHash];
  }

  if (userData.fbc) {
    result.fbc = userData.fbc;
  }

  if (userData.fbp) {
    result.fbp = userData.fbp;
  }

  if (userData.ipAddress) {
    result.client_ip_address = userData.ipAddress;
  }

  if (userData.userAgent) {
    result.client_user_agent = userData.userAgent;
  }

  if (userData.externalId) {
    result.external_id = [userData.externalId];
  }

  return result;
}

export function buildCustomData(event: MetaCapiJobData['event']): MetaCustomData {
  return {
    value: event.value,
    currency: event.currency,
  };
}

export function buildEventPayload(
  jobData: MetaCapiJobData,
  testEventCode?: string
): MetaEventPayload {
  const event: MetaEvent = {
    event_name: mapEventName(jobData.event.name),
    event_time: Math.floor(jobData.event.timestamp / 1000),
    event_id: jobData.event.id,
    action_source: 'website',
    user_data: buildUserData(jobData.userData),
    custom_data: buildCustomData(jobData.event),
  };

  if (jobData.event.pageUrl) {
    event.event_source_url = jobData.event.pageUrl;
  }

  const payload: MetaEventPayload = {
    data: [event],
  };

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  return payload;
}

function mapEventName(eventName: string): string {
  const eventMap: Record<string, string> = {
    email_captured: 'Lead',
    application_started: 'InitiateCheckout',
    signup_complete: 'CompleteRegistration',
    first_transaction: 'Purchase',
    activated: 'Purchase',
  };

  return eventMap[eventName] || 'Lead';
}

export function estimateEmqScore(userData: MetaUserData): number {
  let score = 0;

  if (userData.em?.length) score += 3;
  if (userData.ph?.length) score += 2;
  if (userData.fbc) score += 4;
  if (userData.fbp) score += 2;
  if (userData.client_ip_address) score += 0.5;
  if (userData.client_user_agent) score += 0.5;
  if (userData.external_id?.length) score += 1;

  return Math.min(10, Math.round(score * 0.8));
}

export function hasMinimumUserData(userData: MetaCapiJobData['userData']): boolean {
  return !!(
    userData.emailHash ||
    userData.phoneHash ||
    userData.fbc ||
    (userData.fbp && userData.ipAddress)
  );
}

export async function sendToMetaCapi(
  credentials: MetaCapiCredentials,
  payload: MetaEventPayload
): Promise<SendEventResult> {
  const url = `${META_API_BASE_URL}/${META_API_VERSION}/${credentials.pixelId}/events`;

  const body = new URLSearchParams({
    data: JSON.stringify(payload.data),
    access_token: credentials.accessToken,
  });

  if (payload.test_event_code) {
    body.append('test_event_code', payload.test_event_code);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = responseData as MetaAPIError;
      const errorCode = errorData.error?.code;
      const isRetryable = !NON_RETRYABLE_ERROR_CODES.includes(errorCode);

      logger.warn({
        msg: 'Meta CAPI error response',
        statusCode: response.status,
        errorCode,
        errorMessage: errorData.error?.message,
        fbTraceId: errorData.error?.fbtrace_id,
        isRetryable,
      });

      return {
        success: false,
        error: errorData.error?.message || 'Unknown error',
        errorCode,
        fbTraceId: errorData.error?.fbtrace_id,
        isRetryable,
      };
    }

    const successData = responseData as MetaAPIResponse;

    logger.info({
      msg: 'Meta CAPI event sent successfully',
      eventsReceived: successData.events_received,
      fbTraceId: successData.fbtrace_id,
    });

    return {
      success: true,
      eventsReceived: successData.events_received,
      fbTraceId: successData.fbtrace_id,
      isRetryable: false,
    };
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logError('Meta CAPI request failed', error);

    return {
      success: false,
      error: isTimeout ? 'Request timeout' : errorMessage,
      isRetryable: true,
    };
  }
}
