import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Rampa de subida hasta 100 usuarios concurrentes
    { duration: '10m', target: 100 }, // Carga sostenida (CP-NF-002, CP-NF-003 y CP-NF-004)
    { duration: '1m', target: 0 },    // Rampa de enfriamiento
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'avg<400'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000/api/v1';

export default function () {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: __ENV.TEST_EMAIL, password: __ENV.TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'login status 200': (r) => r.status === 200 });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginRes.json('access_token')}`,
    },
  };

  const dashRes = http.get(`${BASE_URL}/users/habits/dashboard`, params);
  check(dashRes, { 'dashboard status 200': (r) => r.status === 200 });

  const checkRes = http.post(
    `${BASE_URL}/users/records/completar`,
    JSON.stringify({ idHabito: __ENV.TEST_HABIT_ID, fecha: '2026-11-10' }),
    params
  );

  check(checkRes, {
    'check-in controlado (200/201 o 400/409 idempotente sin 5xx)': (r) =>
      r.status === 200 || r.status === 201 || r.status === 400 || r.status === 409,
  });

  sleep(1);
}
