import { useState, useEffect, useMemo } from "react";
import { Machine, locations as initialLocations, allMachines as initialAllMachines } from "../data";

export const useMachineLiveData = () => {
  const [locations, setLocations] = useState(initialLocations);
  
  // Flattened machines for easier access, but derived from locations state
  const allMachines = useMemo(() => {
    return locations.flatMap(loc => loc.machines);
  }, [locations]);

  useEffect(() => {
    // Simulate WebSocket connection and real-time updates
    const interval = setInterval(() => {
      setLocations(prevLocations => {
        return prevLocations.map(location => ({
          ...location,
          machines: location.machines.map(machine => {
            // Only update some machines randomly to simulate real activity
            if (Math.random() > 0.7) {
              return {
                ...machine,
                monitoringParams: machine.monitoringParams.map(param => ({
                  ...param,
                  // Randomly fluctuate the value within 5%
                  value: param.value !== null 
                    ? parseFloat((param.value + (Math.random() - 0.5) * (param.value * 0.05)).toFixed(2))
                    : (Math.random() * 50), // Initialize if null
                })),
                // Occasionally change status or alert count
                alertCount: Math.random() > 0.95 
                  ? Math.max(0, machine.alertCount + (Math.random() > 0.5 ? 1 : -1))
                  : machine.alertCount,
                status: machine.alertCount > 5 ? "warning" : "normal"
              } as Machine;
            }
            return machine;
          })
        }));
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return { locations, allMachines };
};
