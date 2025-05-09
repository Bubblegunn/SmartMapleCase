import { createAction } from 'redux-actions';

import types from './types';

export const fetchSchedule = createAction(types.FETCH_SCHEDULE);
export const fetchScheduleSuccess = createAction(types.FETCH_SCHEDULE_SUCCESS);
export const fetchScheduleFailed = createAction(types.FETCH_SCHEDULE_FAILED);

// Tip güvenli etkinlik güncelleme interface'i
export interface UpdateEventPayload {
  eventId: string;
  newStartDate: string;
  newEndDate: string;
}

// Etkinlik güncelleme action'ları - tip güvenli tanımlar
export const updateEvent = createAction<UpdateEventPayload>(types.UPDATE_EVENT);
export const updateEventSuccess = createAction<UpdateEventPayload>(types.UPDATE_EVENT_SUCCESS);
export const updateEventFailed = createAction(types.UPDATE_EVENT_FAILED);
