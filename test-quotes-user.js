require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const token = "eyJhbGciOiJFUzI1NiIsImtpZCI6ImVjNGFjMTg1LTk4MTMtNGZiNy1iNzdiLWNmOWRjNjJlMDQwMCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2V2ZXdzZWVwaWt6cXN0c3ZyamFpLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkODkxZmMwMC0wNDI0LTQ3YjEtOTg5My0zN2Y0ZjI0NTI0NTMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg5OTUzNjU1LCJpYXQiOjE3ODk5NTAwNTUsImVtYWlsIjoiY2FybG9zYWNvc3RhMTIwMDdAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdLCJyb2wiOiJVc3VhcmlvIn0sInVzZXJfbWV0YWRhdGEiOnsiYXBlbGxpZG8iOiJBY29zdGEiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibm9tYnJlIjoiQ2FybG9zIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3ODk5NTAwNTV9XSwic2Vzc2lvbl9pZCI6ImQ3OTk4YmM3LWYxNGEtNGI5NC04NzFkLTBmNGQyMDgwMzkwYSIsImlzX2Fub255bW91cyI6ZmFsc2V9.8qo0aQiHUzbhAwqUI-P09OVsqLNz_8AkzKmJDoRvx_nESwsRS5eZOsfKO00bTYRECLk8gQ-nnXNHJodlWMiuWQ";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});

async function test() {
  const { data, error } = await supabase.schema('comunidad').from('quotes').select('*');
  if (error) console.error("Error:", error);
  else console.log("Data:", data.length, data[0]);
}
test();
