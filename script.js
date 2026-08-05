function getDistance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

function safePosthogCapture(eventName, properties) {
  if (typeof posthog !== "undefined" && posthog.capture) {
    posthog.capture(eventName, properties);
  } else {
    console.log(
      "PostHog not available, event not captured:",
      eventName,
      properties
    );
  }
}

function requestLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        safePosthogCapture("location_request_success", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        [...document.querySelectorAll(".h-card")].forEach((card) => {
          const latitude = card.querySelector(".p-latitude");
          const longitude = card.querySelector(".p-longitude");

          if (!latitude || !longitude) {
            return;
          }

          const distance = getDistance(
            position.coords.latitude,
            position.coords.longitude,
            latitude.innerText,
            longitude.innerText,
            "K"
          );

          const distanceValue = Intl.NumberFormat("en-US", {
            style: "unit",
            unit: "kilometer",
            maximumFractionDigits: 2,
          }).format(distance);

          card.querySelector(".p-distance").innerText = distanceValue;
        });
        document.querySelector("#get-distance-to-me").style.display = "none";
      },
      (error) => {
        safePosthogCapture("location_request_error", {
          error_code: error.code,
          error_message: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    safePosthogCapture("geolocation_not_supported");
  }
}

window.addEventListener("load", () => {
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      if (permission.state === "granted") {
        requestLocation();
      }
      safePosthogCapture("geolocation_permission_state", {
        state: permission.state,
      });
    });
  } else {
    safePosthogCapture("geolocation_permission_api_not_supported");
    requestLocation();
    document.querySelector("#get-distance-to-me").style.display = "none";
  }

  document
    .querySelectorAll(
      'a[href^="https://www.google.com/maps"], a[href^="https://yandex.com/maps"], a[href^="https://www.openstreetmap.org"]'
    )
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        safePosthogCapture("map_link_clicked", {
          map_service: event.target.textContent,
          district: event.target.closest("details").querySelector("summary")
            .innerText,
          pharmacy_name: event.target
            .closest(".h-card")
            .querySelector(".p-name").innerText,
        });
      });
    });

  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      safePosthogCapture("telephone_link_clicked", {
        district: event.target.closest("details").querySelector("summary")
          .innerText,
        pharmacy_name: event.target.closest(".h-card").querySelector(".p-name")
          .innerText,
      });
    });
  });

  document.querySelectorAll('a[href^="https://wa.me"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      safePosthogCapture("whatsapp_link_clicked", {
        district: event.target.closest("details").querySelector("summary")
          .innerText,
        pharmacy_name: event.target.closest(".h-card").querySelector(".p-name")
          .innerText,
      });
    });
  });
});
