# Remove Remember Me Feature

- [x] Remove remember me checkbox and label from index.html
- [x] Remove .remember-me CSS styling from assets/css/style.css
- [x] Remove remember me JavaScript logic from assets/js/index.js

# Add Edit Info and Archive Functionality to User Details Panel

- [x] Add "Edit Info" and "Archive" buttons to user details header in admin.html
- [x] Add CSS styling for user-actions class in admin.css
- [x] Add event listeners for edit and archive buttons in admin.js
- [x] Implement editUserInfo function with basic email editing functionality
- [x] Implement archiveUser function to move users to archived_profiles collection

# Add Auto-Print Certificate Functionality

- [x] Create certificate.html template with Barangay 186 logo, official wording, and signature placeholders
- [x] Modify admin-requests.js to generate certificate dynamically with request details and trigger print when status is set to 'completed'
- [x] Certificate includes user name, requested documents, purposes, business info (if applicable), notes, and completion date

# Add Preview Feature for Certificates

- [x] Update certificate templates in certs/ folder with improved CSS, logo, and structure based on provided template
- [x] Add preview button in request.html review step
- [x] Modify request.js to handle preview functionality, populating templates with form data
- [x] Test preview for indigency, residency, and barangay ID certificates
