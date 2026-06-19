const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function testCreateCategory() {
  const form = new FormData();
  form.append('name', 'Test Category ' + Date.now());
  form.append('type', 'men');
  form.append('description', 'Test description');

  // Let's create a dummy file to upload
  const dummyFile = path.join(__dirname, 'dummy.txt');
  fs.writeFileSync(dummyFile, 'dummy content');
  
  form.append('image', fs.createReadStream(dummyFile));

  try {
    const res = await axios.post('http://localhost:5000/api/admin/categories', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  } finally {
    if (fs.existsSync(dummyFile)) fs.unlinkSync(dummyFile);
  }
}

testCreateCategory();
