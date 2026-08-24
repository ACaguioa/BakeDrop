import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultPosition = [14.3294, 120.9367];

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(event) {
      setPosition([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={customIcon}
    />
  ) : null;
}

function Reservation() {
  const navigate = useNavigate();

  // =========================
  // ORDER TYPE
  // =========================

  const [orderType, setOrderType] = useState("pickup");

  // =========================
  // LOCATION
  // =========================

  const [position, setPosition] =
    useState(defaultPosition);

  // =========================
  // CUSTOMER INFORMATION
  // =========================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    landmark: "",
    date: "",
    time: "",
    notes: "",
  });

  // =========================
  // HANDLE INPUT
  // =========================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =========================
  // SUBMIT
  // =========================

  function handleSubmit(event) {
    event.preventDefault();

    const reservationData = {
      ...formData,

      orderType,

      latitude: position[0],
      longitude: position[1],
    };

    // Save reservation temporarily
    // so Payment.jsx can access it
    sessionStorage.setItem(
      "bakedropReservation",
      JSON.stringify(reservationData)
    );

    // Go to payment
    navigate("/payment");
  }

  return (
    <section className="form-page">

      <div className="form-container reservation-form">

        {/* =========================
            HEADER
        ========================= */}

        <span className="eyebrow">
          BAKEDROP ORDER
        </span>

        <h1>
          Choose your
          <br />
          <em>order method.</em>
        </h1>

        <p>
          Select whether you would like to pick up
          your order or have it delivered.
        </p>


        {/* =========================
            ORDER TYPE
        ========================= */}

        <div className="order-type">

          <button
            type="button"
            className={
              orderType === "pickup"
                ? "order-type-active"
                : ""
            }
            onClick={() =>
              setOrderType("pickup")
            }
          >
            <span>01</span>

            <strong>
              Pickup
            </strong>

            <small>
              Collect your order from BakeDrop
            </small>
          </button>


          <button
            type="button"
            className={
              orderType === "delivery"
                ? "order-type-active"
                : ""
            }
            onClick={() =>
              setOrderType("delivery")
            }
          >
            <span>02</span>

            <strong>
              Delivery
            </strong>

            <small>
              Have your order delivered
            </small>
          </button>

        </div>


        {/* =========================
            FORM
        ========================= */}

        <form onSubmit={handleSubmit}>

          {/* =========================
              CUSTOMER INFORMATION
          ========================= */}

          <div className="form-section">

            <div className="form-section-title">

              <span>01</span>

              <div>

                <h2>
                  Customer Information
                </h2>

                <p>
                  Tell us where we can reach you.
                </p>

              </div>

            </div>


            <div className="form-row">

              <label>
                First Name

                <input
                  type="text"
                  name="firstName"
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </label>


              <label>
                Last Name

                <input
                  type="text"
                  name="lastName"
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </label>

            </div>


            <label>
              Email Address

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>


            <label>
              Contact Number

              <input
                type="tel"
                name="contact"
                placeholder="09XXXXXXXXX"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </label>

          </div>


          {/* =========================
              LOCATION
          ========================= */}

          <div className="form-section">

            <div className="form-section-title">

              <span>02</span>

              <div>

                <h2>
                  {orderType === "pickup"
                    ? "Pickup Details"
                    : "Delivery Location"}
                </h2>

                <p>
                  {orderType === "pickup"
                    ? "Choose when you would like to collect your order."
                    : "Pin the exact location where you want your order delivered."}
                </p>

              </div>

            </div>


            {orderType === "pickup" ? (

              <div className="pickup-location">

                <span>
                  BAKE DROP PICKUP LOCATION
                </span>

                <strong>
                  BakeDrop Bakery
                </strong>

                <p>
                  Dasmariñas, Cavite
                </p>

              </div>

            ) : (

              <>

                {/* MAP */}

                <div className="map-wrapper">

                  <MapContainer
                    center={position}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="delivery-map"
                  >

                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationMarker
                      position={position}
                      setPosition={setPosition}
                    />

                  </MapContainer>

                </div>


                {/* COORDINATES */}

                <div className="location-selected">

                  <span>
                    PINNED LOCATION
                  </span>

                  <p>
                    Latitude:{" "}
                    {position[0].toFixed(6)}
                  </p>

                  <p>
                    Longitude:{" "}
                    {position[1].toFixed(6)}
                  </p>

                </div>


                {/* ADDRESS */}

                <label>
                  Complete Address

                  <textarea
                    name="address"
                    rows="3"
                    placeholder="House number, street, barangay, city..."
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />

                </label>


                {/* LANDMARK */}

                <label>
                  Landmark / Delivery Notes

                  <textarea
                    name="landmark"
                    rows="3"
                    placeholder="Example: Near the barangay hall..."
                    value={formData.landmark}
                    onChange={handleChange}
                  />

                </label>

              </>

            )}

          </div>


          {/* =========================
              DATE AND TIME
          ========================= */}

          <div className="form-section">

            <div className="form-section-title">

              <span>03</span>

              <div>

                <h2>
                  Schedule
                </h2>

                <p>
                  Choose your preferred date and time.
                </p>

              </div>

            </div>


            <div className="form-row">

              <label>

                {orderType === "pickup"
                  ? "Pickup Date"
                  : "Delivery Date"}

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

              </label>


              <label>

                {orderType === "pickup"
                  ? "Pickup Time"
                  : "Delivery Time"}

                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select a time
                  </option>

                  <option value="9:00 AM">
                    9:00 AM
                  </option>

                  <option value="10:00 AM">
                    10:00 AM
                  </option>

                  <option value="11:00 AM">
                    11:00 AM
                  </option>

                  <option value="1:00 PM">
                    1:00 PM
                  </option>

                  <option value="2:00 PM">
                    2:00 PM
                  </option>

                  <option value="3:00 PM">
                    3:00 PM
                  </option>

                  <option value="4:00 PM">
                    4:00 PM
                  </option>

                </select>

              </label>

            </div>

          </div>


          {/* =========================
              NOTES
          ========================= */}

          <div className="form-section">

            <div className="form-section-title">

              <span>04</span>

              <div>

                <h2>
                  Special Requests
                </h2>

                <p>
                  Anything else we should know?
                </p>

              </div>

            </div>


            <label>

              Order Notes

              <textarea
                name="notes"
                rows="4"
                placeholder="Special instructions for your order..."
                value={formData.notes}
                onChange={handleChange}
              />

            </label>

          </div>


          {/* =========================
              SUBMIT
          ========================= */}

          <button
            type="submit"
            className="btn btn-gold reservation-submit"
          >
            {orderType === "pickup"
              ? "Continue to Payment"
              : "Continue to Payment"}
          </button>

        </form>

      </div>

    </section>
  );
}

export default Reservation;