import { DeviceDetails, TotalSystemData } from "../hooks/useSystemQuery";
import { getPercentage } from "../services/getPercentage";
import { getStorageUnits } from "../services/getStorageUnits";
import Container from "./Container";

type HeaderProps = {
  deviceDetails: DeviceDetails;
  totalSystemData: TotalSystemData;
};

const Stat = ({ label, stat }: { label: string; stat: string | number }) => {
  return (
    <p className="text-lg font-medium">
      {label}: <span className="font-normal">{stat}</span>
    </p>
  );
};

const Header = ({ deviceDetails, totalSystemData }: HeaderProps) => {
  return (
    <Container>
      <h1 className="text-3xl font-bold">
        System Details:{" "}
        <span className=" font-semibold">{deviceDetails.name}</span>
      </h1>
      <div className="mt-5 flex flex-row justify-between flex-wrap">
        <Stat label="System Architecture" stat={deviceDetails.architecture} />
        <Stat label="Platform" stat={deviceDetails.platform} />
        <Stat label="Distribution" stat={deviceDetails.distro} />
        <Stat label="CPU Cores" stat={totalSystemData.cores} />
        <Stat
          label="Total Memory"
          stat={getStorageUnits(totalSystemData.total_memory)}
        />
        <Stat
          label="Used Memory"
          stat={getStorageUnits(totalSystemData.used_memory)}
        />
        <Stat
          label="Used Memory Percentage"
          stat={getPercentage(
            totalSystemData.used_memory,
            totalSystemData.total_memory
          )}
        />
      </div>
    </Container>
  );
};

export default Header;
