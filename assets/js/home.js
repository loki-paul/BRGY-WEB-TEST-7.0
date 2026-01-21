// home.js

// =============================
//   HOME PAGE USER DISPLAY
// =============================

// Tab Logic
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Under Construction Modals
function showUC() {
  document.getElementById("ucModal").style.display = "flex";
}
function closeUC() {
  document.getElementById("ucModal").style.display = "none";
}

// =============================
//  LOAD BASIC PROFILE INFO
// =============================

const profName = document.getElementById("profName");
const profPhone = document.getElementById("profPhone");
const profEmail = document.getElementById("profEmail");
const userNameHeader = document.getElementById("userName");

const sessionUID = sessionStorage.getItem("uid");

if (!sessionUID) {
  alert("Your session expired. Please login again.");
  window.location.href = "/index.html";
}

// Firebase Auth Watcher
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    sessionStorage.clear();
    window.location.href = "/index.html";
    return;
  }

  loadBasicProfile(sessionUID);
});

// =============================
//    FETCH FIRESTORE PROFILE
// =============================
async function loadBasicProfile(uid) {
  const loader = document.getElementById("pageLoader");
  const pageContent = document.getElementById("pageContent"); // wrap your main container div

  try {
    const docRef = firestore.collection("profiles").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      if (loader) loader.style.display = "none";
      if (pageContent) pageContent.classList.add("show");
      return;
    }

    const data = docSnap.data();

    // ---- BUILD FULL NAME ----
    const fullName = [
      data.firstName,
      data.middleName,
      data.lastName,
      data.suffix,
    ].filter(Boolean).join(" ");

    // ---- DISPLAY BASIC INFO ----
    if (profName) profName.innerText = fullName || "Unknown User";
    if (profPhone) profPhone.innerText = data.phoneNumber || "Not provided";
    if (profEmail) profEmail.innerText = data.email || data.accountEmail || "Not provided";

    // ---- AVATAR INITIALS ----
    const avatar = document.getElementById("avatarBox");
    if (avatar) {
      const firstInitial = data.firstName ? data.firstName[0].toUpperCase() : '';
      const lastInitial = data.lastName ? data.lastName[0].toUpperCase() : '';
      const initials = firstInitial + lastInitial;

      avatar.innerText = initials;
    }

    // ---- ADDRESS ----
    const addrEl = document.getElementById("profAddress");
    if (addrEl) {
      const address = data.completeAddress
        ? data.completeAddress
        : `${data.houseNo || ""} ${data.street || ""}, Purok ${
            data.zone || ""
          }, Barangay 186, Caloocan City, Metro Manila`;

      addrEl.innerText = address.trim() || "No address provided";
    }

    // ---- RESIDENCY ----
    const residencyEl = document.getElementById("profResidency");
    if (residencyEl) {
      residencyEl.innerText = data.yearsOfResidency
        ? `${data.yearsOfResidency} year(s)`
        : "Not provided";
    }

  } catch (err) {
    console.error("Error loading profile:", err);
  }

  // Show page after loading
  if (loader) loader.style.display = "none";
  if (pageContent) pageContent.classList.add("show");
}
// Ripple effect on clicks
document.addEventListener("click", function (e) {
  const target = e.target.closest(".ripple");
  if (!target) return;

  target.classList.remove("animate");
  void target.offsetWidth; // restart animation
  target.classList.add("animate");

  const x = e.offsetX;
  const y = e.offsetY;
  target.style.setProperty("--ripple-x", `${x}px`);
  target.style.setProperty("--ripple-y", `${y}px`);
});
// Header shrink on scroll
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");

  if (window.scrollY > 20) {
    header.classList.add("shrink");
  } else {
    header.classList.remove("shrink");
  }
});


// =============================
//        LOGOUT BUTTON
// =============================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  sessionStorage.clear();
  firebase.auth().signOut().then(() => {
    window.location.href = "/index.html";
  });
});

// =============================
//     REQUEST HISTORY
// =============================

// Load request history when history tab is clicked
document.addEventListener('DOMContentLoaded', function() {
  const historyTab = document.querySelector('[data-tab="history"]');
  if (historyTab) {
    historyTab.addEventListener('click', loadRequestHistory);
  }
});

// Load request history
async function loadRequestHistory() {
  const historyContent = document.getElementById('historyContent');
  const requestsList = document.getElementById('requestsList');
  const noRequests = document.getElementById('noRequests');

  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    console.log('Loading request history for user:', user.uid);

    // Hide content initially
    if (historyContent) historyContent.style.display = 'none';
    if (noRequests) noRequests.style.display = 'none';
    if (requestsList) requestsList.style.display = 'none';

    // Get all requests and filter/sort client-side for consistent ordering
    const allRequests = await firebase.firestore()
      .collection('requests')
      .get();

    // Filter by userId
    const userRequests = [];
    allRequests.forEach(doc => {
      const data = doc.data();
      if (data.userId === user.uid) {
        userRequests.push({ id: doc.id, data: data });
      }
    });

    // Sort: non-cancelled first (by submittedAt desc), then cancelled (by submittedAt desc)
    userRequests.sort((a, b) => {
      const aStatus = a.data.status?.toLowerCase() || 'pending';
      const bStatus = b.data.status?.toLowerCase() || 'pending';

      // Cancelled requests go to bottom
      if (aStatus === 'cancelled' && bStatus !== 'cancelled') return 1;
      if (bStatus === 'cancelled' && aStatus !== 'cancelled') return -1;

      // Within same status group, sort by submittedAt descending
      const aTime = a.data.submittedAt?.toDate?.() || new Date(0);
      const bTime = b.data.submittedAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });

    // Convert to query-like format
    const requestsQuery = {
      empty: userRequests.length === 0,
      forEach: (callback) => {
        userRequests.forEach(item => {
          callback({
            id: item.id,
            data: () => item.data
          });
        });
      }
    };

    // Show results immediately

    console.log('Query result empty:', requestsQuery.empty);

    if (requestsQuery.empty) {
      // No requests found
      if (noRequests) noRequests.style.display = 'block';
      return;
    }

    // Clear previous requests
    if (requestsList) requestsList.innerHTML = '';

    let requestCount = 0;

    // Display requests
    requestsQuery.forEach(doc => {
      const request = doc.data();
      console.log('Processing request:', doc.id, request);
      const requestElement = createRequestElement(request, doc.id);
      if (requestsList) requestsList.appendChild(requestElement);
      requestCount++;
    });

    console.log('Total requests displayed:', requestCount);

    // Show content
    if (historyContent) historyContent.style.display = 'block';
    if (requestsList) requestsList.style.display = 'block';

  } catch (error) {
    console.error('Error loading request history:', error);
    // Ensure loading is hidden even on error
    if (historyLoading) {
      historyLoading.style.display = 'none';
      console.log('Loading state hidden due to error');
    }
    // Show no requests state on error as fallback
    if (noRequests) noRequests.style.display = 'block';
    showModal('Error', 'Failed to load request history. Please check the console for details.');
  }
}

// Create request element
function createRequestElement(request, requestId) {
  const requestItem = document.createElement('div');
  requestItem.className = 'request-item clickable-request';
  requestItem.style.cursor = 'pointer';

  // Add click event listener
  requestItem.addEventListener('click', () => showRequestModal(request, requestId));

  // Format submission date
  const submittedAt = request.submittedAt?.toDate();
  const formattedDate = submittedAt ? submittedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Unknown date';

  // Get status class
  const statusClass = request.status ? request.status.toLowerCase() : 'pending';

  // Format documents
  const documentsText = Array.isArray(request.documents)
    ? request.documents.join(', ')
    : request.documents || 'N/A';

  // Format purposes
  let purposesText = 'N/A';
  if (request.purposes && typeof request.purposes === 'object') {
    const purposeEntries = Object.entries(request.purposes);
    if (purposeEntries.length > 0) {
      purposesText = purposeEntries.map(([doc, purpose]) => `${doc}: ${purpose}`).join('; ');
    }
  }

  // Format business info
  let businessText = 'N/A';
  if (request.businessInfo) {
    const business = request.businessInfo;
    businessText = `${business.businessName || 'N/A'} - ${business.businessAddress || 'N/A'} (${business.ownerName || 'N/A'})`;
  }

  requestItem.innerHTML = `
    <div class="request-header">
      <div class="request-title">Request #${requestId.slice(-8).toUpperCase()}</div>
      <div class="request-status ${statusClass}">${request.status || 'Pending'}</div>
    </div>
    <div class="request-date">Submitted on ${formattedDate}</div>
    <div class="request-details">
      <div class="detail-item">
        <div class="detail-label">Documents</div>
        <div class="detail-value">${documentsText}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Purposes</div>
        <div class="detail-value">${purposesText}</div>
      </div>
      ${request.businessInfo ? `
        <div class="detail-item">
          <div class="detail-label">Business Info</div>
          <div class="detail-value">${businessText}</div>
        </div>
      ` : ''}
      ${request.notes ? `
        <div class="detail-item">
          <div class="detail-label">Notes</div>
          <div class="detail-value">${request.notes}</div>
        </div>
      ` : ''}
    </div>
    <div class="click-hint">Click to view details</div>
  `;

  return requestItem;
}

// Switch to request tab
function switchToRequestTab() {
  const requestTab = document.querySelector('[data-tab="request"]');
  if (requestTab) {
    requestTab.click();
  }
}

// Modal functions
function showModal(title, message) {
  const modal = document.getElementById('globalModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');

  if (modalTitle) modalTitle.textContent = title;
  if (modalMessage) modalMessage.textContent = message;
  if (modal) modal.style.display = 'flex';
}

document.getElementById('modalCloseBtn')?.addEventListener('click', function() {
  const modal = document.getElementById('globalModal');
  if (modal) modal.style.display = 'none';
});

// =============================
//     REQUEST MODAL FUNCTIONS
// =============================

// Show request modal with QR code
function showRequestModal(request, requestId) {
  const modal = document.getElementById('requestModal');
  const modalTitle = document.getElementById('requestModalTitle');
  const requestIdEl = document.getElementById('modalRequestId');
  const statusEl = document.getElementById('modalRequestStatus');
  const dateEl = document.getElementById('modalRequestDate');
  const documentsEl = document.getElementById('modalRequestDocuments');
  const purposesEl = document.getElementById('modalRequestPurposes');
  const businessEl = document.getElementById('modalRequestBusiness');
  const notesEl = document.getElementById('modalRequestNotes');
  const businessInfoDiv = document.getElementById('modalBusinessInfo');
  const notesDiv = document.getElementById('modalNotes');

  if (!modal) {
    console.error('Request modal not found');
    return;
  }

  // Set modal title
  if (modalTitle) {
    modalTitle.textContent = `Request #${requestId.slice(-8).toUpperCase()}`;
  }

  // Populate request details
  if (requestIdEl) requestIdEl.textContent = requestId;
  if (statusEl) statusEl.textContent = request.status || 'Pending';

  // Format and set date
  const submittedAt = request.submittedAt?.toDate();
  const formattedDate = submittedAt ? submittedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Unknown date';
  if (dateEl) dateEl.textContent = formattedDate;

  // Format documents
  const documentsText = Array.isArray(request.documents)
    ? request.documents.join(', ')
    : request.documents || 'N/A';
  if (documentsEl) documentsEl.textContent = documentsText;

  // Format purposes
  let purposesText = 'N/A';
  if (request.purposes && typeof request.purposes === 'object') {
    const purposeEntries = Object.entries(request.purposes);
    if (purposeEntries.length > 0) {
      purposesText = purposeEntries.map(([doc, purpose]) => `${doc}: ${purpose}`).join('; ');
    }
  }
  if (purposesEl) purposesEl.textContent = purposesText;

  // Handle business info
  if (businessInfoDiv && businessEl) {
    if (request.businessInfo) {
      const business = request.businessInfo;
      const businessText = `${business.businessName || 'N/A'} - ${business.businessAddress || 'N/A'} (${business.ownerName || 'N/A'})`;
      businessEl.textContent = businessText;
      businessInfoDiv.style.display = 'block';
    } else {
      businessInfoDiv.style.display = 'none';
    }
  }

  // Handle notes
  if (notesDiv && notesEl) {
    if (request.notes) {
      notesEl.textContent = request.notes;
      notesDiv.style.display = 'block';
    } else {
      notesDiv.style.display = 'none';
    }
  }

  // Handle cancel button visibility - only show for pending requests
  const modalActions = document.getElementById('modalActions');
  const cancelBtn = document.getElementById('cancelRequestBtn');
  if (modalActions && cancelBtn) {
    if (request.status && request.status.toLowerCase() === 'pending') {
      modalActions.style.display = 'flex';
      cancelBtn.onclick = () => cancelRequest(requestId);
    } else {
      modalActions.style.display = 'none';
    }
  }



  // Show modal
  modal.style.display = 'flex';

  // Focus management for accessibility
  modal.setAttribute('aria-hidden', 'false');
  modal.focus();

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
}

// Close request modal
function closeRequestModal() {
  const modal = document.getElementById('requestModal');
  if (modal) {
    // Remove focus from any element inside the modal to avoid aria-hidden issues
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = 'auto';
  }
}

// Cancel request function
async function cancelRequest(requestId) {
  // Close the request modal first to avoid conflicts
  closeRequestModal();

  // Then show the confirmation modal
  showConfirmModal(
    'Confirm Cancellation',
    'Are you sure you want to cancel this request? This action cannot be undone.',
    async () => {
      // Proceed with cancellation
      try {
        // Update request status to cancelled
        await firebase.firestore()
          .collection('requests')
          .doc(requestId)
          .update({
            status: 'cancelled',
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
          });

        // Show success message
        showModal('Success', 'Request has been cancelled successfully.');

        // Refresh request history
        loadRequestHistory();

      } catch (error) {
        console.error('Error cancelling request:', error);
        showModal('Error', 'Failed to cancel request. Please try again.');
      }
    },
    () => {
      // Cancellation cancelled - do nothing
    }
  );
}

// Event listeners for modal closing
document.addEventListener('DOMContentLoaded', function() {
  const modalCloseBtn = document.getElementById('requestModalCloseBtn');
  const modal = document.getElementById('requestModal');

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeRequestModal);
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeRequestModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('requestModal');
      if (modal && modal.style.display === 'flex') {
        closeRequestModal();
      }
    }
  });
});
