import {
  Autocomplete,
  GoogleMap,
  LoadScript,
  CircleF,
  MarkerF,
} from "@react-google-maps/api";
import { useRef, useState } from "react";
import type { ProductFilters as ProductFilterValues } from "../../services/api";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  filters: ProductFilterValues;
  categories: CategoryOption[];
  onChange: (filters: ProductFilterValues) => void;
  onClear: () => void;
}

const mapCenter = { lat: -14.235, lng: -51.9253 };
const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  | string
  | undefined;

export function ProductFilters({
  filters,
  categories,
  onChange,
  onClear,
}: ProductFiltersProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [draftLocation, setDraftLocation] = useState({
    locationName: filters.locationName ?? "",
    latitude: filters.latitude,
    longitude: filters.longitude,
    radiusKm: filters.radiusKm ?? 25,
  });
  const hasLocation =
    filters.latitude !== undefined && filters.longitude !== undefined;
  const openLocationModal = () => {
    setDraftLocation({
      locationName: filters.locationName ?? "",
      latitude: filters.latitude,
      longitude: filters.longitude,
      radiusKm: filters.radiusKm ?? 25,
    });
    setIsMapOpen(true);
  };

  const applyLocation = () => {
    onChange({ ...filters, ...draftLocation });
    setIsMapOpen(false);
  };

  const clearLocation = () => {
    onChange({
      ...filters,
      locationName: undefined,
      latitude: undefined,
      longitude: undefined,
      radiusKm: undefined,
    });
    setIsMapOpen(false);
  };

  return (
    <section className="filters-panel" aria-label="Filtros de produtos">
      <div className="filters-topbar">
        <div className="filters-fields">
          <label className="form-field">
            <span>Categoria</span>
            <select
              value={filters.categoryId ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  categoryId: event.target.value || undefined,
                })
              }
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Preço mínimo</span>
            <input
              type="number"
              min="0"
              value={filters.minPrice ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  minPrice: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            />
          </label>

          <label className="form-field">
            <span>Preço máximo</span>
            <input
              type="number"
              min="0"
              value={filters.maxPrice ?? ""}
              onChange={(event) =>
                onChange({
                  ...filters,
                  maxPrice: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            />
          </label>
        </div>

        <div className="location-filter">
          <button
            type="button"
            className="map-toggle"
            aria-expanded={isMapOpen}
            onClick={openLocationModal}
          >
            <span className="map-marker" aria-hidden="true">
              +
            </span>
            {hasLocation
              ? `${filters.locationName ?? "Localização selecionada"} · ${filters.radiusKm ?? 25} km`
              : "Escolher localização"}
          </button>
          {hasLocation ? (
            <button
              type="button"
              className="clear-location"
              onClick={clearLocation}
            >
              Remover
            </button>
          ) : null}
        </div>
      </div>

      {isMapOpen ? (
        <div
          className="location-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsMapOpen(false);
          }}
        >
          <section
            className="location-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-modal-title"
          >
            <div className="location-modal-header">
              <div>
                <h2 id="location-modal-title">Mudar localização</h2>
                <p>Pesquise por cidade, bairro ou código postal.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="Fechar"
                onClick={() => setIsMapOpen(false)}
              >
                ×
              </button>
            </div>

            {mapsApiKey ? (
              <LoadScript googleMapsApiKey={mapsApiKey} libraries={["places"]}>
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocompleteRef.current = autocomplete;
                  }}
                  onPlaceChanged={() => {
                    const autocomplete = autocompleteRef.current;
                    const place = autocomplete?.getPlace();
                    const position = place?.geometry?.location?.toJSON();
                    if (place && position) {
                      setDraftLocation((current) => ({
                        ...current,
                        locationName:
                          place.formatted_address ??
                          place.name ??
                          "Localização selecionada",
                        latitude: position.lat,
                        longitude: position.lng,
                      }));
                    }
                  }}
                >
                  <label className="location-search-field">
                    <span>Localização</span>
                    <input
                      value={draftLocation.locationName}
                      onChange={(event) =>
                        setDraftLocation((current) => ({
                          ...current,
                          locationName: event.target.value,
                        }))
                      }
                      placeholder="Novo Hamburgo"
                    />
                  </label>
                </Autocomplete>

                <label className="location-radius-field">
                  <span>Raio</span>
                  <select
                    value={draftLocation.radiusKm}
                    onChange={(event) =>
                      setDraftLocation((current) => ({
                        ...current,
                        radiusKm: Number(event.target.value),
                      }))
                    }
                  >
                    {[5, 10, 25, 41, 50, 100].map((radius) => (
                      <option key={radius} value={radius}>
                        {radius} quilômetros
                      </option>
                    ))}
                  </select>
                </label>

                <GoogleMap
                  mapContainerClassName="filter-map location-modal-map"
                  center={
                    draftLocation.latitude !== undefined &&
                    draftLocation.longitude !== undefined
                      ? {
                          lat: draftLocation.latitude,
                          lng: draftLocation.longitude,
                        }
                      : mapCenter
                  }
                  zoom={draftLocation.latitude !== undefined ? 10 : 3}
                  onClick={(event) => {
                    const position = event.latLng?.toJSON();
                    if (position)
                      setDraftLocation((current) => ({
                        ...current,
                        latitude: position.lat,
                        longitude: position.lng,
                      }));
                  }}
                >
                  {draftLocation.latitude !== undefined &&
                  draftLocation.longitude !== undefined ? (
                    <>
                      <MarkerF
                        position={{
                          lat: draftLocation.latitude,
                          lng: draftLocation.longitude,
                        }}
                      />
                      <CircleF
                        center={{
                          lat: draftLocation.latitude,
                          lng: draftLocation.longitude,
                        }}
                        radius={draftLocation.radiusKm * 1000}
                        options={{
                          fillColor: "#176b68",
                          fillOpacity: 0.15,
                          strokeColor: "#176b68",
                          strokeOpacity: 0.7,
                          strokeWeight: 2,
                        }}
                      />
                    </>
                  ) : null}
                </GoogleMap>
              </LoadScript>
            ) : (
              <p className="map-help">
                Configure `VITE_GOOGLE_MAPS_API_KEY` para ativar o mapa.
              </p>
            )}

            <div className="location-modal-actions">
              <button
                type="button"
                className="inventory-action secondary"
                onClick={() => setIsMapOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={applyLocation}
              >
                Aplicar localização
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="filters-actions">
        <button type="button" className="clear-filter" onClick={onClear}>
          Limpar filtros
        </button>
      </div>
    </section>
  );
}
