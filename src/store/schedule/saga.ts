/* eslint-disable @typescript-eslint/no-unused-expressions */
import type { Action } from 'redux-actions';

import { put, takeEvery, select } from 'redux-saga/effects';

import types from './types';
import Logger from '../../utils/logger';
import * as actions from './actions';
import { updateProgress } from '../ui/actions';
import { getSchedule } from './selector';

import type { Callbacks } from '../../utils/types';
import { scheduleReponse } from '../../constants/api';
import type { UpdateEventPayload } from './actions';
import type { ScheduleInstance } from '../../models/schedule';

// Assignment tipi tanımlası
interface Assignment {
  id: string;
  staffId: string;
  shiftId: string;
  shiftStart: string;
  shiftEnd: string;
  startDate?: string;
  endDate?: string;
  isUpdated: boolean;
}

// Takvim verilerini getirme işlemi
function* asyncFetchSchedule({
  payload: { onSuccess, onError } = {},
}: Action<
  Callbacks
>) {
  yield put(updateProgress());
  try {
    // API'den veri çekme simülasyonu
    const response = scheduleReponse;
    
    // Local storage'da kaydedilmiş güncellenmiş veri varsa onu kullan
    try {
      const savedSchedule = localStorage.getItem('updatedSchedule');
      console.log('Checking localStorage for saved schedule:', { savedSchedule: savedSchedule ? 'exists' : 'not found' });
      
      if (savedSchedule) {
        try {
          const parsedSchedule = JSON.parse(savedSchedule);
          console.log('Successfully parsed saved schedule from localStorage, using it now');
          yield put(actions.fetchScheduleSuccess(parsedSchedule));
        } catch (parseError) {
          console.error('Error parsing saved schedule:', parseError);
          console.log('Falling back to API response data due to parse error');
          yield put(actions.fetchScheduleSuccess(response.data));
        }
      } else {
        // Kayıtlı veri yoksa API yanıtını kullan
        console.log('No saved schedule found in localStorage, using API response');
        yield put(actions.fetchScheduleSuccess(response.data));
      }
    } catch (localStorageError) {
      console.error('Error accessing localStorage:', localStorageError);
      console.log('Falling back to API response data due to localStorage error');
      yield put(actions.fetchScheduleSuccess(response.data));
    }

    onSuccess && onSuccess(response);
  } catch (err) {
    Logger.error(err);
    onError && onError(err);

    yield put(actions.fetchScheduleFailed());
  } finally {
    yield put(updateProgress(false));
  }
}

// Etkinlik güncelleme işlemi
function* asyncUpdateEvent({
  payload,
}: Action<UpdateEventPayload>): Generator {
  try {
    // Şu anki schedule state'ini al (ScheduleInstance tipinde)
    const scheduleState = (yield select(getSchedule)) as ScheduleInstance;
    if (!scheduleState) {
      console.error('Schedule state not found');
      return;
    }
    
    console.log('Updating event in saga:', payload);
    
    // Güncellenmiş veriyi oluştur
    const { eventId, newStartDate, newEndDate } = payload;
    
    // Mevcut schedule'ı klonla
    const updatedSchedule = JSON.parse(JSON.stringify(scheduleState));
    
    // İlgili etkinliği güncelle
    if (updatedSchedule.assignments) {
      const assignments = updatedSchedule.assignments.map((assignment: Assignment) => {
        // Assignment tipini doğru şekilde kullan
        if (assignment.id === eventId) {
          console.log(`Updating assignment ID ${eventId}:`, {
            oldDates: { start: assignment.shiftStart, end: assignment.shiftEnd },
            newDates: { start: newStartDate, end: newEndDate }
          });
          
          // Güncellenmiş nesneyi döndür - takvim formatından veritabanı/API formatına dönüştür
          return {
            ...assignment,
            shiftStart: newStartDate,  // YYYY-MM-DD formatı
            shiftEnd: newEndDate,      // YYYY-MM-DD formatı
            isUpdated: true            // Değiştirildiğini işaretle
          };
        }
        return assignment;
      });
      
      // Assignments dizisini güncelle
      updatedSchedule.assignments = assignments;
    }
    
    // Güncellenmiş veriyi Redux'a yaz
    yield put(actions.updateEventSuccess(payload));
    
    // Kayıtlı güncellenmiş veriyi localStorage'a kaydet (API simülasyonu)
    try {
      // Güncellenecek veriyi ayrıntılı loglama
      const originalAssignment = scheduleState.assignments?.find(a => a.id === eventId);
      console.log('Saving updated schedule to localStorage:', {
        eventId,
        originalAssignment,
        oldStartDate: originalAssignment?.shiftStart,
        oldEndDate: originalAssignment?.shiftEnd,
        newStartDate,
        newEndDate
      });
      
      // localStorage'a kaydetme
      localStorage.setItem('updatedSchedule', JSON.stringify(updatedSchedule));
      
      // Kaydedilen veriyi doğrulamak için okuma
      const savedData = localStorage.getItem('updatedSchedule');
      if (savedData) {
        const parsedData = JSON.parse(savedData) as ScheduleInstance;
        const savedAssignment = parsedData.assignments?.find(a => a.id === eventId);
        
        if (savedAssignment) {
          console.log('Verification: Event successfully saved to localStorage', {
            eventId: savedAssignment.id,
            shiftStart: savedAssignment.shiftStart,
            shiftEnd: savedAssignment.shiftEnd,
            payloadFromStore: payload
          });
        } else {
          console.error('Verification failed: Event not found in saved data');
        }
      } else {
        console.error('Verification failed: No data found in localStorage after save');
      }
    } catch (storageError) {
      console.error('Error saving updated schedule to localStorage:', storageError);
    }
    
  } catch (error) {
    console.error('Error updating event:', error);
    yield put(actions.updateEventFailed(error instanceof Error ? { message: error.message } : { message: 'Unknown error' }));
  }
}

const scheduleSagas = [
  takeEvery(types.FETCH_SCHEDULE, asyncFetchSchedule),
  takeEvery(types.UPDATE_EVENT, asyncUpdateEvent), // Etkinlik güncelleme action'ını dinle
];

export default scheduleSagas;
