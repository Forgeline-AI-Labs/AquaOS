/** TypeScript types matching the reef-pi backend API responses. */

export interface SystemSummary {
  name: string;
  ip: string;
  current_time: string;
  uptime: string;
  cpu_temperature: string;
  version: string;
  model: string;
}

export interface TemperatureController {
  id: string;
  name: string;
  max: number;
  min: number;
  hysteresis: number;
  heater: string;
  cooler: string;
  period: number;
  control: boolean;
  enable: boolean;
  sensor: string;
  fahrenheit: boolean;
  is_macro: boolean;
  one_shot: boolean;
  notify: { enable: boolean; max: number; min: number };
  chart: { ymin: number; ymax: number; color: string };
}

export interface TemperatureReading {
  temperature: number;
}

export interface Equipment {
  id: string;
  name: string;
  outlet: string;
  on: boolean;
  stay_off_on_boot: boolean;
}

export interface PhProbe {
  id: string;
  name: string;
  enable: boolean;
  period: number;
  analog_input: string;
  control: boolean;
  min: number;
  max: number;
  notify: { enable: boolean; min: number; max: number };
  chart: { ymin: number; ymax: number; color: string; unit: string };
}

export interface ATO {
  id: string;
  name: string;
  inlet: string;
  pump: string;
  period: number;
  control: boolean;
  enable: boolean;
  is_macro: boolean;
  one_shot: boolean;
  disable_on_alert: boolean;
  notify: { enable: boolean; max: number };
}
