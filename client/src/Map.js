import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { v4 } from 'uuid';
import { formatRelative } from 'date-fns';
import axios from 'axios';

import config from './mapConfig';
import { getInitialUserLocations, updateUserLocations } from '../store/actions';

const Map = ({ onMapLoad }) => {
    const dispatch = useDispatch();
    const giftMarkers = useSelector(state => state.userLocations);
    const [selectedGift, setSelectedGift] = useState(null);

    const onMapClick = useCallback(async (e) => {
        console.log(JSON.stringify({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            time: new Date()
        }));
        const response = await axios.post('/new-location-click', {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            time: new Date()
        });
        console.log('response from update: ', response.data.userInputLocations);
        dispatch(updateUserLocations(response.data.userInputLocations));
    });

    useEffect(() => {
        dispatch(getInitialUserLocations());
    }, []);

    return (
        <GoogleMap
            {...config.mainConfig}
            onClick={onMapClick}
            onLoad={onMapLoad}
        >
            {giftMarkers && giftMarkers.map(item => (
                <Marker
                    key={v4()}
                    position={{
                        lat: item.lat,
                        lng: item.lng
                    }}
                    icon={{
                        url: '/gift.png',
                        scaledSize: new window.google.maps.Size(30, 30),
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(15, 15)
                    }}
                    onClick={() => {
                        console.log('item: ', item);
                        setSelectedGift(item);
                    }}
                />
            ))}
            {selectedGift ? (
                <InfoWindow
                    position={{
                        lat: selectedGift.lat,
                        lng: selectedGift.lng
                    }}
                    onCloseClick={() => setSelectedGift(null)}
                >
                    <div>
                        <h3>Zu Verschenken!</h3>
                        <p>Spotted {formatRelative(new Date(selectedGift.time), new Date())}</p>
                    </div>
                </InfoWindow>
            ) : null}
        </GoogleMap>
    );
};

export default Map;