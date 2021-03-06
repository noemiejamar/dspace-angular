import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { isObject } from 'lodash';
import * as moment from 'moment';

import { isNull } from './empty.util';

/**
 * Returns true if the passed value is a NgbDateStruct.
 *
 * @param value
 *    The object to check
 * @return boolean
 *    true if the passed value is a NgbDateStruct, false otherwise
 */
export function isNgbDateStruct(value: object): boolean {
  return isObject(value) && value.hasOwnProperty('day')
    && value.hasOwnProperty('month') && value.hasOwnProperty('year');
}

/**
 * Returns a date in simplified extended ISO format (YYYY-MM-DDTHH:mm:ssZ).
 * The timezone is always zero UTC offset, as denoted by the suffix "Z"
 *
 * @param date
 *    The date to format
 * @return string
 *    the formatted date
 */
export function dateToISOFormat(date: Date | NgbDateStruct): string {
  const dateObj: Date = (date instanceof Date) ? date : ngbDateStructToDate(date);

  let year = dateObj.getFullYear().toString();
  let month = (dateObj.getMonth() + 1).toString();
  let day = dateObj.getDate().toString();
  let hour = dateObj.getHours().toString();
  let min = dateObj.getMinutes().toString();
  let sec = dateObj.getSeconds().toString();

  year = (year.length === 1) ? '0' + year : year;
  month = (month.length === 1) ? '0' + month : month;
  day = (day.length === 1) ? '0' + day : day;
  hour = (hour.length === 1) ? '0' + hour : hour;
  min = (min.length === 1) ? '0' + min : min;
  sec = (sec.length === 1) ? '0' + sec : sec;
  const dateStr = `${year}${month}${day}${hour}${min}${sec}`;
  return moment.utc(dateStr, 'YYYYMMDDhhmmss').format();
}

/**
 * Returns a Date object started from a NgbDateStruct object
 *
 * @param date
 *    The NgbDateStruct to convert
 * @return Date
 *    the Date object
 */
export function ngbDateStructToDate(date: NgbDateStruct): Date {
  return new Date(date.year, (date.month - 1), date.day);
}

/**
 * Returns a NgbDateStruct object started from a string representing a date
 *
 * @param date
 *    The Date to convert
 * @return NgbDateStruct
 *    the NgbDateStruct object
 */
export function stringToNgbDateStruct(date: string): NgbDateStruct {
  return dateToNgbDateStruct(new Date(date));
}

/**
 * Returns a NgbDateStruct object started from a Date object
 *
 * @param date
 *    The Date to convert
 * @return NgbDateStruct
 *    the NgbDateStruct object
 */
export function dateToNgbDateStruct(date?: Date): NgbDateStruct {
  if (isNull(date)) {
    date = new Date();
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}

/**
 * Returns a date in simplified format (YYYY-MM-DD).
 *
 * @param date
 *    The date to format
 * @return string
 *    the formatted date
 */
export function dateToString(date: Date | NgbDateStruct): string {
  const dateObj: Date = (date instanceof Date) ? date : ngbDateStructToDate(date);

  let year = dateObj.getFullYear().toString();
  let month = (dateObj.getMonth() + 1).toString();
  let day = dateObj.getDate().toString();

  year = (year.length === 1) ? '0' + year : year;
  month = (month.length === 1) ? '0' + month : month;
  day = (day.length === 1) ? '0' + day : day;
  const dateStr = `${year}-${month}-${day}`;
  return moment.utc(dateStr, 'YYYYMMDD').format('YYYY-MM-DD');
}
