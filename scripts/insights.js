const params = new URLSearchParams(window.location.search);
const campaignId = params.get("id");
const pledgesTable = document.getElementById("pledges-table").querySelector("tbody");
const message = document.getElementById("message");

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
  alert("You must be logged in");
  window.location.href = "login.html";
}

async function fetchCampaign() {
  const res = await fetch(`http://localhost:3000/campaigns/${campaignId}`);
  const campaign = await res.json();

  if (campaign.creatorId !== user.id) {
    alert("You cannot view this campaign's pledges");
    window.location.href = "index.html";
    return;
  }

  fetchPledges();
}

async function fetchPledges() {
  try {
    const res = await fetch(`http://localhost:3000/pledges?campaignId=${campaignId}`);
    const pledges = await res.json();

    if (pledges.length === 0) {
      message.textContent = "No pledges yet for this campaign.";
      return;
    }

    const usersRes = await fetch("http://localhost:3000/users");
    const users = await usersRes.json();

    pledgesTable.innerHTML = "";

    pledges.forEach(p => {
      const userName = users.find(u => u.id === p.userId)?.name || "Unknown";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${userName}</td>
        <td>$${p.amount}</td>
        <td>${p.date}</td>
      `;
      pledgesTable.appendChild(row);
    });
  } catch (error) {
    console.error(error);
    message.textContent = "Failed to fetch pledges.";
  }
}

fetchCampaign();
