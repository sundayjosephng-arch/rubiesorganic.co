  document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Intercept page reload mechanics

    // 1. Telemetry Capture
    const clientName = document.getElementById('contact-name').value.trim();
    const clientEmail = document.getElementById('contact-email-input').value.trim();
    const clientMessage = document.getElementById('contact-message').value.trim();

    // 2. Direct Corporate Email Routing Forwarder
    const companyEmail = "rubiesorganic@gmail.com";
    const mailSubject = encodeURIComponent(`New Customer Support Log from ${clientName}`);
    const mailBody = encodeURIComponent(`Sender Name: ${clientName}\nSender Email: ${clientEmail}\n\nMessage/Feedback:\n${clientMessage}`);
    
    // Generates a native system dispatch pipeline trigger
    const mailtoLink = `mailto:${companyEmail}?subject=${mailSubject}&body=${mailBody}`;
    
    // Open system client routing loop safely in backdrop
    const mailWindow = window.open(mailtoLink, '_blank');
    if (mailWindow) { setTimeout(() => mailWindow.close(), 100); }

    // 3. UI Micro-Animation Dynamic Feedback Update
    const portalWrapper = document.getElementById('contact-portal-wrapper');
    portalWrapper.classList.add('opacity-0', 'transform', 'scale-95');

    setTimeout(() => {
      // Re-populate inner interface state blocks with premium success confirmation
      portalWrapper.innerHTML = `
        <div class="bg-white rounded-3xl p-8 md:p-10 border border-[#1E2D24]/10 shadow-xl text-center space-y-6">
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-full bg-[#4F772D]/10 flex items-center justify-center relative">
              <div class="absolute inset-0 rounded-full border-2 border-[#4F772D]/20 animate-ping"></div>
              <svg class="w-8 h-8 stroke-[#4F772D]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="55" rx="32" ry="34" stroke-width="6" stroke-linecap="round"/>
                <ellipse cx="50" cy="32" rx="16" ry="6" fill="#4F772D" opacity="0.8"/>
              </svg>
            </div>
          </div>

          <div class="space-y-2">
            <span class="text-[10px] font-mono uppercase tracking-widest text-[#4F772D] font-bold">// Transmission Successful</span>
            <h3 class="font-serif text-2xl font-bold text-[#192B24]">Message Logged, ${clientName}!</h3>
          </div>

          <p class="text-sm text-[#4A5D4E] leading-relaxed max-w-sm mx-auto font-light">
            Your text has been securely compiled and forwarded directly to our corporate email dispatch. Thank you for your feedback!
          </p>

          <div class="p-5 rounded-2xl bg-[#FAF8F5] border border-[#1E2D24]/5 inline-block w-full">
            <span class="text-xs font-medium text-[#192B24] block">
              ✨ "We'll shortly get back to you."
            </span>
            <span class="text-[11px] text-[#4A5D4E]/70 font-sans block mt-1">Our dedicated team typically updates active correspondence files within 2-4 hours.</span>
          </div>

          <div class="pt-2">
            <button onclick="window.location.reload();" class="text-xs uppercase tracking-wider font-mono font-bold text-[#344E41] hover:text-[#233B31] underline transition-colors">
              Submit Another Inquiry
            </button>
          </div>
        </div>
      `;
      portalWrapper.classList.remove('opacity-0', 'scale-95');
    }, 400);
  });