import { CoughDataPoint, DailySummary, Exercise, AQIDataPoint, SpirometryDataPoint } from './types';

export const MOCK_HOURLY_DATA: CoughDataPoint[] = [
  { time: '00:00', count: 2, heartRate: 62, respiratoryRate: 14, activity: 5, isNight: true },
  { time: '01:00', count: 3, heartRate: 60, respiratoryRate: 13, activity: 2, isNight: true },
  { time: '02:00', count: 5, heartRate: 64, respiratoryRate: 15, activity: 8, isNight: true },
  { time: '03:00', count: 1, heartRate: 58, respiratoryRate: 12, activity: 1, isNight: true },
  { time: '04:00', count: 0, heartRate: 56, respiratoryRate: 12, activity: 0, isNight: true },
  { time: '05:00', count: 1, heartRate: 59, respiratoryRate: 13, activity: 3, isNight: true },
  { time: '06:00', count: 4, heartRate: 65, respiratoryRate: 16, activity: 15, isNight: true },
  { time: '07:00', count: 2, heartRate: 72, respiratoryRate: 18, activity: 30, isNight: false },
  { time: '08:00', count: 1, heartRate: 78, respiratoryRate: 20, activity: 45, isNight: false },
  { time: '09:00', count: 0, heartRate: 82, respiratoryRate: 22, activity: 60, isNight: false },
  { time: '10:00', count: 3, heartRate: 85, respiratoryRate: 21, activity: 55, isNight: false },
  { time: '11:00', count: 2, heartRate: 80, respiratoryRate: 19, activity: 40, isNight: false },
  { time: '12:00', count: 1, heartRate: 75, respiratoryRate: 18, activity: 35, isNight: false },
  { time: '13:00', count: 0, heartRate: 78, respiratoryRate: 19, activity: 42, isNight: false },
  { time: '14:00', count: 2, heartRate: 84, respiratoryRate: 21, activity: 58, isNight: false },
  { time: '15:00', count: 4, heartRate: 88, respiratoryRate: 23, activity: 70, isNight: false },
  { time: '16:00', count: 6, heartRate: 92, respiratoryRate: 25, activity: 75, isNight: false },
  { time: '17:00', count: 3, heartRate: 86, respiratoryRate: 22, activity: 50, isNight: false },
  { time: '18:00', count: 2, heartRate: 80, respiratoryRate: 19, activity: 40, isNight: false },
  { time: '19:00', count: 1, heartRate: 76, respiratoryRate: 18, activity: 30, isNight: false },
  { time: '20:00', count: 0, heartRate: 74, respiratoryRate: 17, activity: 25, isNight: false },
  { time: '21:00', count: 2, heartRate: 70, respiratoryRate: 16, activity: 20, isNight: false },
  { time: '22:00', count: 3, heartRate: 68, respiratoryRate: 15, activity: 15, isNight: true },
  { time: '23:00', count: 5, heartRate: 65, respiratoryRate: 14, activity: 10, isNight: true },
];

export const MOCK_WEEKLY_SUMMARY: DailySummary[] = [
  { date: 'Pzt', totalCoughs: 42, nightCoughs: 12, avgHeartRate: 72, avgRespiratoryRate: 16, status: 'normal' },
  { date: 'Sal', totalCoughs: 38, nightCoughs: 8, avgHeartRate: 70, avgRespiratoryRate: 15, status: 'normal' },
  { date: 'Çar', totalCoughs: 55, nightCoughs: 18, avgHeartRate: 75, avgRespiratoryRate: 18, status: 'warning' },
  { date: 'Per', totalCoughs: 48, nightCoughs: 14, avgHeartRate: 73, avgRespiratoryRate: 17, status: 'normal' },
  { date: 'Cum', totalCoughs: 72, nightCoughs: 25, avgHeartRate: 82, avgRespiratoryRate: 22, status: 'critical' },
  { date: 'Cmt', totalCoughs: 60, nightCoughs: 20, avgHeartRate: 78, avgRespiratoryRate: 20, status: 'warning' },
  { date: 'Paz', totalCoughs: 45, nightCoughs: 15, avgHeartRate: 74, avgRespiratoryRate: 17, status: 'normal' },
];

export const MOCK_AQI_DATA: AQIDataPoint[] = [
  { time: '08:00', aqi: 45 },
  { time: '10:00', aqi: 52 },
  { time: '12:00', aqi: 78 },
  { time: '14:00', aqi: 85 },
  { time: '16:00', aqi: 65 },
  { time: '18:00', aqi: 42 },
];

export const MOCK_SPIROMETRY_DATA: SpirometryDataPoint[] = [
  { day: 'Pzt', fev1: 2.8 },
  { day: 'Sal', fev1: 2.9 },
  { day: 'Çar', fev1: 2.7 },
  { day: 'Per', fev1: 3.1 },
  { day: 'Cum', fev1: 3.0 },
  { day: 'Cmt', fev1: 2.9 },
  { day: 'Paz', fev1: 3.2 },
];

export const EXERCISES_LIST: Exercise[] = [
  { 
    id: 1, 
    title: 'Büzük Dudak Solunumu', 
    duration: '5 dk', 
    status: 'pending',
    description: 'Burnunuzdan 2 saniye nefes alın, dudaklarınızı ıslık çalacakmış gibi büzerek 4 saniyede yavaşça verin. Hava yollarını açık tutar.'
  },
  { 
    id: 2, 
    title: 'Diyafram Solunumu', 
    duration: '10 dk', 
    status: 'pending',
    description: 'Bir elinizi göğsünüze, diğerini karnınıza koyun. Nefes alırken karnınızın şiştiğinden, verirken indiğinden emin olun. Akciğer kapasitesini artırır.'
  },
  { 
    id: 3, 
    title: 'Göğüs Kafesi Genişletme', 
    duration: '8 dk', 
    status: 'pending',
    description: 'Kollarınızı yanlara açarak derin nefes alın, verirken kollarınızı önde birleştirin. Göğüs kafesi esnekliğini artırır.'
  },
];

export const STATUS_COLORS = {
  normal: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200' },
  warning: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50', border: 'border-amber-200' },
  critical: { bg: 'bg-rose-500', text: 'text-rose-500', light: 'bg-rose-50', border: 'border-rose-200' },
};
