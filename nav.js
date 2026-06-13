 const mobileTrigger = document.getElementById('mobile-nav-trigger');
  const mobilePanel = document.getElementById('mobile-nav-panel');
  const hamburgerIcon = document.getElementById('hamburger-icon');

  function toggleMobileMenu() {
    const isOpened = mobilePanel.classList.contains('opacity-100');
    
    if (isOpened) {
      // Close Transitions
      mobilePanel.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
      mobilePanel.classList.add('opacity-0', 'translate-y-[-10px]', 'pointer-events-none');
      hamburgerIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>`;
    } else {
      // Open Transitions
      mobilePanel.classList.remove('opacity-0', 'translate-y-[-10px]', 'pointer-events-none');
      mobilePanel.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
      hamburgerIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`;
    }
  }

  mobileTrigger.addEventListener('click', toggleMobileMenu);

  // Structural Scroll Elevation Accentuation
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 20) {
      header.classList.add('shadow-md', 'bg-white/95');
    } else {
      header.classList.remove('shadow-md', 'bg-white/95');
    }
  });