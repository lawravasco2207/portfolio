import missionConfig from '@/data/mission-control.json';
import type { MissionConfig } from './types';

export const config = missionConfig as MissionConfig;

export function getNairobiTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-KE', {
    timeZone: config.profile.timezone,
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}