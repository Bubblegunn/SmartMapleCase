/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Action } from 'redux-actions';

import { handleActions } from 'redux-actions';

import types from './types';

import type { ErrorBE } from '../../utils/types';
import type { ScheduleInstance } from '../../models/schedule';

export interface ScheduleState {
  errors: ErrorBE;
  loading: boolean;
  schedule: ScheduleInstance;
}

const initialState: ScheduleState = {
  loading: false,
  errors: {},
  schedule: {} as ScheduleInstance,
};

const scheduleReducer: any = {
  [types.FETCH_SCHEDULE_SUCCESS]: (
    state: ScheduleState,
    { payload }: Action<typeof state.schedule>
  ): ScheduleState => ({
    ...state,
    loading: false,
    errors: {},
    schedule: payload,
  }),

  [types.FETCH_SCHEDULE_FAILED]: (
    state: ScheduleState,
    { payload }: Action<typeof state.errors>
  ): ScheduleState => ({
    ...state,
    loading: false,
    errors: payload,
  }),

  // Etkinlik güncelleme reducer'ları
  [types.UPDATE_EVENT]: (
    state: ScheduleState
  ): ScheduleState => ({
    ...state,
    loading: true,
    errors: {},
  }),

  [types.UPDATE_EVENT_SUCCESS]: (
    state: ScheduleState,
    { payload }: Action<{eventId: string, newStartDate: string, newEndDate: string}>
  ): ScheduleState => {
    // Güncellenen event bilgilerini al
    const { eventId, newStartDate, newEndDate } = payload;
    
    // Mevcut schedule üzerinde etkinliğin tarihlerini güncelle
    const updatedSchedule = { ...state.schedule };
    
    // Eğer etkinlik bir assignment ise
    if (updatedSchedule.assignments) {
      updatedSchedule.assignments = updatedSchedule.assignments.map(assignment => {
        if (assignment.id === eventId) {
          console.log('Reducer güncellemesi yapılıyor:', {
            id: assignment.id,
            before: { shiftStart: assignment.shiftStart, shiftEnd: assignment.shiftEnd },
            after: { shiftStart: newStartDate, shiftEnd: newEndDate }
          });
          
          return {
            ...assignment,
            shiftStart: newStartDate, // Doğru alan ismi kullanıldı - startDate değil
            shiftEnd: newEndDate,     // Doğru alan ismi kullanıldı - endDate değil
            isUpdated: true           // Etkinliğin güncellendiğini işaretle
          };
        }
        return assignment;
      });
    }
    
    return {
      ...state,
      loading: false,
      errors: {},
      schedule: updatedSchedule,
    };
  },

  [types.UPDATE_EVENT_FAILED]: (
    state: ScheduleState,
    { payload }: Action<typeof state.errors>
  ): ScheduleState => ({
    ...state,
    loading: false,
    errors: payload,
  }),
};

export default handleActions(scheduleReducer, initialState) as any;
