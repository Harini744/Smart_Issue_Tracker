const axios = require('axios');

async function run() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'student@college.edu',
      password: 'student123'
    });
    const token = loginRes.data.token;
    console.log('Logged in, token length:', token.length);

    const createRes = await axios.post('http://localhost:5000/api/complaints', {
      title: 'API test complaint',
      description: 'Complaint created by automated test script',
      category: 'IT Support',
      priority: 'Low'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Created complaint id:', createRes.data.complaint._id);
    console.log(JSON.stringify(createRes.data.complaint, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('API error:', err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

run();
