// ============================================================
// profile.js (complete-form.html logic)
// UPDATED FOR NEW ADDRESS SYSTEM (completeAddress + yearStarted)
// ============================================================

(() => {

  // ------------------------------------------------------------
  // SIMPLE ALERT MODAL
  // ------------------------------------------------------------
  function showAlert(message) {
    let modal = document.getElementById("simpleAlertModal");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "simpleAlertModal";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.background = "rgba(0,0,0,0.5)";
      modal.style.display = "flex";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.style.zIndex = "9999";

      modal.innerHTML = `
        <div style="
          background:#fff; padding:20px; width:90%; max-width:350px;
          border-radius:8px; text-align:center; font-family:Arial;
        ">
          <p id="alertText" style="margin-bottom:20px; font-size:16px; color:#333;"></p>
          <button id="alertOKBtn" style="
            background:#0d6efd; color:white; padding:8px 20px;
            border:none; border-radius:5px; cursor:pointer;
          ">OK</button>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById("alertOKBtn").addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    document.getElementById("alertText").innerText = message;
    modal.style.display = "flex";
  }

  // Helpers
  const $ = id => document.getElementById(id);
  const form = $("wizardForm");
  const steps = Array.from(document.querySelectorAll(".step"));
  const total = steps.length;
  let index = 0;

  // ------------------------------------------------------------
  // STEP CONTROLLER
  // ------------------------------------------------------------
  $("stepTotal") && ($("stepTotal").textContent = total);

  function showStep(i) {
    steps.forEach(s => s.classList.remove("active"));
    steps[i].classList.add("active");
    $("stepIndex").textContent = i + 1;
    $("progressFill").style.width = `${Math.round(((i + 1) / total) * 100)}%`;
  }
  showStep(index);

  $("nextBtn").addEventListener("click", async () => {
    if (!validateStep(index)) return;

    if (index < total - 1) {
      index++;
      showStep(index);
    } else {
      await handleSubmit();
    }
    updateNavButtons();
  });

  $("prevBtn").addEventListener("click", () => {
    if (index > 0) {
      index--;
      showStep(index);
    }
    updateNavButtons();
  });

  function updateNavButtons() {
    $("prevBtn").disabled = index === 0;
    $("nextBtn").textContent = (index === total - 1 ? "Submit" : "Next");
  }
  updateNavButtons();

  // ------------------------------------------------------------
  // AUTO-UPPERCASE + NUMERIC FILTER
  // ------------------------------------------------------------
  function markValidity(el, valid) {
    el.classList.remove("is-valid", "is-invalid");
    el.classList.add(valid ? "is-valid" : "is-invalid");
  }

  function applyUppercase(el) {
    el.addEventListener("input", () => {
      const pos = el.selectionStart;
      el.value = el.value.toUpperCase();
      el.setSelectionRange(pos, pos);
    });
  }

  function enforceNumeric(el) {
    el.addEventListener("input", () => {
      const pos = el.selectionStart;
      el.value = el.value.replace(/[^\d]/g, "");
      el.setSelectionRange(pos, pos);
    });
  }

  [
    "firstName","middleName","lastName","suffix","street",
    "placeOfBirth","religion","occupation","employer",
    "householdHeadName","householdRelation","ofwFamily",
    "completeAddress"
  ].forEach(id => $(id) && applyUppercase($(id)));

  ["phoneNumber","altPhone","emergencyNumber"]
    .forEach(id => $(id) && enforceNumeric($(id)));

  // ------------------------------------------------------------
  // PHONE VALIDATION
  // ------------------------------------------------------------
  const phone = $("phoneNumber");
  if (phone) {
    let hint = $("phoneHint");
    if (!hint) {
      hint = document.createElement("small");
      hint.id = "phoneHint";
      phone.parentNode.appendChild(hint);
    }

    phone.addEventListener("input", () => {
      phone.value = phone.value.replace(/[^\d]/g, "");

      if (!phone.value.startsWith("09")) {
        hint.textContent = "Phone must start with 09";
        hint.style.color = "#c0392b";
        markValidity(phone, false);
      }
      else if (phone.value.length !== 11) {
        hint.textContent = "Phone must be 11 digits";
        hint.style.color = "#c0392b";
        markValidity(phone, false);
      }
      else {
        hint.textContent = "Looks good";
        hint.style.color = "#198754";
        markValidity(phone, true);
      }
    });
  }

  // ------------------------------------------------------------
  // DOB → AGE AUTO-CALC
  // ------------------------------------------------------------
  const dob = $("dob");
  if (dob) {
    dob.addEventListener("change", () => {
      const d = new Date(dob.value);
      if (!isNaN(d)) {
        const now = new Date();
        let age = now.getFullYear() - d.getFullYear();
        if (
          now.getMonth() < d.getMonth() ||
          (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
        ) age--;
        $("age").value = age;
      }
    });
  }

  // ------------------------------------------------------------
  // YEAR STARTED → AUTO-CALC YEARS OF RESIDENCY
  // ------------------------------------------------------------
  const yearStarted = $("yearStarted");
  const yearsOfResidency = $("yearsOfResidency");
  const currentYear = new Date().getFullYear();

  // populate dropdown
  if (yearStarted) {
    for (let y = currentYear; y >= 1950; y--) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      yearStarted.appendChild(opt);
    }

    yearStarted.addEventListener("change", () => {
      yearsOfResidency.value = currentYear - parseInt(yearStarted.value);
    });
  }

  // ------------------------------------------------------------
  // VALIDATION
  // ------------------------------------------------------------
  function validateStep(i) {
    const step = steps[i];
    const requireds = Array.from(step.querySelectorAll("[required]"));
    let allGood = true;

    requireds.forEach(el => {
      let valid = !!el.value;

      if (el.id === "phoneNumber")
        valid = /^09\d{9}$/.test(el.value);

      markValidity(el, valid);
      if (!valid) allGood = false;
    });

    if (!allGood) {
      showAlert("Please complete the required fields.");
      return false;
    }
    return true;
  }

  // ------------------------------------------------------------
  // COLLECT FORM DATA
  // ------------------------------------------------------------
  function collectFormData() {
    const data = {};

    form.querySelectorAll("input,select,textarea").forEach(el => {
      if (!el.id || el.type === "file") return;

      if (el.type === "checkbox") data[el.id] = el.checked;
      else data[el.id] = el.value.trim();
    });

    data.phoneNumber = data.phoneNumber?.replace(/\D/g, "") || "";

    // NEW ADDRESS FORMAT
    data.address = {
      houseNo: data.houseNo || "",
      street: data.street || "",
      zone: data.zone || "",
      completeAddress: data.completeAddress || "",
      barangay: "Barangay 186",
      province: "Metro Manila",
      yearStarted: data.yearStarted || "",
      yearsOfResidency: data.yearsOfResidency || ""
    };

    return data;
  }

  // ------------------------------------------------------------
  // SUBMIT
  // ------------------------------------------------------------
  async function handleSubmit() {
    if (!validateStep(index)) return;

    try {
      const uid = sessionStorage.getItem("uid");
      if (!uid) return showAlert("Not logged in.");

      const payload = collectFormData();
      payload.submittedAt = new Date().toISOString();

      await firebase.firestore()
        .collection("profiles")
        .doc(uid)
        .set(payload, { merge: true });

      await firebase.database()
        .ref("users/" + uid)
        .update({
          completeInfo: true,
          lastUpdated: payload.submittedAt
        });

      showAlert("Profile submitted successfully!");
      setTimeout(() => location.href = "home.html", 800);

    } catch (err) {
      showAlert("Submit error: " + err.message);
    }
  }

  // ------------------------------------------------------------
  // LOAD FROM FIREBASE
  // ------------------------------------------------------------
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) return;

    $("accountEmail") && ($("accountEmail").value = user.email);

    try {
      const doc = await firebase.firestore()
        .collection("profiles")
        .doc(user.uid)
        .get();

      if (doc.exists) fillForm(doc.data());

      const snap = await firebase.database()
        .ref("users/" + user.uid)
        .once("value");

      if (snap.exists()) {
        const u = snap.val();

        if ($("firstName") && !$("firstName").value) $("firstName").value = u.firstName || "";
        if ($("middleName") && !$("middleName").value) $("middleName").value = u.middleName || "";
        if ($("lastName") && !$("lastName").value) $("lastName").value = u.lastName || "";
        if ($("dob") && !$("dob").value) $("dob").value = u.birthday || "";
        if ($("accountEmail") && !$("accountEmail").value) $("accountEmail").value = u.email || "";

        if (u.birthday && $("age")) {
          const d = new Date(u.birthday);
          if (!isNaN(d)) {
            const now = new Date();
            let age = now.getFullYear() - d.getFullYear();
            if (
              now.getMonth() < d.getMonth() ||
              (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
            ) age--;
            $("age").value = age;
          }
        }
      }

    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  });

  // ------------------------------------------------------------
  // FILL FORM
  // ------------------------------------------------------------
  function fillForm(data) {
    if (!data) return;

    Object.keys(data).forEach(k => {
      const el = $(k);
      if (el && el.type !== "file") el.value = data[k];
    });

    if (data.address) {
      [
        "houseNo", "street", "zone", "completeAddress",
        "yearStarted", "yearsOfResidency"
      ].forEach(k => {
        if ($(k)) $(k).value = data.address[k] || "";
      });
    }
  }

})();
