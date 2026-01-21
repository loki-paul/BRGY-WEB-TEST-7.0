// request.js

let allPurposes = {}; // Will store all purposes from Firestore

// Load purposes from Firestore
async function loadPurposes() {
  try {
    const doc = await firebase.firestore().collection("document_purposes").doc("all").get();
    if (doc.exists) {
      allPurposes = doc.data();
    } else {
      console.error("No purposes found in Firestore!");
      allPurposes = {};
    }
  } catch (err) {
    console.error("Failed to load purposes:", err);
    allPurposes = {};
  }
}

// Hide page loader after content loads
window.addEventListener('load', function() {
  document.getElementById('pageLoader').style.display = 'none';
});

// Multi-step form functionality
document.addEventListener('DOMContentLoaded', async function() {
  await loadPurposes(); // Load all purposes from Firestore
  const formSections = document.querySelectorAll('.form-section');
  const progressSteps = document.querySelectorAll('.progress-step');
  const nextButtons = document.querySelectorAll('.btn-next');
  const prevButtons = document.querySelectorAll('.btn-prev');
  const requestForm = document.getElementById('requestForm');

  let currentStep = 1;
  const totalSteps = 3;

  // Initialize form
  showStep(currentStep);

  // Step back button handler (goes to home page)
  const stepBackBtn = document.getElementById('stepBackBtn');
  if (stepBackBtn) {
    stepBackBtn.addEventListener('click', function() {
      window.location.href = 'home.html';
    });
  }

  // Next button handlers
  nextButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  // Previous button handlers
  prevButtons.forEach(button => {
    button.addEventListener('click', function() {
      currentStep--;
      showStep(currentStep);
    });
  });

  // Document selection handlers (checkboxes)
  const documentOptions = document.querySelectorAll('.document-option');
  documentOptions.forEach(option => {
    option.addEventListener('click', function() {
      const checkbox = this.querySelector('input[type="checkbox"]');
      checkbox.checked = !checkbox.checked;
      this.classList.toggle('selected', checkbox.checked);
      toggleBusinessFields();
    });
  });

  // Also handle direct checkbox clicks
  const checkboxes = document.querySelectorAll('input[name="documents"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      this.closest('.document-option').classList.toggle('selected', this.checked);
      toggleBusinessFields();
    });
  });



  // Purpose change handlers for custom inputs
  const purposeSelects = [
    { select: document.getElementById('purposeClearance'), custom: document.getElementById('customPurposeClearance') },
    { select: document.getElementById('purposeResidency'), custom: document.getElementById('customPurposeResidency') },
    { select: document.getElementById('purposeIndigency'), custom: document.getElementById('customPurposeIndigency') },
    { select: document.getElementById('purposeBusiness'), custom: document.getElementById('customPurposeBusiness') },
    { select: document.getElementById('purposeGeneral'), custom: document.getElementById('customPurposeGeneral') }
  ];

  purposeSelects.forEach(({ select, custom }) => {
    if (select) {
      select.addEventListener('change', function() {
        toggleCustomPurpose(this.value, custom);
      });
    }
  });

  // Form submission
  requestForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateStep(3)) return;

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
  });

  function showStep(step) {
    // Hide all sections
    formSections.forEach(section => section.classList.remove('active'));

    // Show current section
    document.querySelector(`[data-section="${step}"]`).classList.add('active');

    // Update progress bar
    progressSteps.forEach((stepEl, index) => {
      if (index + 1 <= step) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    });

    // Show/hide step back button (only visible on step 1)
    const stepBackBtn = document.getElementById('stepBackBtn');
    if (stepBackBtn) {
      stepBackBtn.style.display = step === 1 ? 'block' : 'none';
    }

    // Handle step 2 logic
    if (step === 2) {
      const selectedDocuments = Array.from(document.querySelectorAll('input[name="documents"]:checked')).map(cb => cb.value);
      const businessFields = document.getElementById('businessFields');

      showPurposeGroups(selectedDocuments);
      toggleBusinessFields();
    }

    // Update review section if on step 3
    if (step === 3) {
      updateReviewSection();
    }
  }

  function validateStep(step) {
    switch (step) {
      case 1:
        const selectedDocs = document.querySelectorAll('input[name="documents"]:checked');
        if (selectedDocs.length === 0) {
          showModal('Error', 'Please select at least one document.');
          return false;
        }
        return true;

      case 2:
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

      case 3:
        // Final validation before submission - now handled by validateFinalStep in submit.js
        return validateFinalStep();

      default:
        return true;
    }
  }

  function toggleBusinessFields() {
    const selectedDocs = Array.from(document.querySelectorAll('input[name="documents"]:checked')).map(cb => cb.value);
    const businessFields = document.getElementById('businessFields');
    const hasBusinessDoc = selectedDocs.some(doc => doc.includes('Business'));

    businessFields.style.display = hasBusinessDoc ? 'block' : 'none';
  }

  // Populate dropdown dynamically
  function populatePurposeDropdown(selectId, selectedDocument) {
    const purposeSelect = document.getElementById(selectId);
    if (!purposeSelect) return;

    purposeSelect.innerHTML = '<option value="">Select Purpose</option>';

    let purposes = [];

    switch (selectedDocument) {
      case "Barangay Clearance":
        purposes = allPurposes.barangay_clearance || [];
        break;
      case "Barangay Residency":
        purposes = allPurposes.barangay_residency || [];
        break;
      case "Barangay Indigency":
        purposes = allPurposes.barangay_indigency || [];
        break;
      case "Business":
        purposes = allPurposes.business || [];
        break;
      default:
        purposes = allPurposes.default || [];
    }

    // Remove duplicates
    const uniquePurposes = [...new Set(purposes)];

    uniquePurposes.forEach(purpose => {
      const option = document.createElement("option");
      option.value = purpose;
      option.textContent = purpose;
      purposeSelect.appendChild(option);
    });

    // Add "Others" option
    const othersOption = document.createElement("option");
    othersOption.value = "Others";
    othersOption.textContent = "Others: specify";
    purposeSelect.appendChild(othersOption);
  }

  // Show purpose groups dynamically
  function showPurposeGroups(selectedDocuments) {
    const allPurposeGroups = document.querySelectorAll(".purpose-group");
    allPurposeGroups.forEach(group => (group.style.display = "none"));

    if (selectedDocuments.includes("Barangay Clearance")) {
      document.getElementById("purposeGroupClearance").style.display = "block";
      populatePurposeDropdown("purposeClearance", "Barangay Clearance");
    }
    if (selectedDocuments.includes("Barangay Residency")) {
      document.getElementById("purposeGroupResidency").style.display = "block";
      populatePurposeDropdown("purposeResidency", "Barangay Residency");
    }
    if (selectedDocuments.includes("Barangay Indigency")) {
      document.getElementById("purposeGroupIndigency").style.display = "block";
      populatePurposeDropdown("purposeIndigency", "Barangay Indigency");
    }
    if (selectedDocuments.some(doc => doc.includes("Business"))) {
      document.getElementById("purposeGroupBusiness").style.display = "block";
      populatePurposeDropdown("purposeBusiness", "Business");
    }
  }

  function toggleCustomPurpose(selectedValue, customInput) {
    if (customInput) {
      customInput.style.display = selectedValue === 'Others' ? 'block' : 'none';
      if (selectedValue !== 'Others') {
        customInput.value = '';
      }
    }
  }

  function updateReviewSection() {
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

    const purposeText = Object.entries(purposes).map(([key, value]) => `${key}: ${value}`).join('; ') || '-';
    const notes = document.getElementById('notes').value.trim() || '-';

    document.getElementById('review-doc-type').textContent = selectedDocuments.join(', ') || '-';
    document.getElementById('review-purpose').textContent = purposeText;
    document.getElementById('review-notes').textContent = notes;
  }

  // Preview functionality
  async function previewCertificates() {
    const selectedDocuments = Array.from(document.querySelectorAll('input[name="documents"]:checked')).map(cb => cb.value);

    if (selectedDocuments.length === 0) {
      showModal('Error', 'Please select at least one document to preview.');
      return;
    }

    try {
      // Get current user
      const user = firebase.auth().currentUser;
      if (!user) {
        showModal('Error', 'You must be logged in to preview certificates.');
        return;
      }

      // Get user profile data from Firestore (profiles collection)
      const profileDoc = await firebase.firestore().collection('profiles').doc(user.uid).get();
      let userData = {};

      if (profileDoc.exists) {
        const userProfile = profileDoc.data();

        // Construct full name from profile fields
        const fullName = [
          userProfile.firstName,
          userProfile.middleName,
          userProfile.lastName,
          userProfile.suffix
        ].filter(Boolean).join(' ');

        // Construct complete address from address object
        let completeAddress = '';
        if (userProfile.address) {
          const addr = userProfile.address;
          const addressParts = [
            addr.completeAddress,
            'Barangay 186, Caloocan City'
          ].filter(Boolean);
          completeAddress = addressParts.join(', ');
        }

        userData = {
          userName: fullName || user.displayName || user.email,
          userAddress: completeAddress || userProfile.completeAddress || 'Address not provided',
          yearOfStay: userProfile.address?.yearsOfResidency ? `${userProfile.address.yearsOfResidency} years` : 'Years of stay not specified'
        };
      } else {
        // Fallback to auth data
        userData = {
          userName: user.displayName || user.email,
          userAddress: 'Address not provided',
          yearOfStay: 'Years of stay not specified'
        };
      }

      // Collect purposes
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

    // Preview each selected certificate
    selectedDocuments.forEach(doc => {
      let templateUrl = '';
      let data = { ...userData, notes };

      switch (doc) {
        case 'Barangay Indigency':
          templateUrl = 'certs/certificate_indigency.html';
          data.purposeIndigency = purposes['Barangay Indigency'] || 'For indigency purposes';
          break;
        case 'Barangay Residency':
          templateUrl = 'certs/certificate_residency.html';
          data.purposeResidency = purposes['Barangay Residency'] || 'For residency purposes';
          break;
        case 'Barangay ID':
          templateUrl = 'certs/idcard.html';
          // ID card uses different data structure, handled in the template
          break;
        default:
          // For other documents, skip preview for now
          return;
      }

      // Open preview window
      const previewWindow = window.open(templateUrl, '_blank', 'width=800,height=600');

      // Wait for the window to load, then populate data
      previewWindow.addEventListener('load', function() {
        if (previewWindow.populateCertificate) {
          previewWindow.populateCertificate(data);
        }
      });
    });
    } catch (error) {
      console.error('Error loading user data for preview:', error);
      showModal('Error', 'Failed to load user data for preview. Please try again.');
    }
  }

  // Add preview button event listener
  const previewBtn = document.getElementById('previewBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', previewCertificates);
  }
});

// Modal functions
function showModal(title, message) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('globalModal').style.display = 'flex';
}

document.getElementById('modalCloseBtn').addEventListener('click', function() {
  document.getElementById('globalModal').style.display = 'none';
});
