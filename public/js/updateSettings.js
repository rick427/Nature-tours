import axios from 'axios';
import {showAlert} from './alerts';

export const updateData = async (name, email) => {
  try {
    const res = await axios({
        method: 'PATCH',
        url: 'http://localhost:5000/api/v1/users/updateMe',
        data: {
            name, 
            email
        }
    })

    if(res.data.status === 'success'){
        showAlert('success', 'Data updated Successfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
}