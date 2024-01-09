const base_url = 'https://appointment-backend-gsz1.onrender.com/api';
let student_id;
let appointment_id;
let studentIds = [];
let appointmentIds = [];
let userDetail;
let all_student_list = [];
let all_appointment_list = [];

let countryData = [
  {
    country:'US',
    state:['California','Texas','New York','Florida','Illinois']
  },
  {
    country:'UK',
    state:['England','Scotland','Wales','Northern Ireland','London']
  },
  {
    country:'Canada',
    state:['Ontario','Quebec','British Columbia','Alberta','Manitoba']
  },
]

if (window.location.pathname.includes('studentform')) {
  let element = '<option disabled value="" selected>Select Country</option>';
  for (const item of countryData) {
    element += `<option value=${item.country}>${item.country}</option>`
  }
  document.getElementById('country').innerHTML = element;
}

function selectCountry(){
  const val = document.getElementById('country').value;
  const stateval = countryData.find((ele)=>ele.country === val).state;
  let element = '<option disabled value="" selected>Select State</option>';
  for (const item of stateval) {
    element += `<option value=${item}>${item}</option>`
  }
  document.getElementById('state').innerHTML = element;
}


if (localStorage.getItem('user_detail')) {
  userDetail = JSON.parse(localStorage.getItem('user_detail'));
  if (window.location.pathname.includes('dashboard')) {
    document.getElementById('user_name').innerText = userDetail.username;
  }
  if (window.location.pathname.includes('index')) {
    window.location.href = './dashboard.html';
  }
} else {
  if (window.location.pathname.includes('appointmentform') ||
    window.location.pathname.includes('dashboard') ||
    window.location.pathname.includes('reports') ||
    window.location.pathname.includes('studentform')
  ) {
    window.location.href = './index.html';
  }
}

function logout() {
  localStorage.removeItem('user_detail');
  window.location.href = './index.html';
}

async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  document.getElementById('loader').style.display = 'flex';

  try {
    const response = await fetch(`${base_url}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.status === 200) {
      const result = await response.json();
      localStorage.setItem('user_detail', JSON.stringify(result));
      window.location.href = './dashboard.html';
    } else {
      const result = await response.json();
      Swal.fire({ icon: "error", text: result.message });
    }
  } catch (error) {
    console.error("Error:", error);
  }finally{
    document.getElementById('loader').style.display = 'none';
  }
}

function addUpdateStudent(event) {
  event.preventDefault();
  if (student_id) {
    updateStudent();
  } else {
    addStudent();
  }
}

async function addStudent() {
  const name = document.getElementById('name').value;
  const IEPduedate = document.getElementById('IEPduedate').value;
  const phonenumber = document.getElementById('phonenumber').value;
  const address = document.getElementById('address').value;
  const postalcode = document.getElementById('postalcode').value;
  const country = document.getElementById('country').value;
  const state = document.getElementById('state').value;

  try {
    document.getElementById('loader').style.display = 'flex';
    const response = await fetch(`${base_url}/admin/add-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": userDetail.token
      },
      body: JSON.stringify({ name, IEPduedate, phonenumber, address, postalcode, country, state }),
    });

    const result = await response.json();
    document.getElementById('name').value = '';
    document.getElementById('IEPduedate').value = '';
    document.getElementById('phonenumber').value = '';
    document.getElementById('address').value = '';
    document.getElementById('postalcode').value = '';
    document.getElementById('country').value = '';
    document.getElementById('state').value = '';

    getAllStudent();
  } catch (error) {
    console.error("Error:", error);
  }
}

function selectStudent(event, data) {
  const checkboxes = document.querySelectorAll('.student_checkbox');

  checkboxes.forEach(checkbox => {
    if (checkbox.id !== `check${data._id}`) {
      checkbox.checked = false;
    }
  });

  if (event.target.checked) {
    student_id = data._id;
    document.getElementById('student_update_btn').disabled = false;
    document.getElementById('student_add_btn').disabled = true;
    document.getElementById('name').value = data.name;
    document.getElementById('IEPduedate').value = data.IEPduedate.split("T")[0];
    document.getElementById('phonenumber').value = data.phonenumber;
    document.getElementById('address').value = data.address;
    document.getElementById('postalcode').value = data.postalcode;
    document.getElementById('country').value = data.country;
    document.getElementById('state').value = data.state;
  } else {
    student_id = null;
    document.getElementById('student_update_btn').disabled = true;
    document.getElementById('student_add_btn').disabled = false;
    document.getElementById('name').value = '';
    document.getElementById('IEPduedate').value = '';
    document.getElementById('phonenumber').value = '';
    document.getElementById('address').value = '';
    document.getElementById('postalcode').value = '';
    document.getElementById('country').value = '';
    document.getElementById('state').value = '';
  }
}

function selectStudentToDelete(event, data) {
  if (event.target.checked) {
    document.getElementById('del_student_btn').disabled = false;
    studentIds.push(data._id)
  } else {
    studentIds = studentIds.filter((item) => item !== data._id)
    if (studentIds.length === 0) document.getElementById('del_student_btn').disabled = true;
  }
}

async function getAllStudent(event) {
  try {
    document.getElementById('loader').style.display = 'flex';
    const response = await fetch(`${base_url}/admin/get-all-student`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": userDetail.token
      }
    });

    all_student_list = await response.json();

    let element = '';
    let element1 = '';
    let element2 = '<option value="" selected>Select Student ID</option>';
    let element3 = '';
    let element4 = '<option value="" disabled selected>Select Student</option>';



    for (const item of all_student_list) {
      element += `<tr>
      <td>
        <div class="form-check">
          <input onclick="selectStudent(event,${JSON.stringify(item).split('"').join("&quot;")})" class="form-check-input student_checkbox" type="checkbox" id=check${item._id}>
        </div>
      </td>
      <td>${item._id}</td>
      <td>${item.name}</td>
      <td>${item.address}</td>
      <td>${item.postalcode}</td>
      <td>${item.phonenumber}</td>
      <td>${item.state}</td>
      <td>${item.country}</td>
      <td>${item.IEPduedate.split('T')[0]}</td>
    </tr>`

      element1 += `<tr>
      <td>
        <div class="form-check">
          <input onclick="selectStudentToDelete(event,${JSON.stringify(item).split('"').join("&quot;")})" class="form-check-input" type="checkbox" id=delcheck${item._id}>
        </div>
      </td>
      <td>${item._id}</td>
      <td>${item.name}</td>
      <td>${item.IEPduedate.split('T')[0]}</td>
    </tr>`

      element2 += `<option value=${item._id}>${item._id}</option>`

      element3 += `<tr>
      <td>${item._id}</td>
      <td>${item.name}</td>
    </tr>`

      element4 += `<option value=${item._id}>${item.name}</option>`

    }

    if (window.location.pathname.includes('dashboard')) {
      document.getElementById('dash_student_table').innerHTML = element1;
    } else if (window.location.pathname.includes('studentform')) {
      document.getElementById('student_table').innerHTML = element;
    } else if (window.location.pathname.includes('appointmentform')) {
      document.getElementById('studentid').innerHTML = element2;
      document.getElementById('student_form_table').innerHTML = element3;
    } else if (window.location.pathname.includes('reports')) {
      document.getElementById('filterByStudentName').innerHTML = element4;
    }

  } catch (error) {
    console.error("Error:", error);
  }finally{
    document.getElementById('loader').style.display = 'none';
  }
}

if (userDetail) {
  getAllStudent();
}


async function deleteStudent() {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete this student!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      try {
        studentIds.map(async (id, index) => {
          await fetch(
            `${base_url}/admin/delete-student/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "Authorization": userDetail.token
              },
            }
          );
          if (index === studentIds.length - 1) {
            getAllStudent();
            Swal.fire({ icon: "success", text: 'Selected student deleted successfully' });
          }
        })
      } catch (error) {
        console.log(error);
      }
    }
  });
}

async function updateStudent() {
  const name = document.getElementById('name').value;
  const IEPduedate = document.getElementById('IEPduedate').value;
  const phonenumber = document.getElementById('phonenumber').value;
  const address = document.getElementById('address').value;
  const postalcode = document.getElementById('postalcode').value;
  const country = document.getElementById('country').value;
  const state = document.getElementById('state').value;

  try {
    document.getElementById('loader').style.display = 'flex';
    const response = await fetch(`${base_url}/admin/update-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": userDetail.token
      },
      body: JSON.stringify({ _id: student_id, name, IEPduedate, phonenumber, address, postalcode, country, state }),
    });
    const result = await response.json();
    document.getElementById('name').value = '';
    document.getElementById('IEPduedate').value = '';
    document.getElementById('phonenumber').value = '';
    document.getElementById('address').value = '';
    document.getElementById('postalcode').value = '';
    document.getElementById('country').value = '';
    document.getElementById('state').value = '';
    document.getElementById('student_update_btn').disabled = true;
    document.getElementById('student_add_btn').disabled = false;
    getAllStudent();
  } catch (error) {
    console.error("Error:", error);
  }
}

// ========================Appointment-section==========================
function addUpdateAppointment(event) {
  event.preventDefault();
  if (appointment_id) {
    updateAppointment();
  } else {
    addAppointment();
  }
}

async function addAppointment() {
  const startdate = document.getElementById('startdate').value;
  const enddate = document.getElementById('enddate').value;
  const studentid = document.getElementById('studentid').value;
  const appointmenttype = document.getElementById('appointmenttype').value;
  const teachername = document.getElementById('teachername').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const location = document.getElementById('location').value;
  const fileholder = document.getElementById('fileholder').value;

  try {
    document.getElementById('loader').style.display = 'flex';
    const response = await fetch(`${base_url}/admin/add-appointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": userDetail.token
      },
      body: JSON.stringify({ startdate, enddate, studentid, appointmenttype, teachername, title, description, location, fileholder }),
    });

    const result = await response.json();
    getAllAppointment();
    document.getElementById('startdate').value = '';
    document.getElementById('enddate').value = '';
    document.getElementById('studentid').value = '';
    document.getElementById('appointmenttype').value = '';
    document.getElementById('teachername').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('location').value = '';
    document.getElementById('fileholder').value = '';
  } catch (error) {
    console.error("Error:", error);
  }
}


function selectUpdateAppointment(event, data) {
  const checkboxes = document.querySelectorAll('.appoint_checkbox');

  checkboxes.forEach(checkbox => {
    if (checkbox.id !== `appointcheck${data._id}`) {
      checkbox.checked = false;
    }
  });

  if (event.target.checked) {
    appointment_id = data._id;

    document.getElementById('appointment_update_btn').disabled = false;
    document.getElementById('appointment_add_btn').disabled = true;

    const hr = new Date(data.startdate).getHours();
    const hrstr = JSON.stringify(hr).length>1 ?hr:`0${hr}`
    const min = new Date(data.startdate).getMinutes();
    const minstr = JSON.stringify(min).length>1 ?min:`0${min}`
    const hr1 = new Date(data.enddate).getHours();
    const hr1str = JSON.stringify(hr1).length>1 ?hr1:`0${hr1}`
    const min1 = new Date(data.enddate).getMinutes();
    const min1str = JSON.stringify(min1).length>1 ?min1:`0${min1}`

    document.getElementById('startdate').value = `${data.startdate.split('T')[0]}T${hrstr}:${minstr}`;
    document.getElementById('enddate').value = `${data.enddate.split('T')[0]}T${hr1str}:${min1str}`;
    document.getElementById('studentid').value = data.studentid;
    document.getElementById('appointmenttype').value = data.appointmenttype;
    document.getElementById('teachername').value = data.teachername;
    document.getElementById('title').value = data.title;
    document.getElementById('description').value = data.description;
    document.getElementById('location').value = data.location;
    document.getElementById('fileholder').value = data.fileholder;

  } else {
    appointment_id = null;
    document.getElementById('appointment_update_btn').disabled = true;
    document.getElementById('appointment_add_btn').disabled = false;

    document.getElementById('startdate').value = '';
    document.getElementById('enddate').value = '';
    document.getElementById('studentid').value = '';
    document.getElementById('appointmenttype').value = '';
    document.getElementById('teachername').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('location').value = '';
    document.getElementById('fileholder').value = '';

  }
}

function selectAppointToDelete(event, data) {
  if (event.target.checked) {
    document.getElementById('del_appoint_btn').disabled = false;
    appointmentIds.push(data._id)
  } else {
    appointmentIds = appointmentIds.filter((item) => item !== data._id)
    if (appointmentIds.length === 0) document.getElementById('del_appoint_btn').disabled = true;
  }
}

async function getAllAppointment(event) {
  try {
    const response = await fetch(`${base_url}/admin/get-all-appointment`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": userDetail.token
      }
    });

    all_appointment_list = await response.json();
    let element = '';
    let element1 = '';
    let element2 = '';
    let element3 = '';



    for (const item of all_appointment_list) {
      element += `<tr>
      <td>
        <div class="form-check">
        <input onclick="selectAppointToDelete(event,${JSON.stringify(item).split('"').join("&quot;")})" class="form-check-input" type="checkbox" id=apointdelcheck${item._id}>
        </div>
      </td>
      <td>${item._id}</td>
      <td>${item.studentid}</td>
      <td>${item.appointmenttype}</td>
      <td>${item.teachername}</td>
      <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
      <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
      <td>${item.title}</td>
      <td>${item.description}</td>
      <td>${item.location}</td>
      <td>${item.fileholder}</td>
    </tr>`

      element1 += `<tr>
      <td>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
          <input onclick="selectUpdateAppointment(event,${JSON.stringify(item).split('"').join("&quot;")})" class="form-check-input appoint_checkbox" type="checkbox" id=appointcheck${item._id}>
        </div>
      </td>
      <td>${item._id}</td>
      <td>${item.title}</td>
      <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
      <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
      <td>${item.studentid}</td>
    </tr>`

      element2 += `<tr>
    <td>${item._id}</td>
    <td>${item.appointmenttype}</td>
    <td>${item.studentid}</td>
    <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
    <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
  </tr>`

      element3 += `<tr>
  <td>${item._id}</td>
  <td>${item.title}</td>
  <td>${item.appointmenttype}</td>
  <td>${item.description}</td>
  <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
  <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
  <td>${item.studentid}</td>
  <td>${item.teachername}</td>
</tr>`

    }

    if (window.location.pathname.includes('dashboard')) {
      document.getElementById('appointment_table').innerHTML = element;
    } else if (window.location.pathname.includes('appointmentform')) {
      document.getElementById('appointment_form_table').innerHTML = element1;
    } else if (window.location.pathname.includes('reports')) {
      document.getElementById('appointment_reports').innerHTML = element2;
      document.getElementById('student_reports').innerHTML = element3;
      document.getElementById('teacher_reports').innerHTML = element3;
    }

  } catch (error) {
    console.error("Error:", error);
  }finally{
    document.getElementById('loader').style.display = 'none';
  }
}

if (window.location.pathname.includes('reports') || window.location.pathname.includes('appointmentform') || window.location.pathname.includes('dashboard')) {
  if (userDetail) {
    getAllAppointment();
  }
}

async function deleteAppointment() {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete this appointment!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      try {
        appointmentIds.map(async (id) => {
          await fetch(
            `${base_url}/admin/delete-appointment/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "Authorization": userDetail.token
              },
            }
          );
          getAllAppointment();
          Swal.fire({ icon: "success", text: 'Selected appointment deleted successfully' });
        })
      } catch (error) {
        console.log(error);
      }
    }
  });
}

async function updateAppointment() {
  const startdate = document.getElementById('startdate').value;
  const enddate = document.getElementById('enddate').value;
  const studentid = document.getElementById('studentid').value;
  const appointmenttype = document.getElementById('appointmenttype').value;
  const teachername = document.getElementById('teachername').value;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const location = document.getElementById('location').value;
  const fileholder = document.getElementById('fileholder').value;

  try {
    document.getElementById('loader').style.display = 'flex';
    const response = await fetch(`${base_url}/admin/update-appointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": userDetail.token
      },
      body: JSON.stringify({ _id: appointment_id, startdate, enddate, studentid, appointmenttype, teachername, title, description, location, fileholder }),
    });
    const result = await response.json();
    document.getElementById('startdate').value = '';
    document.getElementById('enddate').value = '';
    document.getElementById('studentid').value = '';
    document.getElementById('appointmenttype').value = '';
    document.getElementById('teachername').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('location').value = '';
    document.getElementById('fileholder').value = '';
    document.getElementById('appointment_update_btn').disabled = true;
    document.getElementById('appointment_add_btn').disabled = false;
    getAllAppointment();
  } catch (error) {
    console.error("Error:", error);
  }
}



// =======================serach==============

function serachStudent(event) {
  const search = event.target.value;
  searchValue = search.trim();
  const result = all_student_list.filter((item) => {
    return item._id.toLowerCase().includes(searchValue.toLowerCase()) || item.name.toLowerCase().includes(searchValue.toLowerCase());
  });

  let element = '';
  let element1 = '';
  let element3 = '';


  for (const item of result) {
    element1 += `<tr>
    <td>
      <div class="form-check">
        <input onclick="selectStudentToDelete(event,${JSON.stringify(item).split('"').join("&quot;")})" class="form-check-input" type="checkbox" id=delcheck${item._id}>
      </div>
    </td>
    <td>${item._id}</td>
    <td>${item.name}</td>
    <td>${item.IEPduedate.split('T')[0]}</td>
  </tr>`

    element += `<tr>
  <td>
    <div class="form-check">
      <input onclick="selectStudent(event,${JSON.stringify(item).split('"').join("&quot;")})" class="form-check-input student_checkbox" type="checkbox" id=check${item._id}>
    </div>
  </td>
  <td>${item._id}</td>
  <td>${item.name}</td>
  <td>${item.address}</td>
  <td>${item.postalcode}</td>
  <td>${item.phonenumber}</td>
  <td>${item.state}</td>
  <td>${item.country}</td>
  <td>${item.IEPduedate.split('T')[0]}</td>
</tr>`

    element3 += `<tr>
<td>${item._id}</td>
<td>${item.name}</td>
</tr>`

  }

  if (window.location.pathname.includes('dashboard')) {
    document.getElementById('dash_student_table').innerHTML = element1;
  } else if (window.location.pathname.includes('studentform')) {
    document.getElementById('student_table').innerHTML = element;
  } else if (window.location.pathname.includes('appointmentform')) {
    document.getElementById('student_form_table').innerHTML = element3;
  }


}

function serachAppointment(event) {
  const search = event.target.value;
  searchValue = search.trim();
  const result = all_appointment_list.filter((item) => {
    return item._id.toLowerCase().includes(searchValue.toLowerCase()) || item.title.toLowerCase().includes(searchValue.toLowerCase());
  });

  let element = '';
  let element1 = '';

  for (const item of result) {
    element += `<tr>
    <td>
      <div class="form-check">
      <input onclick="selectAppointToDelete(event,${JSON.stringify(item).split('"').join("&quot;")})" class="form-check-input" type="checkbox" id=apointdelcheck${item._id}>
      </div>
    </td>
    <td>${item._id}</td>
    <td>${item.studentid}</td>
    <td>${item.appointmenttype}</td>
    <td>${item.teachername}</td>
    <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
    <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
    <td>${item.title}</td>
    <td>${item.description}</td>
    <td>${item.location}</td>
    <td>${item.fileholder}</td>
  </tr>`

    element1 += `<tr>
  <td>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
      <input onclick="selectUpdateAppointment(event,${JSON.stringify(item).split('"').join("&quot;")})" class="form-check-input appoint_checkbox" type="checkbox" id=appointcheck${item._id}>
    </div>
  </td>
  <td>${item._id}</td>
  <td>${item.title}</td>
  <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
  <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
  <td>${item.studentid}</td>
</tr>`
  }

  if (window.location.pathname.includes('dashboard')) {
    document.getElementById('appointment_table').innerHTML = element;
  } else if (window.location.pathname.includes('appointmentform')) {
    document.getElementById('appointment_form_table').innerHTML = element1;
  }
}

function filterByType(event) {
  const search = event.target.value;
  const result = all_appointment_list.filter((item) => item.appointmenttype === search);

  let element = '';

  for (const item of result) {
    element += `<tr>
    <td>${item._id}</td>
    <td>${item.appointmenttype}</td>
    <td>${item.studentid}</td>
    <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
    <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
  </tr>`
  }

  if (window.location.pathname.includes('reports')) {
    document.getElementById('appointment_reports').innerHTML = element;
  }
}

function filterByStudentName(event) {
  const search = event.target.value;
  const result = all_appointment_list.filter((item) => item.studentid === search);

  let element = '';

  for (const item of result) {
    element += `<tr>
    <td>${item._id}</td>
    <td>${item.title}</td>
    <td>${item.appointmenttype}</td>
    <td>${item.description}</td>
    <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
    <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
    <td>${item.studentid}</td>
    <td>${item.teachername}</td>
  </tr>`
  }

  if (window.location.pathname.includes('reports')) {
    document.getElementById('student_reports').innerHTML = element;
  }
}

function filterByTeacherName(event) {
  const search = event.target.value;
  const result = all_appointment_list.filter((item) => item.teachername === search);

  let element = '';

  for (const item of result) {
    element += `<tr>
    <td>${item._id}</td>
    <td>${item.title}</td>
    <td>${item.appointmenttype}</td>
    <td>${item.description}</td>
    <td>${item.startdate.split('T')[0]}/${new Date(item.startdate).getHours()}:${new Date(item.startdate).getMinutes()}</td>
    <td>${item.enddate.split('T')[0]}/${new Date(item.enddate).getHours()}:${new Date(item.enddate).getMinutes()}</td>
    <td>${item.studentid}</td>
    <td>${item.teachername}</td>
  </tr>`
  }

  if (window.location.pathname.includes('reports')) {
    document.getElementById('teacher_reports').innerHTML = element;
  }
}

function resetTable() {
  getAllAppointment();
}

function goBack(){
  window.history.back()
}