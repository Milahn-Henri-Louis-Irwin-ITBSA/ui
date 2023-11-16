import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase-config';
import Logo from '@/icons/SidebarLogo.png';
import pinFire from '../icons/MapLocFire.png';
import pinAmbulance from '../icons/MapLocAmbulance.png';
import pinAnimal from '../icons/MapLocAnimal.png';
import pinPolice from '../icons/MapLocPolice.png';
import pinConstruction from '../icons/MapLocConstruction.png';
import PropTypes from 'prop-types';

export default function Sidebar({
  showSidebar,
  setShowSidebar,
  updateTourismData,
}) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [kmValues, setKmValues] = useState({
    hotel: 1,
    airport: 1,
    fuel: 1,
  });
  const [eventCounts, setEventCounts] = useState({
    fire: 0,
    medical: 0,
    animal: 0,
    police: 0,
    construction: 0,
  });

  const updateSelectedServices = (service) => {
    setSelectedServices((prevServices) => {
      if (prevServices.includes(service)) {
        return prevServices.filter((s) => s !== service);
      } else {
        return [...prevServices, service];
      }
    });
  };

  async function retrieveUserCurrentCoordinates() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  const handleRangeChange = (e) => {
    setKmValues((prevValues) => ({
      ...prevValues,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchTourismData = async () => {
    try {
      const position = await retrieveUserCurrentCoordinates();
      const { latitude, longitude } = position.coords;
      const token = await auth.currentUser.getIdToken();

      const servicesToRequest = selectedServices.map((service) => ({
        name: service,
        radius: kmValues[service] * 1000,
      }));

      if (servicesToRequest.length === 0) {
        console.log('No services selected');
        return;
      }

      const response = await fetch(import.meta.env.VITE_TOURISM_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coordinates: {
            latitude,
            longitude,
          },
          services: servicesToRequest,
        }),
      });

      if (response.ok) {
        const jsonResponse = await response.json();
        const formattedData = jsonResponse.data
          .map((service) => {
            return service.places.map((place) => ({
              coords: {
                latitude: place.location.latitude,
                longitude: place.location.longitude,
              },
              formattedAddress: place.formattedAddress,
              types: place.types,
              iconType: determineIconType(place),
            }));
          })
          .flat();
        updateTourismData(formattedData);
      } else {
        throw new Error('Network response was not ok.');
      }
    } catch (error) {
      console.error('Fetch operation:', error.message);
    }
  };

  const determineIconType = (place) => {
    if (place.types.includes('gas_station')) {
      return 'fuel';
    }
    if (place.types.includes('airport')) {
      return 'airport';
    }
    if (place.types.includes('hotel')) {
      return 'hotel';
    }
  };

  useEffect(() => {
    const collectionRef = collection(db, 'map');
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const counts = {
        fire: 0,
        medical: 0,
        animal: 0,
        police: 0,
        construction: 0,
      };
      snapshot.docs.forEach((doc) => {
        const eventData = doc.data();
        if (eventData.event) {
          counts[eventData.event]++;
        }
      });
      setEventCounts(counts);
    });

    return () => unsubscribe();
  }, []);

  if (!showSidebar) {
    return null;
  }

  // const { kmValue, kmValueFlights, kmValueFuel } = kmValues;

  return (
    <div className="h-[95vh] w-[20rem] absolute left-5 top-5 z-[99999] bg-slate-100 rounded-3xl shadow-xl">
      <div className="h-1/5 pt-5 px-5 mb-6">
        <div className="h-[10px] pt-2 flex items-center justify-start">
          <svg
            onClick={() => setShowSidebar(false)}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="cursor-pointer"
          >
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
          </svg>
        </div>
        <div className="h-36 flex items-center justify-center ">
          <img
            id="logo"
            src={Logo}
            alt="logo"
            className=" rounded-full aspect-sqaure w-60"
          />
        </div>
      </div>
      <div className="h-4/5 flex flex-col justify-start items-center pb-4 px-2 font-bold">
        <div className="flex gap-5 mb-6">
          <div className="text-center">
            <img src={pinFire} alt="Fire" className="w-9 mb-1" />
            <p className="text-blue-500 font-semibold text-lg">
              {eventCounts.fire}
            </p>
          </div>
          <div className=" text-center">
            <img src={pinAmbulance} alt="Fire" className="w-9 mb-1" />
            <p className="text-blue-500 font-semibold text-lg">
              {eventCounts.medical}
            </p>
          </div>
          <div className=" text-center">
            <img src={pinAnimal} alt="Fire" className="w-9 mb-1" />
            <p className="text-blue-500 font-semibold text-lg">
              {eventCounts.animal}
            </p>
          </div>
          <div className=" text-center">
            <img src={pinPolice} alt="Fire" className="w-9 mb-1" />
            <p className="text-blue-500 font-semibold text-lg">
              {eventCounts.police}
            </p>
          </div>
          <div className=" text-center">
            <img src={pinConstruction} alt="Fire" className="w-9 mb-1" />
            <p className="text-blue-500 font-semibold text-lg">
              {eventCounts.construction}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center justify-center w-full mb-2">
          <hr className="w-64 h-1 my-8 bg-gray-600 border-0 rounded "></hr>
          <div className="absolute px-3 -translate-x-1/2 bg-slate-100 left-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-fuel-pump w-7 text-gray-600"
              viewBox="0 0 16 16"
            >
              <path d="M3 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5Z" />
              <path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c-.011-.476-.053-.894-.201-1.222a.97.97 0 0 0-.394-.458c-.184-.11-.464-.195-.9-.195a.5.5 0 0 1 0-1c.564 0 1.034.11 1.412.336.383.228.634.551.794.907.295.655.294 1.465.294 2.081v3.175a.5.5 0 0 1-.5.501H15v4.5a1.5 1.5 0 0 1-3 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V2Zm9 0a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v13h8V2Z" />
            </svg>
          </div>
        </div>

        <div className="mb-4  w-64">
          <label htmlFor="km-range" className="block text-gray-700 mb-1">
            Select a KM Range:{' '}
            <span className="text-blue-500 font-semibold ms-1">
              {kmValues.fuel} km
            </span>
          </label>
          <input
            type="range"
            id="km-range"
            name="fuel"
            min="1"
            max="100"
            value={kmValues.fuel}
            onChange={handleRangeChange}
            className="w-full h-4 bg-gray-300 rounded-full appearance-none focus:outline-none"
          />
        </div>

        <button
          className="bg-[#005DCA] text-white p-3 rounded-md flex items-center justify-center w-[16.25rem]"
          onClick={() => updateSelectedServices('fuel')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="bi bi-fuel-pump w-5 text-white me-2"
            viewBox="0 0 16 16"
          >
            <path d="M3 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5Z" />
            <path d="M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c-.011-.476-.053-.894-.201-1.222a.97.97 0 0 0-.394-.458c-.184-.11-.464-.195-.9-.195a.5.5 0 0 1 0-1c.564 0 1.034.11 1.412.336.383.228.634.551.794.907.295.655.294 1.465.294 2.081v3.175a.5.5 0 0 1-.5.501H15v4.5a1.5 1.5 0 0 1-3 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V2Zm9 0a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v13h8V2Z" />
          </svg>
          <span className="text-sm">Select Fuel Stations</span>
        </button>

        <div className="inline-flex items-center justify-center w-full">
          <hr className="w-64 h-1 my-8 bg-gray-600 border-0 rounded "></hr>
          <div className="absolute px-3 -translate-x-1/2 bg-slate-100 left-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-building-fill w-7 text-gray-600"
              viewBox="0 0 16 16"
            >
              <path d="M3 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3v-3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V16h3a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H3Zm1 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5ZM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM4.5 8h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Z" />
            </svg>
          </div>
        </div>

        <div className="mb-4 w-64">
          <label htmlFor="km-range" className="block text-gray-700 mb-1">
            Select a KM Range:{' '}
            <span className="text-blue-500 font-semibold ms-1">
              {kmValues.hotel} km
            </span>
          </label>
          <input
            type="range"
            id="km-range"
            name="hotel"
            min="1"
            max="100"
            value={kmValues.hotel}
            onChange={handleRangeChange}
            className="w-full h-4 bg-gray-300 rounded-full appearance-none focus:outline-none"
          />
        </div>

        <button
          className="bg-[#005DCA] text-white p-3 rounded-md flex items-center justify-center w-[16.25rem]"
          onClick={() => updateSelectedServices('hotel')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="bi bi-building-fill w-5 text-white me-2"
            viewBox="0 0 16 16"
          >
            <path d="M3 0a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3v-3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V16h3a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1H3Zm1 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5ZM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM7.5 5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM4.5 8h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5Z" />
          </svg>
          <span className="text-sm">Select Hotels</span>
        </button>

        <div className="inline-flex items-center justify-center w-full">
          <hr className="w-64 h-1 my-8 bg-gray-600 border-0 rounded "></hr>
          <div className="absolute px-3 -translate-x-1/2 bg-slate-100 left-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-airplane-fill w-6 text-gray-600"
              viewBox="0 0 16 16"
            >
              <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849Z" />
            </svg>
          </div>
        </div>

        <div className="mb-4 w-64">
          <label htmlFor="km-range" className="block text-gray-700 mb-1">
            Select a KM Range:{' '}
            <span className="text-blue-500 font-semibold ms-1">
              {kmValues.airport} km
            </span>
          </label>
          <input
            type="range"
            id="km-range-flights"
            name="airport"
            min="1"
            max="100"
            value={kmValues.airport}
            onChange={handleRangeChange}
            className="w-full h-4 bg-gray-300 rounded-full appearance-none focus:outline-none"
          />
        </div>

        <button
          onClick={() => updateSelectedServices('airport')}
          className="bg-[#005DCA] text-white p-3 rounded-md flex items-center justify-center w-[16.25rem] mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="bi bi-airplane-fill w-5 text-white me-2"
            viewBox="0 0 16 16"
          >
            <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849Z" />
          </svg>
          <span className="text-sm">Select Airports</span>
        </button>
        <button
          onClick={fetchTourismData}
          className="bg-[#005DCA] text-white p-3 rounded-md flex items-center justify-center w-[16.25rem] mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="bi bi-eyeglasses w-5 text-white me-2"
            viewBox="0 0 16 16"
          >
            <path d="M4 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm2.625.547a3 3 0 0 0-5.584.953H.5a.5.5 0 0 0 0 1h.541A3 3 0 0 0 7 8a1 1 0 0 1 2 0 3 3 0 0 0 5.959.5h.541a.5.5 0 0 0 0-1h-.541a3 3 0 0 0-5.584-.953A1.993 1.993 0 0 0 8 6c-.532 0-1.016.208-1.375.547zM14 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
          <span className="text-sm">Display Selected</span>
        </button>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  showSidebar: PropTypes.bool,
  setShowSidebar: PropTypes.func,
};
