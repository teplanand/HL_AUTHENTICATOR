export type MonitoringParam = {
  label: string;
  value: number | null;
  unit: string;
};

export type Machine = {
  id: string;
  name: string;
  clientName: string;
  locationName: string;
  status: "warning" | "normal";
  monitoringParams: MonitoringParam[];
  alertCount: number;
  image?: string; // Optional machine image URL
};

export type Location = {
  name: string;
  clientName: string;
  machines: Machine[];
};

export const locations: Location[] = [
  {
    name: "Chennai Plant",
    clientName: "Acme Gear Systems",
    machines: [
      {
        id: "MCH003",
        name: "Assembly Line A",
        clientName: "Acme Gear Systems",
        locationName: "Chennai Plant",
        status: "warning",
        monitoringParams: [
          { label: "vibration", value: 5.79, unit: "mm/s" },
        ],
        alertCount: 10,
      },
      {
        id: "MCH004",
        name: "Assembly Line B",
        clientName: "Acme Gear Systems",
        locationName: "Chennai Plant",
        status: "normal",
        monitoringParams: [
          { label: "pressure", value: null, unit: "bar" },
          { label: "temperature", value: null, unit: "C" },
        ],
        alertCount: 0,
      },
    ],
  },
  {
    name: "Pune Plant",
    clientName: "Acme Gear Systems",
    machines: [
      {
        id: "MCH001",
        name: "Gearbox Line 1",
        clientName: "Acme Gear Systems",
        locationName: "Pune Plant",
        status: "warning",
        monitoringParams: [
          { label: "temperature", value: 55.67, unit: "C" },
          { label: "vibration", value: 6.35, unit: "mm/s" },
        ],
        alertCount: 10,
      },
      {
        id: "MCH002",
        name: "Gearbox Line 2",
        clientName: "Acme Gear Systems",
        locationName: "Pune Plant",
        status: "warning",
        monitoringParams: [
          { label: "temperature", value: 80.74, unit: "C" },
        ],
        alertCount: 10,
      },
    ],
  },
  {
    name: "Jaipur Test Center",
    clientName: "Orbit Transmission Labs",
    machines: [
      {
        id: "MCH302",
        name: "Endurance Test Bay",
        clientName: "Orbit Transmission Labs",
        locationName: "Jaipur Test Center",
        status: "normal",
        monitoringParams: [
          { label: "vibration", value: null, unit: "mm/s" },
        ],
        alertCount: 0,
      },
    ],
  },
  {
    name: "Surat Facility",
    clientName: "Orbit Transmission Labs",
    machines: [
      {
        id: "MCH301",
        name: "Prototype Cell 1",
        clientName: "Orbit Transmission Labs",
        locationName: "Surat Facility",
        status: "normal",
        monitoringParams: [
          { label: "pressure", value: null, unit: "bar" },
          { label: "temperature", value: null, unit: "C" },
          { label: "vibration", value: null, unit: "mm/s" },
        ],
        alertCount: 0,
      },
    ],
  },
  {
    name: "Noida Assembly",
    clientName: "Prime Rotor Manufacturing",
    machines: [
      {
        id: "MCH402",
        name: "CNC Turning Center A",
        clientName: "Prime Rotor Manufacturing",
        locationName: "Noida Assembly",
        status: "normal",
        monitoringParams: [
          { label: "vibration", value: 2.14, unit: "mm/s" },
          { label: "temperature", value: 42.3, unit: "C" },
        ],
        alertCount: 2,
      },
    ],
  },
  {
    name: "Rajkot Works",
    clientName: "Prime Rotor Manufacturing",
    machines: [
      {
        id: "MCH401",
        name: "Shaft Grinding Unit",
        clientName: "Prime Rotor Manufacturing",
        locationName: "Rajkot Works",
        status: "warning",
        monitoringParams: [
          { label: "vibration", value: 8.21, unit: "mm/s" },
          { label: "temperature", value: 72.5, unit: "C" },
        ],
        alertCount: 7,
      },
    ],
  },
  {
    name: "Ahmedabad Plant",
    clientName: "Tara Motion Works",
    machines: [
      {
        id: "MCH201",
        name: "Worm Gear Assembly",
        clientName: "Tara Motion Works",
        locationName: "Ahmedabad Plant",
        status: "normal",
        monitoringParams: [
          { label: "temperature", value: 38.9, unit: "C" },
          { label: "pressure", value: 4.2, unit: "bar" },
        ],
        alertCount: 0,
      },
      {
        id: "MCH202",
        name: "Bevel Gear CNC",
        clientName: "Tara Motion Works",
        locationName: "Ahmedabad Plant",
        status: "warning",
        monitoringParams: [
          { label: "vibration", value: 7.88, unit: "mm/s" },
        ],
        alertCount: 5,
      },
      {
        id: "MCH203",
        name: "Helical Mixer Drive",
        clientName: "Tara Motion Works",
        locationName: "Ahmedabad Plant",
        status: "normal",
        monitoringParams: [
          { label: "temperature", value: 44.1, unit: "C" },
          { label: "vibration", value: 1.92, unit: "mm/s" },
          { label: "pressure", value: 3.8, unit: "bar" },
        ],
        alertCount: 1,
      },
      {
        id: "MCH204",
        name: "Planetary Test Rig",
        clientName: "Tara Motion Works",
        locationName: "Ahmedabad Plant",
        status: "normal",
        monitoringParams: [
          { label: "vibration", value: 0.45, unit: "mm/s" },
        ],
        alertCount: 0,
      },
    ],
  },
];

export const allMachines: Machine[] = locations.flatMap((loc) => loc.machines);
