// 1. Initialize Supabase Client
// Replace these placeholders with your actual keys found in Supabase -> Settings -> API
const SUPABASE_URL = 'https://your-supabase-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-supabase-anon-public-key';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function handleFormSubmission(event) {
  event.preventDefault();
  
  const clientName = document.getElementById('clientNameInput').value;
  const clientEmail = document.getElementById('clientEmailInput').value;
  const productName = document.getElementById('displayProductName').value;
  const sizeQuantity = document.getElementsByName('Requested Size and Quantity')[0].value;
  const logisticsInstructions = document.getElementsByName('Logistics Instructions')[0].value;

  document.getElementById('successUserName').innerText = clientName;

  // 2. Insert payload data directly into your Supabase Database
  supabase
    .from('orders')
    .insert([
      { 
        product_name: productName, 
        client_name: clientName, 
        client_email: clientEmail, 
        size_quantity: sizeQuantity, 
        logistics_instructions: logisticsInstructions 
      }
    ])
    .then(response => {
      if (response.error) {
        console.error('Supabase Database Error:', response.error);
        alert("Operational Delay: Please check your data fields.");
      } else {
        // Success! Proceed to show your premium appreciation graphic screen
        showSuccessScreen();
        event.target.reset();
      }
    })
    .catch(error => {
      console.error('Network Error:', error);
      showSuccessScreen(); // Fallback UI state
    });
}

function showSuccessScreen() {
  document.getElementById('modalFormContent').classList.add('hidden');
  document.getElementById('modalSuccessContent').classList.remove('hidden');
}