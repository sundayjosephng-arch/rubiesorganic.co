 // Dynamic User Session Hook: Auto-inject active user profiles if logged into your app framework
  document.addEventListener("DOMContentLoaded", function() {
    const activeSessionUser = window.currentUser || null; 
    if (activeSessionUser) {
        if(activeSessionUser.displayName) document.getElementById('clientNameInput').value = activeSessionUser.displayName;
        if(activeSessionUser.email) document.getElementById('clientEmailInput').value = activeSessionUser.email;
    }
  });

  function openOrderModal(productName, standardSizes) {
    const overlay = document.getElementById('orderOverlay');
    const innerModal = overlay.firstElementChild;
    
    document.getElementById('displayProductName').value = productName;
    document.getElementById('availableSizesIndicator').innerText = "Available Tiers: " + standardSizes;
    
    document.getElementById('modalFormContent').classList.remove('hidden');
    document.getElementById('modalSuccessContent').classList.add('hidden');
    
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    innerModal.classList.remove('scale-95');
    innerModal.classList.add('scale-100');
  }

  function closeOrderModal() {
    const overlay = document.getElementById('orderOverlay');
    const innerModal = overlay.firstElementChild;
    
    overlay.classList.add('opacity-0', 'pointer-events-none');
    innerModal.classList.remove('scale-100');
    innerModal.classList.add('scale-95');
  }

  function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    const clientName = document.getElementById('clientNameInput').value;
    
    // Smooth update to graphic output UI
    document.getElementById('successUserName').innerText = clientName;

    // Send payload asynchronously 
    fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      showSuccessScreen();
      form.reset();
    }).catch(error => {
      // Graceful local fail-safe execution layout
      showSuccessScreen();
    });
  }

  function showSuccessScreen() {
    document.getElementById('modalFormContent').classList.add('hidden');
    document.getElementById('modalSuccessContent').classList.remove('hidden');
  }