// submit.js - Handles form submission and database operations

/**
 * Submits the document request form data to Firestore
 * @param {Event} e - The form submit event
 */
async function submitRequest(e) {
  e.preventDefault();

  // Validate final step before submission
  if (!validateFinalStep()) return;

  // Get form values
  const selectedDocuments = Array.from(document.querySelectorAll('input[name="documents"]:checked')).map(cb => cb.value);

  // Collect purposes from all visible purpose groups
  const purposes = {};
  const visiblePurposeGroups = document.querySelectorAll('.purpose-group[style*="display: block"]');
  visiblePurposeGroups.forEach(group => {
    const select = group.querySelector('select');
    const customInput = group.querySelector('input[type="text"]');
    const label = group.querySelector('label').textContent.replace('Purpose for ', '').replace('Purpose', '').trim();

    if (select && select.value) {
      if (select.value === 'Others') {
        purposes[label] = customInput ? customInput.value.trim() : '';
      } else {
        purposes[label] = select.value;
      }
    }
  });

  const notes = document.getElementById('notes').value.trim();

  // Get business info if applicable
  const businessName = document.getElementById('businessName').value.trim();
  const businessAddress = document.getElementById('businessAddress').value.trim();
  const ownerName = document.getElementById('ownerName').value.trim();

  try {
    // Get current user
    const user = firebase.auth().currentUser;
    if (!user) {
      showModal('Error', 'You must be logged in to submit a request.');
      return;
    }

    // Prepare request data
    const requestData = {
      userId: user.uid,
      documents: selectedDocuments,
      purposes: purposes,
      notes: notes,
      status: 'pending',
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Add business info if business documents are selected
    if (selectedDocuments.some(doc => doc.includes('Business'))) {
      requestData.businessInfo = {
        businessName: businessName,
        businessAddress: businessAddress,
        ownerName: ownerName
      };
    }

    // Save to Firestore
    await firebase.firestore().collection('requests').add(requestData);

    // Success modal
    showModal('Success', 'Your request has been submitted successfully! You will be redirected to the home page.');

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 2000);

  } catch (error) {
    console.error('Error submitting request:', error);
    showModal('Error', 'Failed to submit request. Please try again.');
  }
}

/**
 * Validates the final step before submission
 * @returns {boolean} - True if validation passes, false otherwise
 */
function validateFinalStep() {
  // Get selected documents
  const selectedDocuments = Array.from(document.querySelectorAll('input[name="documents"]:checked')).map(cb => cb.value);

  // Check if any selected documents require purpose selection
  const documentsRequiringPurpose = ['Barangay Clearance', 'Barangay Residency', 'Barangay Indigency'];
  const hasDocumentsRequiringPurpose = selectedDocuments.some(doc => documentsRequiringPurpose.includes(doc));

  if (hasDocumentsRequiringPurpose) {
    // Check if at least one purpose is selected for visible purpose groups
    const visiblePurposeGroups = document.querySelectorAll('.purpose-group[style*="display: block"]');
    let hasValidPurpose = false;

    visiblePurposeGroups.forEach(group => {
      const select = group.querySelector('select');
      const customInput = group.querySelector('input[type="text"]');
      if (select && select.value) {
        if (select.value === 'Others') {
          if (customInput && customInput.value.trim()) {
            hasValidPurpose = true;
          }
        } else {
          hasValidPurpose = true;
        }
      }
    });

    if (!hasValidPurpose) {
      showModal('Error', 'Please select a purpose for each document type.');
      return false;
    }
  }

  // Check if business documents are selected and business details are filled
  const businessDocuments = ['Business Permit', 'Business Clearance'];
  const hasBusinessDocuments = selectedDocuments.some(doc => businessDocuments.includes(doc));

  if (hasBusinessDocuments) {
    const businessName = document.getElementById('businessName').value.trim();
    const businessAddress = document.getElementById('businessAddress').value.trim();
    const ownerName = document.getElementById('ownerName').value.trim();

    if (!businessName || !businessAddress || !ownerName) {
      showModal('Error', 'Please fill in all business information fields.');
      return false;
    }
  }

  return true;
}

// Note: showModal function is imported from modal.js

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { submitRequest, validateFinalStep };
}
