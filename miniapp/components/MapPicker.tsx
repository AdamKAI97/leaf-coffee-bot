import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

type Lang = "ru" | "uz" | "en";

type Props = {
  lang: Lang;
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number, address: string) => void;
};

const LABELS: Record<Lang, { locate: string; confirm: string; resolving: string }> = {
  ru: { locate: "📍 Моё местоположение", confirm: "Подтвердить адрес", resolving: "Определяем адрес..." },
  uz: { locate: "📍 Mening joylashuvim", confirm: "Manzilni tasdiqlash", resolving: "Manzil aniqlanmoqda..." },
  en: { locate: "📍 My location", confirm: "Confirm address", resolving: "Resolving address..." },
};

export default function MapPicker({ lang, initialLat, initialLng, onConfirm }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState("");
  const [resolving, setResolving] = useState(false);

  async function reverseGeocode(lat: number, lng: number) {
    setResolving(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${lang}`
      );
      const data = await res.json();
      setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setResolving(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "map-pin",
        html: '<div class="map-pin-dot"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 20],
      });

      const marker = L.marker([initialLat, initialLng], { draggable: true, icon }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      reverseGeocode(initialLat, initialLng);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 16);
            marker.setLatLng([latitude, longitude]);
            setCoords({ lat: latitude, lng: longitude });
            reverseGeocode(latitude, longitude);
          },
          () => {},
          { timeout: 5000 }
        );
      }
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function locateMe() {
    if (!navigator.geolocation || !mapRef.current || !markerRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      mapRef.current!.setView([latitude, longitude], 16);
      markerRef.current!.setLatLng([latitude, longitude]);
      setCoords({ lat: latitude, lng: longitude });
      reverseGeocode(latitude, longitude);
    });
  }

  const labels = LABELS[lang];

  return (
    <>
      <div ref={mapContainerRef} className="map-container" />
      <button className="map-locate-btn" onClick={locateMe}>{labels.locate}</button>
      <p className="cart-payment-note" style={{ marginTop: 10 }}>
        {resolving ? labels.resolving : address}
      </p>
      <div className="sheet-footer">
        <button
          className="add-btn"
          style={{ width: "100%" }}
          onClick={() => onConfirm(coords.lat, coords.lng, address)}
          disabled={resolving || !address}
        >
          <span>{labels.confirm}</span>
        </button>
      </div>
    </>
  );
}
