 document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Halt normal server page routing crashes
    
    // Capture user record telemetry nodes
    const userName = document.getElementById('reg-name').value.trim();
    const userEmail = document.getElementById('reg-email').value.trim();
    const userPhone = document.getElementById('reg-phone').value.trim();

    // Structural object array mapping
    const userData = {
      name: userName,
      email: userEmail,
      phone: userPhone,
      timestamp: new Date().toISOString()
    };

    // Save automatically into client browser localStorage memory cluster
    localStorage.setItem('rubies_member_session', JSON.stringify(userData));

    // Targeted DOM injection wrapper target container
    const wrapper = document.getElementById('register-interface-wrapper');
    
    // Execute smooth visual state transition
    wrapper.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => {
      // Clean swap target interior content matrix with bespoke prestige response
      wrapper.innerHTML = `
        <div class="text-center py-8 space-y-6 animate-fadeIn">
          <!-- Rubies Central Organic Logo Animation Ring -->
          <div class="flex justify-center">
            <div class="w-20 h-20 rounded-full bg-[#4F772D]/10 flex items-center justify-center animate-pulse relative">
              <div class="absolute inset-0 rounded-full border-2 border-[#4F772D]/20 animate-ping"></div>
              <svg class="w-10 h-10 stroke-[#4F772D]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="55" rx="32" ry="34" stroke-width="6" stroke-linecap="round"/>
                <ellipse cx="50" cy="32" rx="16" ry="6" fill="#4F772D" opacity="0.8"/>
                <path d="M50 20 Q35 12 20 25 Q35 25 45 32" stroke-width="4" stroke-linecap="round"/>
                <path d="M50 20 Q65 12 80 25 Q65 25 55 32" stroke-width="4" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <div class="space-y-2">
            <div class="text-xs font-mono uppercase tracking-[0.2em] text-[#4F772D] font-bold">Registration Verified</div>
            <h2 class="font-serif text-3xl font-normal text-[#192B24]">Welcome, ${userName}!</h2>
          </div>

          <p class="text-sm text-[#4A5D4E] leading-relaxed max-w-xs mx-auto font-light">
            Thank you for signing in and joining our sustainable wellness collective. Your account has been automatically securely established.
          </p>

          <div class="p-4 rounded-xl bg-[#FAF8F5] border border-[#1E2D24]/5 space-y-1">
            <div class="text-[10px] font-mono uppercase text-[#76532B] tracking-wider font-bold">Your Direct Welcome Allocation Code</div>
            <div class="font-mono text-lg font-bold text-[#192B24] tracking-widest uppercase">RUBIES10</div>
            <div class="text-[10px] text-[#4A5D4E]/60 font-sans">Use code at check-out for 10% off your collection order.</div>
          </div>

          <div class="pt-4">
            <button onclick="if(typeof navigateTo === 'function') { navigateTo('shop') } else { window.location.reload(); }" class="bg-[#344E41] hover:bg-[#233B31] text-white py-3 px-8 rounded-xl font-bold tracking-wide text-xs uppercase shadow-md transition duration-300">
              Explore Main Collection
            </button>
          </div>
        </div>
      `;
      
      // Return panel component visibility smoothly
      wrapper.classList.remove('opacity-0', 'scale-95');
    }, 400);
  });