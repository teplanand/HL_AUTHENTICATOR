import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Machine, Location, locations as initialLocations } from "../data";

type MachineContextType = {
  locations: Location[];
  allMachines: Machine[];
};

const MachineDataContext = createContext<MachineContextType | undefined>(undefined);

let sharedLocations = initialLocations;
const listeners = new Set<(locations: Location[]) => void>();

// Simulation singleton
setInterval(() => {
  sharedLocations = sharedLocations.map(location => ({
    ...location,
    machines: location.machines.map(machine => {
      // Update machine randomly to simulate real activity
      if (Math.random() > 0.6) {
        return {
          ...machine,
          monitoringParams: machine.monitoringParams.map(param => ({
            ...param,
            value: param.value !== null
              ? parseFloat((param.value + (Math.random() - 0.5) * (param.value * 0.08)).toFixed(2))
              : (Math.random() * 50),
          })),
          alertCount: Math.random() > 0.95
            ? Math.max(0, machine.alertCount + (Math.random() > 0.5 ? 1 : -1))
            : machine.alertCount,
          status: machine.alertCount > 5 ? "warning" : "normal"
        } as Machine;
      }
      return machine;
    })
  }));
  listeners.forEach(l => l(sharedLocations));
}, 2000);

export const MachineDataProvider = ({ children }: { children: ReactNode }) => {
  const [locations, setLocations] = useState(sharedLocations);

  const allMachines = useMemo(() => {
    return locations.flatMap(loc => loc.machines);
  }, [locations]);

  useEffect(() => {
    const listener = (newLocations: Location[]) => setLocations(newLocations);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return (
    <MachineDataContext.Provider value={{ locations, allMachines }}>
      {children}
    </MachineDataContext.Provider>
  );
};

export const useMachineData = () => {
  const context = useContext(MachineDataContext);
  if (context === undefined) {
    throw new Error("useMachineData must be used within a MachineDataProvider");
  }
  return context;
};
