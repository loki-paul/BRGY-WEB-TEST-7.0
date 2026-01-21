function showModal(title, message) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerHTML = message;

    // Hide confirmation buttons, show OK button
    document.getElementById("modalConfirmBtn").style.display = "none";
    document.getElementById("modalCancelBtn").style.display = "none";
    document.getElementById("modalCloseBtn").style.display = "inline-block";

    document.getElementById("globalModal").style.display = "flex";
}

function showConfirmModal(title, message, onConfirm, onCancel) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerHTML = message;

    // Show confirmation buttons, hide OK button
    document.getElementById("modalConfirmBtn").style.display = "inline-block";
    document.getElementById("modalCancelBtn").style.display = "inline-block";
    document.getElementById("modalCloseBtn").style.display = "none";

    // Set higher z-index to appear above request modal
    document.getElementById("globalModal").style.zIndex = "10000";

    // Set up event listeners
    const confirmBtn = document.getElementById("modalConfirmBtn");
    const cancelBtn = document.getElementById("modalCancelBtn");

    // Remove previous listeners
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;

    // Add new listeners
    confirmBtn.onclick = function() {
        closeModal();
        if (onConfirm) onConfirm();
    };

    cancelBtn.onclick = function() {
        closeModal();
        if (onCancel) onCancel();
    };

    document.getElementById("globalModal").style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("globalModal");
    modal.style.display = "none";
    // Reset z-index to default
    modal.style.zIndex = "9999";
    // Reset button states to default (OK button visible, confirmation buttons hidden)
    document.getElementById("modalConfirmBtn").style.display = "none";
    document.getElementById("modalCancelBtn").style.display = "none";
    document.getElementById("modalCloseBtn").style.display = "inline-block";
}

document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
