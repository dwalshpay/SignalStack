// Meta CAPI Event Structure (Graph API v18.0)

export interface MetaUserData {
  em?: string[];
  ph?: string[];
  fbc?: string;
  fbp?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
  external_id?: string[];
}

export interface MetaCustomData {
  value: number;
  currency: string;
  content_name?: string;
  content_type?: string;
  content_ids?: string[];
  num_items?: number;
  order_id?: string;
}

export interface MetaEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url?: string;
  action_source: 'website' | 'app' | 'phone_call' | 'chat' | 'email' | 'other';
  user_data: MetaUserData;
  custom_data?: MetaCustomData;
  opt_out?: boolean;
  data_processing_options?: string[];
  data_processing_options_country?: number;
  data_processing_options_state?: number;
}

export interface MetaEventPayload {
  data: MetaEvent[];
  test_event_code?: string;
}

export interface MetaAPIResponse {
  events_received: number;
  fbtrace_id: string;
  messages?: string[];
}

export interface MetaAPIError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

export interface MetaCapiJobData {
  conversionEventId: string;
  organizationId: string;
  leadId: string;
  event: {
    name: string;
    id: string;
    value: number;
    currency: string;
    timestamp: number;
    pageUrl?: string;
  };
  userData: {
    emailHash?: string;
    phoneHash?: string;
    fbc?: string;
    fbp?: string;
    ipAddress?: string;
    userAgent?: string;
    externalId?: string;
  };
  retryCount?: number;
}

export interface MetaCapiCredentials {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
}

export interface SendEventResult {
  success: boolean;
  eventsReceived?: number;
  fbTraceId?: string;
  error?: string;
  errorCode?: number;
  isRetryable: boolean;
}
