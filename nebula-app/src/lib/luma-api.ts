/**
 * Luma API Integration
 * Based on: https://docs.luma.com/reference/getting-started-with-your-api
 */

interface LumaEventCreateData {
  name: string;
  description: string;
  start_at: string; // ISO 8601 datetime
  end_at?: string; // ISO 8601 datetime
  timezone: string;
  location_type: 'online' | 'physical' | 'hybrid';
  geo_address_json?: {
    address: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  event_type: 'public' | 'private';
  cover_url?: string;
  registration_limit?: number;
  approval_required?: boolean;
  require_rsvp_approval?: boolean;
  series_api_id?: string;
  hosts?: string[]; // Array of host emails
}

interface LumaEvent {
  api_id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  timezone: string;
  location_type: string;
  geo_address_json?: any;
  event_type: string;
  url: string;
  cover_url?: string;
  registration_limit?: number;
  guest_count: number;
  created_at: string;
  updated_at: string;
}

interface LumaGuest {
  api_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  approval_status: 'approved' | 'pending' | 'waitlisted';
  attendance_status: 'going' | 'not_going' | 'maybe';
  created_at: string;
  updated_at: string;
}

interface LumaApiResponse<T> {
  entries: T[];
  has_more: boolean;
  next_cursor?: string;
}

interface LumaApiError {
  message: string;
  code: string;
  details?: any;
}

class LumaApiClient {
  private apiKey: string;
  private baseUrl = 'https://api.luma.com/public/v1';

  constructor() {
    this.apiKey = process.env.LUMA_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('LUMA_API_KEY environment variable is required');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'x-luma-api-key': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: LumaApiError = {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorData.code || response.status.toString(),
          details: errorData
        };
        throw new Error(`Luma API error: ${error.message}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown Luma API error occurred');
    }
  }

  /**
   * Create a new event on Luma
   */
  async createEvent(eventData: LumaEventCreateData): Promise<LumaEvent> {
    return this.makeRequest<LumaEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Get event by API ID
   */
  async getEvent(eventApiId: string): Promise<LumaEvent> {
    return this.makeRequest<LumaEvent>(`/events/${eventApiId}`);
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventApiId: string, eventData: Partial<LumaEventCreateData>): Promise<LumaEvent> {
    return this.makeRequest<LumaEvent>(`/events/${eventApiId}`, {
      method: 'PATCH',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventApiId: string): Promise<LumaEvent> {
    return this.makeRequest<LumaEvent>(`/events/${eventApiId}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * List events
   */
  async listEvents(params?: {
    limit?: number;
    cursor?: string;
    after?: string; // ISO 8601 datetime - only return events after this date
    before?: string; // ISO 8601 datetime - only return events before this date
    series_api_id?: string;
  }): Promise<LumaApiResponse<LumaEvent>> {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.cursor) searchParams.append('cursor', params.cursor);
    if (params?.after) searchParams.append('after', params.after);
    if (params?.before) searchParams.append('before', params.before);
    if (params?.series_api_id) searchParams.append('series_api_id', params.series_api_id);

    const endpoint = `/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.makeRequest<LumaApiResponse<LumaEvent>>(endpoint);
  }

  /**
   * Get event guests/attendees
   */
  async getEventGuests(eventApiId: string, params?: {
    limit?: number;
    cursor?: string;
    approval_status?: 'approved' | 'pending' | 'waitlisted';
    attendance_status?: 'going' | 'not_going' | 'maybe';
  }): Promise<LumaApiResponse<LumaGuest>> {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.cursor) searchParams.append('cursor', params.cursor);
    if (params?.approval_status) searchParams.append('approval_status', params.approval_status);
    if (params?.attendance_status) searchParams.append('attendance_status', params.attendance_status);

    const endpoint = `/events/${eventApiId}/guests${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.makeRequest<LumaApiResponse<LumaGuest>>(endpoint);
  }

  /**
   * Register a guest for an event
   */
  async registerGuest(eventApiId: string, guestData: {
    email: string;
    name?: string;
    avatar_url?: string;
  }): Promise<LumaGuest> {
    return this.makeRequest<LumaGuest>(`/events/${eventApiId}/guests`, {
      method: 'POST',
      body: JSON.stringify(guestData),
    });
  }

  /**
   * Remove a guest from an event
   */
  async removeGuest(eventApiId: string, guestApiId: string): Promise<void> {
    await this.makeRequest(`/events/${eventApiId}/guests/${guestApiId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get event analytics/stats
   */
  async getEventStats(eventApiId: string): Promise<{
    total_guests: number;
    approved_guests: number;
    pending_guests: number;
    waitlisted_guests: number;
    going_guests: number;
    maybe_guests: number;
    not_going_guests: number;
  }> {
    return this.makeRequest(`/events/${eventApiId}/stats`);
  }
}

// Export singleton instance
export const lumaApi = new LumaApiClient();

// Export types
export type { 
  LumaEventCreateData, 
  LumaEvent, 
  LumaGuest, 
  LumaApiResponse,
  LumaApiError 
};