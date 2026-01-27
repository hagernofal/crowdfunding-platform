const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || user.role !== "admin") {
  alert("Access denied");
  window.location.href = "index.html";
}

const usersTable = document.getElementById("users-table");

async function fetchAllUsers() {
  const res = await fetch("http://localhost:3000/users");
  const users = await res.json();

  usersTable.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>
        <span class="status ${user.isActive ? "status-active" : "status-banned"}">
          ${user.isActive ? "Active" : "Banned"}
        </span>
      </td>
      <td>
        <button class="btn btn-ban" onclick="toggleUser(${user.id}, ${user.isActive})">
          ${user.isActive ? "Ban" : "Unban"}
        </button>
      </td>
    `;
    usersTable.appendChild(row);
  });
}

async function toggleUser(id, isActive) {
  await fetch(`http://localhost:3000/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ isActive: !isActive })
  });

  fetchAllUsers();
}

let usersCache = [];

async function fetchUsersCache() {
  const res = await fetch("http://localhost:3000/users");
  usersCache = await res.json();
}

function getCreatorName(id) {
  const user = usersCache.find(u => u.id === id);
  return user ? user.name : "Unknown";
}

const campaignsTable = document.getElementById("campaigns-table");

async function fetchAllCampaigns() {
  const res = await fetch("http://localhost:3000/campaigns");
  const campaigns = await res.json();

  campaignsTable.innerHTML = "";

  campaigns.forEach(campaign => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${campaign.title}</td>
      <td>${getCreatorName(campaign.creatorId)}</td>
      <td>
        <span class="status ${campaign.isApproved ? "status-approved" : "status-pending"}">
          ${campaign.isApproved ? "Approved" : "Pending"}
        </span>
      </td>
      <td>
        <button class="btn btn-approve" onclick="approveCampaign(${campaign.id})">Approve</button>
        <button class="btn btn-reject" onclick="rejectCampaign(${campaign.id})">Reject</button>
        <button class="btn btn-delete" onclick="deleteCampaign(${campaign.id})">Delete</button>
      </td>
    `;
    campaignsTable.appendChild(row);
  });
}

async function approveCampaign(id) {
  await fetch(`http://localhost:3000/campaigns/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ isApproved: true })
  });

  fetchAllCampaigns();
}

async function rejectCampaign(id) {
  await fetch(`http://localhost:3000/campaigns/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ isApproved: false })
  });

  fetchAllCampaigns();
}

async function deleteCampaign(id) {
  if (!confirm("Are you sure you want to delete this campaign?")) return;

  await fetch(`http://localhost:3000/campaigns/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  fetchAllCampaigns();
}
let campaignsCache = [];
async function fetchCampaignsCache() {
  const res = await fetch("http://localhost:3000/campaigns");
  campaignsCache = await res.json();
}
const pledgesTable = document.getElementById("pledges-table");

function getCampaignTitle(id) {
  const campaign = campaignsCache.find(c => c.id === id);
  return campaign ? campaign.title : "Unknown Campaign";
}

async function fetchAllPledges() {
  const res = await fetch("http://localhost:3000/pledges");
  const pledges = await res.json();

  pledgesTable.innerHTML = "";

  pledges.forEach(pledge => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${usersCache.find(u => u.id === pledge.userId)?.name || "Unknown User"}</td>
      <td>${getCampaignTitle(pledge.campaignId)}</td>
      <td>$${pledge.amount}</td>
      <td>${pledge.date || "Unknown Date"}</td>
    `;

    pledgesTable.appendChild(row);
  });
}
fetchUsersCache().then(() => {
  fetchAllUsers();
  fetchCampaignsCache().then(() => {
    fetchAllCampaigns();
    fetchAllPledges(); 
  });
});
