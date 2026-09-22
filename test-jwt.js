const token = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZXdzZWVwaWt6cXN0c3ZyamFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU0MTUxMSwiZXhwIjoyMDkwMTE3NTExfQ.FUZfHMr7QRh-v08rGXxwESs2K8NFtM0AP775uHv03Ug";
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
console.log(payload);
