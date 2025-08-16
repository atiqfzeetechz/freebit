import { useEffect, useState } from "react";
import DeviceInfo from "react-native-device-info";

export default function useDeviceInfo() {
  const [deviceDetails, setDeviceDetails] = useState<any>(null);

  useEffect(() => {
    const getDeviceDetails = async () => {
      try {
        const uniqueId = await DeviceInfo.getUniqueId();
        const deviceName = await DeviceInfo.getDeviceName();
        const brand = DeviceInfo.getBrand();
        const model = DeviceInfo.getModel();
        const systemName = DeviceInfo.getSystemName();
        const systemVersion = DeviceInfo.getSystemVersion();
        const appVersion = DeviceInfo.getVersion();
        const buildNumber = DeviceInfo.getBuildNumber();

        setDeviceDetails({
          uniqueId,
          deviceName,
          brand,
          model,
          systemName,
          systemVersion,
          appVersion,
          buildNumber,
        });
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    };

    getDeviceDetails();
  }, []);

  return deviceDetails;
}
