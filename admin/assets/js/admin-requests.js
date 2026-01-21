// admin-requests.js - Request Management Functions

// Load Requests Table
async function loadRequestsTable() {
  try {
    const requestsSnapshot = await firestore.collection('requests').orderBy('submittedAt', 'desc').get();
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';

    // Get all user profiles for name lookup
    const profilesSnapshot = await firestore.collection('profiles').get();
    const userProfiles = {};
    profilesSnapshot.forEach(doc => {
      const profile = doc.data();
      userProfiles[doc.id] = profile;
    });

    requestsSnapshot.forEach(doc => {
      const request = doc.data();
      const userProfile = userProfiles[request.userId];
      const userName = userProfile ? [userProfile.firstName, userProfile.middleName, userProfile.lastName, userProfile.suffix].filter(Boolean).join(' ') : 'N/A';
      const row = createRequestRow(doc.id, request, userName);
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading requests:", error);
  }
}

// Create Request Row
function createRequestRow(id, request, userName) {
  const row = document.createElement('tr');

  const statusClass = getStatusClass(request.status);

  row.innerHTML = `
    <td>${id.substring(0, 8)}...</td>
    <td>${userName}</td>
    <td><span class="status ${statusClass}">${request.status || 'pending'}</span></td>
    <td>${request.submittedAt ? new Date(request.submittedAt.toDate()).toLocaleDateString() : 'N/A'}</td>
    <td>
      <button class="action-btn" onclick="viewRequestDetails('${id}')">View</button>
      <button class="action-btn" onclick="updateRequestStatus('${id}', 'completed')">Complete</button>
    </td>
  `;

  return row;
}

// Get Status Class
function getStatusClass(status) {
  switch (status) {
    case 'pending': return 'pending';
    case 'processing': return 'processing';
    case 'completed': return 'completed';
    case 'rejected': return 'rejected';
    case 'cancelled': return 'cancelled';
    default: return 'pending';
  }
}

// View Request Details
async function viewRequestDetails(requestId) {
  try {
    const doc = await firestore.collection('requests').doc(requestId).get();
    if (doc.exists) {
      const request = doc.data();

      document.getElementById('modalRequestId').textContent = requestId;
      document.getElementById('modalRequestStatus').textContent = request.status || 'pending';
      document.getElementById('modalRequestDate').textContent = request.submittedAt ? new Date(request.submittedAt.toDate()).toLocaleDateString() : 'N/A';
      document.getElementById('modalRequestDocuments').textContent = request.documents ? request.documents.join(', ') : 'N/A';
      document.getElementById('modalRequestPurposes').textContent = request.purposes ? Object.entries(request.purposes).map(([key, value]) => `${key}: ${value}`).join('; ') : 'N/A';

      if (request.businessInfo && typeof request.businessInfo === 'object') {
        document.getElementById('modalBusinessInfo').style.display = 'block';
        const businessText = [
          request.businessInfo.businessName,
          request.businessInfo.businessAddress,
          request.businessInfo.ownerName
        ].filter(Boolean).join(', ');
        document.getElementById('modalRequestBusiness').textContent = businessText;
      } else {
        document.getElementById('modalBusinessInfo').style.display = 'none';
      }

      if (request.notes) {
        document.getElementById('modalNotes').style.display = 'block';
        document.getElementById('modalRequestNotes').textContent = request.notes;
      } else {
        document.getElementById('modalNotes').style.display = 'none';
      }

      document.getElementById('modalActions').style.display = 'flex';
      document.getElementById('requestModal').style.display = 'flex';
    }
  } catch (error) {
    console.error("Error viewing request details:", error);
    showModal("Error", "Failed to load request details.");
  }
}

// Update Request Status
async function updateRequestStatus(requestId, newStatus) {
  try {
    await firestore.collection('requests').doc(requestId).update({
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Auto-print certificate if status is completed
    if (newStatus === 'completed') {
      await printCertificate(requestId);
    }

    showModal("Success", `Request status updated to ${newStatus}.`);
    loadDashboardData(); // Refresh data
  } catch (error) {
    console.error("Error updating request status:", error);
    showModal("Error", "Failed to update request status.");
  }
}

// Print Certificate
async function printCertificate(requestId) {
  try {
    // Get request data
    const requestDoc = await firestore.collection('requests').doc(requestId).get();
    if (!requestDoc.exists) {
      console.error("Request not found for printing");
      return;
    }

    const request = requestDoc.data();

    // Get user profile
    const profileDoc = await firestore.collection('profiles').doc(request.userId).get();
    let userName = 'N/A';
    if (profileDoc.exists) {
      const profile = profileDoc.data();
      userName = [profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' ');
    }

    // Prepare certificate data
    const certificateData = {
      requestId: requestId,
      userName: userName,
      documents: request.documents || [],
      purposes: request.purposes || {},
      businessInfo: request.businessInfo || null,
      notes: request.notes || null
    };

    // Open certificate in new window
    const printWindow = window.open('certificate.html', '_blank', 'width=900,height=700');

    // Wait for window to load, then populate and print
    printWindow.addEventListener('load', function() {
      printWindow.populateCertificate(certificateData);
    });

  } catch (error) {
    console.error("Error printing certificate:", error);
    showModal("Error", "Failed to print certificate.");
  }
}
