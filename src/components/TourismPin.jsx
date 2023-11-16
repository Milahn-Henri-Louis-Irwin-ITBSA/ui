import { useRef } from 'react';
import pinDefault from '@/icons/download.png';
import hotel from '@/icons/Hotel.png';
import fuel from '@/icons/fuel.png';
import airport from '@/icons/airport.png';
import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import PropTypes from 'prop-types';
const customIcons = {
  fuel: fuel,
  airport: airport,
  hotel: hotel,
};

const createCustomIcon = (service) => {
  const iconUrl = customIcons[service] || pinDefault;
  return new Icon({
    iconUrl: iconUrl,
    iconSize: [45, 45],
  });
};
const TourismPin = ({ coords, formattedAddress, types, iconType }) => {
  const markerRef = useRef(null);

  return (
    <Marker position={coords} ref={markerRef} icon={createCustomIcon(iconType)}>
      <Popup className="bg-transparent p-4 rounded-md ">
        <h1 className="text-lg font-bold">{formattedAddress}</h1>
        <div className="flex flex-wrap gap-1 mt-2 ">
          {types &&
            types.length > 0 &&
            types.map((type, indx) => (
              <span
                className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                key={indx}
              >
                {type}
              </span>
            ))}
        </div>
      </Popup>
    </Marker>
  );
};
export default TourismPin;

TourismPin.propTypes = {
  coords: PropTypes.array,
  formattedAddress: PropTypes.string,
  types: PropTypes.array,
  iconType: PropTypes.string,
};
