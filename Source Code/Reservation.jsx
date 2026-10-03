import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// =====================================================
// MAP SETTINGS
// =====================================================

const defaultPosition = [14.3294, 120.9367];

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


// =====================================================
// LOCATION MARKER
// =====================================================

function LocationMarker({
  position,
  setPosition,
}) {
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


// =====================================================
// MAP CONTROLLER
// =====================================================

function MapController({
  position,
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.flyTo(
      position,
      17,
      {
        duration: 1.2,
      }
    );
  }, [map, position]);

  return null;
}


// =====================================================
// RESERVATION
// =====================================================

function Reservation() {
  const navigate = useNavigate();

  const {
    selectedCartItems,
  } = useCart();


  // =====================================================
  // FLASH DEAL DETECTION
  // =====================================================

  const hasFlashDeal =
    selectedCartItems.some(
      (item) =>
        Boolean(
          item.flash_deal_id
        )
    );


  // =====================================================
  // DATE HELPERS
  // =====================================================

  function getTodayDate() {
    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        today.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;
  }


  function getTomorrowDate() {
    const tomorrow =
      new Date();

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    const year =
      tomorrow.getFullYear();

    const month =
      String(
        tomorrow.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        tomorrow.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;
  }


  // =====================================================
  // MINIMUM ORDER DATE
  // =====================================================

  const minimumOrderDate =
    hasFlashDeal
      ? getTodayDate()
      : getTomorrowDate();


  // =====================================================
  // ORDER TYPE
  // =====================================================

  const [orderType, setOrderType] =
    useState("pickup");


  // =====================================================
  // RESERVATION DETAILS
  // =====================================================

  const [formData, setFormData] =
    useState({
      date: "",
      time: "",
      notes: "",
    });


  // =====================================================
  // SCHEDULE CAPACITY
  // =====================================================

  const [scheduleInfo, setScheduleInfo] =
    useState({
      loading: false,
      checked: false,
      disabled: false,
      maximumOrders: 30,
      reservedOrders: 0,
      remainingSlots: 30,
    });


  const [scheduleError, setScheduleError] =
    useState("");


  // =====================================================
  // SAVED ADDRESSES
  // =====================================================

  const [addresses, setAddresses] =
    useState([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState(null);

  const [addressMode, setAddressMode] =
    useState("saved");

  const [loadingAddresses, setLoadingAddresses] =
    useState(false);


  // =====================================================
  // NEW ADDRESS
  // =====================================================

  const [newAddress, setNewAddress] =
    useState({
      label: "",
      recipientName: "",
      phone: "",
      addressLine: "",
      city: "",
      province: "",
    });


  // =====================================================
  // MAP LOCATION
  // =====================================================

  const [newAddressPosition, setNewAddressPosition] =
    useState(
      defaultPosition
    );


  // =====================================================
  // ADDRESS SEARCH
  // =====================================================

  const [addressSearch, setAddressSearch] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [searchingAddress, setSearchingAddress] =
    useState(false);

  const [addressSearchError, setAddressSearchError] =
    useState("");


  // =====================================================
  // SAVE NEW ADDRESS
  // =====================================================

  const [saveNewAddress, setSaveNewAddress] =
    useState(false);


  // =====================================================
  // AUTO-SET FLASH DEAL DATE
  // =====================================================

  useEffect(() => {

    if (!hasFlashDeal) {
      return;
    }

    setFormData(
      (previous) => {

        if (
          previous.date ===
          getTodayDate()
        ) {
          return previous;
        }

        return {
          ...previous,
          date:
            getTodayDate(),
        };

      }
    );

  }, [hasFlashDeal]);


  // =====================================================
  // LOAD SAVED ADDRESSES
  // =====================================================

  useEffect(() => {

    const fetchAddresses =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "bakedrop-token"
            );


          if (!token) {
            return;
          }


          setLoadingAddresses(
            true
          );


          const response =
            await fetch(
              "http://localhost:5000/api/addresses",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const data =
            await response.json();


          if (!response.ok) {

            throw new Error(
              data.message ||
                "Failed to load saved addresses."
            );

          }


          setAddresses(
            data.addresses ||
            []
          );

        } catch (error) {

          console.error(
            "Address loading error:",
            error
          );

        } finally {

          setLoadingAddresses(
            false
          );

        }

      };


    fetchAddresses();

  }, []);


  // =====================================================
  // CHECK SELECTED SCHEDULE DATE
  // =====================================================

  useEffect(() => {

    if (!formData.date) {

      setScheduleInfo({
        loading: false,
        checked: false,
        disabled: false,
        maximumOrders: 30,
        reservedOrders: 0,
        remainingSlots: 30,
      });

      setScheduleError("");

      return;
    }


    // ===================================================
    // VALIDATE MINIMUM DATE
    // ===================================================

    if (
      formData.date <
      minimumOrderDate
    ) {

      setScheduleInfo({
        loading: false,
        checked: false,
        disabled: false,
        maximumOrders: 30,
        reservedOrders: 0,
        remainingSlots: 0,
      });


      if (hasFlashDeal) {

        setScheduleError(
          "Flash Deals can only be ordered for today."
        );

      } else {

        setScheduleError(
          "Orders cannot be scheduled for today or any previous date. Please choose a future date."
        );

      }

      return;
    }


    // ===================================================
    // FLASH DEAL DATE VALIDATION
    // ===================================================

    if (
      hasFlashDeal &&
      formData.date !==
        getTodayDate()
    ) {

      setScheduleInfo({
        loading: false,
        checked: false,
        disabled: false,
        maximumOrders: 30,
        reservedOrders: 0,
        remainingSlots: 0,
      });


      setScheduleError(
        "Flash Deals can only be ordered for today."
      );


      return;
    }


    const checkSchedule =
      async () => {

        try {

          setScheduleInfo(
            (previous) => ({
              ...previous,

              loading: true,

              checked: false,
            })
          );


          setScheduleError("");


          const response =
            await fetch(
              `http://localhost:5000/api/products?date=${encodeURIComponent(
                formData.date
              )}`
            );


          const data =
            await response.json();


          if (!response.ok) {

            throw new Error(
              data.message ||
                "Unable to check schedule availability."
            );

          }


          const schedule =
            data.schedule;


          setScheduleInfo({

            loading: false,

            checked: true,

            disabled:
              Boolean(
                schedule?.disabled
              ),

            maximumOrders:
              Number(
                schedule?.maximum_orders ||
                  30
              ),

            reservedOrders:
              Number(
                schedule?.reserved_orders ||
                  0
              ),

            remainingSlots:
              Number(
                schedule?.remaining_order_slots ||
                  0
              ),

          });

        } catch (error) {

          console.error(
            "Schedule availability error:",
            error
          );


          setScheduleInfo({
            loading: false,
            checked: false,
            disabled: false,
            maximumOrders: 30,
            reservedOrders: 0,
            remainingSlots: 30,
          });


          setScheduleError(
            error.message ||
              "Unable to check schedule availability."
          );

        }

      };


    checkSchedule();

  }, [
    formData.date,
    hasFlashDeal,
    minimumOrderDate,
  ]);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  function handleChange(event) {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  }


  // =====================================================
  // HANDLE NEW ADDRESS INPUT
  // =====================================================

  function handleAddressChange(
    event
  ) {

    const {
      name,
      value,
    } = event.target;


    setNewAddress(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  }


  // =====================================================
  // SEARCH ADDRESS
  // =====================================================

  async function searchAddress() {

    const query =
      addressSearch.trim();


    if (
      query.length < 3
    ) {

      setAddressSearchError(
        "Please enter at least 3 characters."
      );

      setSearchResults([]);

      return;
    }


    try {

      setSearchingAddress(
        true
      );

      setAddressSearchError("");

      setSearchResults([]);


      const response =
        await fetch(
          `http://localhost:5000/api/geocode/search?q=${encodeURIComponent(
            query
          )}`
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Unable to search this address."
        );

      }


      setSearchResults(
        data.results ||
          []
      );


      if (
        !data.results ||
        data.results.length === 0
      ) {

        setAddressSearchError(
          "No matching address was found."
        );

      }

    } catch (error) {

      console.error(
        "Address search error:",
        error
      );


      setAddressSearchError(
        error.message ||
          "Unable to search address."
      );

    } finally {

      setSearchingAddress(
        false
      );

    }

  }


  // =====================================================
  // SELECT SEARCH RESULT
  // =====================================================

  function selectAddressResult(
    result
  ) {

    const latitude =
      parseFloat(
        result.lat
      );


    const longitude =
      parseFloat(
        result.lon
      );


    if (
      Number.isNaN(
        latitude
      ) ||
      Number.isNaN(
        longitude
      )
    ) {

      return;

    }


    setNewAddressPosition([
      latitude,
      longitude,
    ]);


    const address =
      result.address ||
      {};


    const city =
      address.city ||
      address.town ||
      address.municipality ||
      "";


    const province =
      address.province ||
      address.state ||
      "";


    const locality =
      address.neighbourhood ||
      address.quarter ||
      address.suburb ||
      "";


    const addressParts = [
      address.house_number,
      address.road,
      locality,
    ].filter(Boolean);


    const addressLine =
      addressParts.length > 0
        ? addressParts.join(
            ", "
          )
        : result.display_name;


    setNewAddress(
      (previous) => ({
        ...previous,

        addressLine,

        city,

        province,
      })
    );


    setAddressSearch(
      result.display_name
    );


    setSearchResults([]);

    setAddressSearchError("");

  }


  // =====================================================
  // SAVE NEW ADDRESS TO DATABASE
  // =====================================================

  async function saveAddressToDatabase() {

    try {

      const token =
        localStorage.getItem(
          "bakedrop-token"
        );


      if (!token) {

        alert(
          "Please log in before saving an address."
        );

        return null;

      }


      const response =
        await fetch(
          "http://localhost:5000/api/addresses",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({

                label:
                  newAddress.label ||
                  "Delivery Address",

                recipient_name:
                  newAddress.recipientName,

                phone:
                  newAddress.phone,

                address_line:
                  newAddress.addressLine,

                city:
                  newAddress.city,

                province:
                  newAddress.province,

                latitude:
                  newAddressPosition[0],

                longitude:
                  newAddressPosition[1],

              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
            "Failed to save address."
        );

      }


      return data.address;

    } catch (error) {

      console.error(
        "Save address error:",
        error
      );


      alert(
        error.message
      );


      return null;

    }

  }


  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    // ===================================================
    // SCHEDULE VALIDATION
    // ===================================================

    if (!formData.date) {

      alert(
        "Please select a schedule date."
      );

      return;

    }


    // ===================================================
    // MINIMUM DATE VALIDATION
    // ===================================================

    if (
      formData.date <
      minimumOrderDate
    ) {

      if (hasFlashDeal) {

        alert(
          "Flash Deals can only be ordered for today."
        );

      } else {

        alert(
          "Orders cannot be scheduled for today or any previous date. Please choose a future date."
        );

      }

      return;

    }


    // ===================================================
    // FLASH DEAL DATE VALIDATION
    // ===================================================

    if (
      hasFlashDeal &&
      formData.date !==
        getTodayDate()
    ) {

      alert(
        "Flash Deals can only be ordered for today."
      );

      return;

    }


    if (
      scheduleInfo.loading
    ) {

      alert(
        "Please wait while we check the schedule."
      );

      return;

    }


    if (
      !scheduleInfo.checked
    ) {

      alert(
        "Unable to verify the selected schedule date. Please try again."
      );

      return;

    }


    if (
      scheduleInfo.disabled
    ) {

      alert(
        `Ordering is disabled for ${formData.date}.`
      );

      return;

    }


    if (
      scheduleInfo.remainingSlots <=
      0
    ) {

      alert(
        `All order slots for ${formData.date} are already reserved.`
      );

      return;

    }


    // ===================================================
    // DELIVERY VALIDATION
    // ===================================================

    let deliveryAddress =
      null;


    if (
      orderType ===
      "delivery"
    ) {


      // -----------------------------------------------
      // SAVED ADDRESS
      // -----------------------------------------------

      if (
        addressMode ===
        "saved"
      ) {

        if (
          !selectedAddressId
        ) {

          alert(
            "Please select a delivery address."
          );

          return;

        }


        deliveryAddress =
          addresses.find(
            (address) =>
              address.id ===
              selectedAddressId
          );


        if (
          !deliveryAddress
        ) {

          alert(
            "Selected address could not be found."
          );

          return;

        }

      }


      // -----------------------------------------------
      // NEW ADDRESS
      // -----------------------------------------------

      if (
        addressMode ===
        "new"
      ) {

        if (
          !newAddress.recipientName ||
          !newAddress.phone ||
          !newAddress.addressLine ||
          !newAddress.city ||
          !newAddress.province
        ) {

          alert(
            "Please complete your delivery address."
          );

          return;

        }


        deliveryAddress = {

          id: null,

          label:
            newAddress.label ||
            "Delivery Address",

          recipient_name:
            newAddress.recipientName,

          phone:
            newAddress.phone,

          address_line:
            newAddress.addressLine,

          city:
            newAddress.city,

          province:
            newAddress.province,

          latitude:
            newAddressPosition[0],

          longitude:
            newAddressPosition[1],

        };


        // ---------------------------------------------
        // SAVE ADDRESS IF CHECKED
        // ---------------------------------------------

        if (
          saveNewAddress
        ) {

          const savedAddress =
            await saveAddressToDatabase();


          if (
            !savedAddress
          ) {

            return;

          }


          deliveryAddress =
            savedAddress;


          setAddresses(
            (current) => [
              savedAddress,
              ...current,
            ]
          );


          setSelectedAddressId(
            savedAddress.id
          );

        }

      }

    }


    // ===================================================
    // SAVE RESERVATION
    // ===================================================

    const reservationData = {

      orderType,

      date:
        formData.date,

      time:
        formData.time,

      notes:
        formData.notes,

      deliveryAddress:
        orderType ===
        "delivery"
          ? deliveryAddress
          : null,

    };


    sessionStorage.setItem(
      "bakedropReservation",
      JSON.stringify(
        reservationData
      )
    );


    navigate(
      "/payment"
    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <section className="form-page">

      <div className="form-container reservation-form">


        {/* =================================================
            HEADER
        ================================================= */}

        <span className="eyebrow">
          BAKEDROP ORDER
        </span>


        <h1>
          Choose your
          <br />
          <em>order method.</em>
        </h1>


        <p>
          Select how you would like to receive
          your order, then provide your schedule
          and delivery information.
        </p>


        {/* =================================================
            FLASH DEAL NOTICE
        ================================================= */}

        {hasFlashDeal && (

          <div className="flash-deal-reservation-notice">

            <strong>
              FLASH DEAL ORDER
            </strong>

            <p>
              Your Flash Deal is available
              today only. Please complete
              your order for today.
            </p>

          </div>

        )}


        {/* =================================================
            ORDER TYPE
        ================================================= */}

        <div className="order-type">

          <button
            type="button"

            className={
              orderType ===
              "pickup"
                ? "order-type-active"
                : ""
            }

            onClick={() =>
              setOrderType(
                "pickup"
              )
            }
          >

            <span>
              01
            </span>


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
              orderType ===
              "delivery"
                ? "order-type-active"
                : ""
            }

            onClick={() =>
              setOrderType(
                "delivery"
              )
            }
          >

            <span>
              02
            </span>


            <strong>
              Delivery
            </strong>


            <small>
              Have your order delivered
            </small>

          </button>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
        >


          {/* =================================================
              DELIVERY ADDRESS
          ================================================= */}

          {orderType ===
            "delivery" && (

            <div className="form-section">

              <div className="form-section-title">

                <span>
                  01
                </span>

                <div>

                  <h2>
                    Delivery Address
                  </h2>

                  <p>
                    Choose a saved address or
                    enter a new one.
                  </p>

                </div>

              </div>


              {/* =============================================
                  LOADING
              ============================================= */}

              {loadingAddresses ? (

                <div className="checkout-loading">
                  Loading saved addresses...
                </div>

              ) : (

                <div className="saved-address-list">


                  {/* =========================================
                      SAVED ADDRESSES
                  ========================================= */}

                  {addresses.map(
                    (
                      address
                    ) => (

                      <button
                        key={
                          address.id
                        }

                        type="button"

                        className={`saved-address-card ${
                          addressMode ===
                            "saved" &&
                          selectedAddressId ===
                            address.id
                            ? "selected"
                            : ""
                        }`}

                        onClick={() => {

                          setAddressMode(
                            "saved"
                          );

                          setSelectedAddressId(
                            address.id
                          );

                        }}
                      >

                        <div className="saved-address-top">

                          <strong>
                            {address.label ||
                              "Saved Address"}
                          </strong>


                          {addressMode ===
                            "saved" &&
                            selectedAddressId ===
                              address.id && (

                            <span>
                              Selected
                            </span>

                          )}

                        </div>


                        <p>
                          {
                            address.recipient_name
                          }
                        </p>


                        <p>
                          {
                            address.phone
                          }
                        </p>


                        <p>
                          {
                            address.address_line
                          }
                        </p>


                        <p>
                          {
                            address.city
                          }
                          ,{" "}
                          {
                            address.province
                          }
                        </p>

                      </button>

                    )
                  )}


                  {/* =========================================
                      NEW ADDRESS
                  ========================================= */}

                  <button
                    type="button"

                    className={`saved-address-card ${
                      addressMode ===
                      "new"
                        ? "selected"
                        : ""
                    }`}

                    onClick={() => {

                      setAddressMode(
                        "new"
                      );

                      setSelectedAddressId(
                        null
                      );

                    }}
                  >

                    <div className="saved-address-top">

                      <strong>
                        Enter a new address
                      </strong>


                      {addressMode ===
                        "new" && (

                        <span>
                          Selected
                        </span>

                      )}

                    </div>


                    <p>
                      Use a different
                      delivery address
                    </p>

                  </button>

                </div>

              )}


              {/* =============================================
                  NEW ADDRESS FORM
              ============================================= */}

              {addressMode ===
                "new" && (

                <div className="new-address-form">


                  {/* LABEL */}

                  <label>

                    Address Label

                    <input
                      type="text"

                      name="label"

                      value={
                        newAddress.label
                      }

                      onChange={
                        handleAddressChange
                      }

                      placeholder="Home, Work, etc."
                    />

                  </label>


                  {/* RECIPIENT */}

                  <label>

                    Recipient Name

                    <input
                      type="text"

                      name="recipientName"

                      value={
                        newAddress.recipientName
                      }

                      onChange={
                        handleAddressChange
                      }

                      placeholder="Full name"
                    />

                  </label>


                  {/* PHONE */}

                  <label>

                    Contact Number

                    <input
                      type="tel"

                      name="phone"

                      value={
                        newAddress.phone
                      }

                      onChange={
                        handleAddressChange
                      }

                      placeholder="09XXXXXXXXX"
                    />

                  </label>


                  {/* ADDRESS */}

                  <label>

                    Complete Address

                    <textarea
                      name="addressLine"

                      rows="3"

                      value={
                        newAddress.addressLine
                      }

                      onChange={
                        handleAddressChange
                      }

                      placeholder="House number, street, barangay..."
                    />

                  </label>


                  {/* CITY + PROVINCE */}

                  <div className="form-row">

                    <label>

                      City

                      <input
                        type="text"

                        name="city"

                        value={
                          newAddress.city
                        }

                        onChange={
                          handleAddressChange
                        }

                        placeholder="Dasmariñas"
                      />

                    </label>


                    <label>

                      Province

                      <input
                        type="text"

                        name="province"

                        value={
                          newAddress.province
                        }

                        onChange={
                          handleAddressChange
                        }

                        placeholder="Cavite"
                      />

                    </label>

                  </div>


                  {/* =================================================
                      ADDRESS SEARCH
                  ================================================= */}

                  <div className="address-search-section">

                    <label>

                      Search Delivery Address

                      <div className="address-search-row">

                        <input
                          type="text"

                          value={
                            addressSearch
                          }

                          onChange={(
                            event
                          ) =>
                            setAddressSearch(
                              event.target.value
                            )
                          }

                          placeholder="Search street, barangay, city..."

                          onKeyDown={(
                            event
                          ) => {

                            if (
                              event.key ===
                              "Enter"
                            ) {

                              event.preventDefault();

                              searchAddress();

                            }

                          }}
                        />


                        <button
                          type="button"

                          className="btn btn-gold"

                          onClick={
                            searchAddress
                          }

                          disabled={
                            searchingAddress
                          }
                        >

                          {searchingAddress
                            ? "Searching..."
                            : "Search"}

                        </button>

                      </div>

                    </label>


                    {/* SEARCH ERROR */}

                    {addressSearchError && (

                      <div className="address-search-error">

                        {
                          addressSearchError
                        }

                      </div>

                    )}


                    {/* SEARCH RESULTS */}

                    {searchResults.length >
                      0 && (

                      <div className="address-search-results">

                        {searchResults.map(
                          (
                            result,
                            index
                          ) => (

                            <button
                              key={`${result.place_id}-${index}`}

                              type="button"

                              className="address-search-result"

                              onClick={() =>
                                selectAddressResult(
                                  result
                                )
                              }
                            >

                              <strong>
                                {result.name ||
                                  "Location"}
                              </strong>


                              <span>
                                {
                                  result.display_name
                                }
                              </span>

                            </button>

                          )
                        )}

                      </div>

                    )}

                  </div>


                  {/* =================================================
                      MAP
                  ================================================= */}

                  <div className="map-wrapper">

                    <MapContainer
                      center={
                        newAddressPosition
                      }

                      zoom={15}

                      scrollWheelZoom={
                        true
                      }

                      className="delivery-map"
                    >

                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"

                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />


                      <MapController
                        position={
                          newAddressPosition
                        }
                      />


                      <LocationMarker
                        position={
                          newAddressPosition
                        }

                        setPosition={
                          setNewAddressPosition
                        }
                      />

                    </MapContainer>

                  </div>


                  {/* LOCATION */}

                  <div className="location-selected">

                    <span>
                      PINNED LOCATION
                    </span>


                    <p>
                      Latitude:{" "}
                      {newAddressPosition[0].toFixed(
                        6
                      )}
                    </p>


                    <p>
                      Longitude:{" "}
                      {newAddressPosition[1].toFixed(
                        6
                      )}
                    </p>


                    <small>
                      Click the map to move
                      the delivery pin.
                    </small>

                  </div>


                  {/* SAVE ADDRESS */}

                  <label className="save-address-option">

                    <input
                      type="checkbox"

                      checked={
                        saveNewAddress
                      }

                      onChange={(
                        event
                      ) =>
                        setSaveNewAddress(
                          event.target.checked
                        )
                      }
                    />


                    <span>
                      Save this address for
                      future orders
                    </span>

                  </label>

                </div>

              )}

            </div>

          )}


          {/* =================================================
              PICKUP LOCATION
          ================================================= */}

          {orderType ===
            "pickup" && (

            <div className="form-section">

              <div className="form-section-title">

                <span>
                  01
                </span>

                <div>

                  <h2>
                    Pickup Location
                  </h2>

                  <p>
                    Your order will be prepared
                    for pickup at BakeDrop.
                  </p>

                </div>

              </div>


              <div className="pickup-location">

                <span>
                  BAKE DROP PICKUP LOCATION
                </span>


                <strong>
                  BakeDrop Bakery
                </strong>


                <p>
                  Villa Luisa, San Agustin 2
                  <br />
                  Dasmariñas, Cavite
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              SCHEDULE
          ================================================= */}

          <div className="form-section">

            <div className="form-section-title">

              <span>
                02
              </span>


              <div>

                <h2>
                  Schedule
                </h2>


                <p>
                  {hasFlashDeal
                    ? "Flash Deals are available today only."
                    : "Choose your preferred date and time."}
                </p>

              </div>

            </div>


            <div className="form-row">


              {/* =============================================
                  DATE
              ============================================= */}

              <label>

                {orderType ===
                "pickup"
                  ? "Pickup Date"
                  : "Delivery Date"}


                <input
                  type="date"

                  name="date"

                  value={
                    formData.date
                  }

                  min={
                    minimumOrderDate
                  }

                  onChange={
                    handleChange
                  }

                  required
                />


                {/* FLASH DEAL */}

                {hasFlashDeal && (

                  <small className="schedule-check-message">

                    Flash Deal date:
                    today only.

                  </small>

                )}


                {/* CHECKING */}

                {scheduleInfo.loading && (

                  <small className="schedule-check-message">

                    Checking availability
                    for this date...

                  </small>

                )}


                {/* ERROR */}

                {scheduleError && (

                  <small className="schedule-check-error">

                    {
                      scheduleError
                    }

                  </small>

                )}


                {/* AVAILABLE */}

                {scheduleInfo.checked &&
                  !scheduleInfo.loading &&
                  !scheduleInfo.disabled && (

                    <small className="schedule-check-message">

                      {scheduleInfo.remainingSlots >
                      0
                        ? `${scheduleInfo.remainingSlots} order slot${
                            scheduleInfo.remainingSlots ===
                            1
                              ? ""
                              : "s"
                          } remaining for this date.`
                        : "This date is fully booked."}

                    </small>

                )}


                {/* DISABLED */}

                {scheduleInfo.checked &&
                  scheduleInfo.disabled && (

                    <small className="schedule-check-error">

                      Ordering is disabled
                      for this date.

                    </small>

                )}

              </label>


              {/* =============================================
                  TIME
              ============================================= */}

              <label>

                {orderType ===
                "pickup"
                  ? "Pickup Time"
                  : "Delivery Time"}


                <select
                  name="time"

                  value={
                    formData.time
                  }

                  onChange={
                    handleChange
                  }

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


          {/* =================================================
              NOTES
          ================================================= */}

          <div className="form-section">

            <div className="form-section-title">

              <span>
                03
              </span>


              <div>

                <h2>
                  Special Requests
                </h2>


                <p>
                  Add any instructions for
                  your order.
                </p>

              </div>

            </div>


            <label>

              Order Notes

              <textarea
                name="notes"

                rows="4"

                placeholder="Special instructions for your order..."

                value={
                  formData.notes
                }

                onChange={
                  handleChange
                }
              />

            </label>

          </div>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"

            className="btn btn-gold reservation-submit"

            disabled={
              scheduleInfo.loading ||
              !formData.date ||
              formData.date <
                minimumOrderDate ||
              (hasFlashDeal &&
                formData.date !==
                  getTodayDate()) ||
              (scheduleInfo.checked &&
                (
                  scheduleInfo.disabled ||
                  scheduleInfo.remainingSlots <=
                    0
                ))
            }
          >

            {scheduleInfo.loading
              ? "Checking Availability..."
              : "Continue to Checkout"}

          </button>

        </form>

      </div>

    </section>
  );
}

export default Reservation;