// 1. Initialize Supabase Client
// Replace these placeholders with your actual keys found in Supabase -> Settings -> API
const SUPABASE_URL = 'https://your-supabase-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-supabase-anon-public-key';

const createClient = window.supabase?.createClient || window.Supabase?.createClient;
if (!createClient) {
  console.error('Supabase JS SDK not found. Ensure the CDN script is loaded before script.js.');
}
const supabase = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

async function handleFormSubmission(event) {
  event.preventDefault();
  const form = event.target;

  const clientName = document.getElementById('clientNameInput').value.trim();
  const clientEmail = document.getElementById('clientEmailInput').value.trim();
  const productName = document.getElementById('displayProductName').value.trim();
  const sizeQuantityInput = document.getElementsByName('Requested Size and Quantity')[0];
  const logisticsInstructionsInput = document.getElementsByName('Logistics Instructions')[0];

  const sizeQuantity = sizeQuantityInput ? sizeQuantityInput.value.trim() : '';
  const logisticsInstructions = logisticsInstructionsInput ? logisticsInstructionsInput.value.trim() : '';

  document.getElementById('successUserName').innerText = clientName || 'Customer';

  if (!supabase) {
    alert('Supabase is not initialized. Please add your Supabase keys and load the SDK first.');
    return;
  }

  try {
    const { error } = await supabase.from('orders').insert([
      {
        product_name: productName,
        client_name: clientName,
        client_email: clientEmail,
        size_quantity: sizeQuantity,
        logistics_instructions: logisticsInstructions
      }
    ]);

    if (error) {
      console.error('Supabase Database Error:', error);
      alert('Operational delay: please confirm your inputs and Supabase configuration.');
      return;
    }

    showSuccessScreen();
    form.reset();
  } catch (error) {
    console.error('Network Error:', error);
    alert('Unable to reach Supabase. Please try again later.');
  }
}

function showSuccessScreen() {
  document.getElementById('modalFormContent').classList.add('hidden');
  document.getElementById('modalSuccessContent').classList.remove('hidden');
}