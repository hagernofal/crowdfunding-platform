document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("header nav");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!nav) return;

  if (user) {
    let adminLink = "";
    if (user.role === "admin") {
      adminLink = `<a href="admin.html">Admin Dashboard</a>`;
    }

    nav.innerHTML = `
      <span>Hello, ${user.name}</span>
      <a href="index.html">Home</a>
      ${adminLink}
      <a href="pledges.html">My Pledges</a>
      <a href="create-campaign.html">Create Campaign</a>
      <a href="#" id="logout">Logout</a>
    `;

    document.getElementById("logout").addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  } else {
    nav.innerHTML = `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
      <a href="index.html">Home</a>
    `;
  }
});

const campaignsContainer = document.getElementById("campaigns-container");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

async function fetchApprovedCampaigns() {
  try {
    const res = await fetch("http://localhost:3000/campaigns?isApproved=true");
    const campaigns = await res.json();

    const pledgesRes = await fetch("http://localhost:3000/pledges");
    const pledges = await pledgesRes.json();

    const user = JSON.parse(localStorage.getItem("user"));
    campaignsContainer.innerHTML = "";

    if (campaigns.length === 0) {
      displayNoResults();
      return;
    }

    campaigns.forEach(campaign => {
      const totalRaised = pledges
        .filter(p => p.campaignId === campaign.id)
        .reduce((sum, p) => sum + p.amount, 0);

      const card = document.createElement("div");
      card.className = "campaign-card";
      card.innerHTML = `
        <h3>${campaign.title}</h3>
        <p>${campaign.description || "No description added yet"}</p>
        <img src="${campaign.image || "assets/default.png"}" 
              alt="${campaign.title}" 
              style="width:200px; display:block; margin-bottom:10px;">
        <p>Goal: $${campaign.goal}</p>
        <p>Deadline: ${campaign.deadline}</p>
        <p>Raised: $${totalRaised}</p>
      `;

      if (user) {
        const donateBtn = document.createElement("button");
        donateBtn.textContent = "Donate";
        donateBtn.className = "donate-btn";
        donateBtn.onclick = () => goToDonate(campaign.id);
        card.appendChild(donateBtn);
      }

      if (user && campaign.creatorId === user.id) {
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.onclick = () => window.location.href = `edit-campaign.html?id=${campaign.id}`;
        card.appendChild(editBtn);

        const insightsBtn = document.createElement("button");
        insightsBtn.textContent = "View Insights";
        insightsBtn.className = "insights-btn";
        insightsBtn.onclick = () => window.location.href = `insights.html?id=${campaign.id}`;
        card.appendChild(insightsBtn);
      }

      if (totalRaised === 0) {
        const noPledge = document.createElement("p");
        noPledge.textContent = "No pledges yet";
        noPledge.style.fontStyle = "italic";
        card.appendChild(noPledge);
      }

      campaignsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    campaignsContainer.innerHTML = "<p>Failed to load campaigns.</p>";
  }
}

async function searchCampaigns(query) {
  const user = JSON.parse(localStorage.getItem("user"));
  const response = await fetch(`http://localhost:3000/campaigns?isApproved=true&q=${query}`);
  const campaigns = await response.json();

  campaignsContainer.innerHTML = "";
  if (campaigns.length === 0) {
    displayNoResults();
    return;
  }

  campaigns.forEach(campaign => {

    const card = document.createElement("div");
    card.className = "campaign-card";
    card.innerHTML = `
      <h3>${campaign.title}</h3>
      <p>${campaign.description || "No description added yet"}</p>
      <p>Category: ${campaign.category}</p>
      <img src="${campaign.image || "/assets/default.png"}" 
            alt="${campaign.title}" 
            style="width:200px; display:block; margin-bottom:10px;">
      <p>Goal: $${campaign.goal}</p>
      <p>Deadline: ${campaign.deadline}</p>
    `;
    
    if (user) {
      const donateBtn = document.createElement("button");
      donateBtn.textContent = "Donate";
      donateBtn.className = "donate-btn";
      donateBtn.onclick = () => goToDonate(campaign.id);
      card.appendChild(donateBtn);
    }

    if (user && campaign.creatorId === user.id) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "edit-btn";
      editBtn.onclick = () => window.location.href = `edit-campaign.html?id=${campaign.id}`;
      card.appendChild(editBtn);

      const insightsBtn = document.createElement("button");
      insightsBtn.textContent = "View Insights";
      insightsBtn.className = "insights-btn";
      insightsBtn.onclick = () => window.location.href = `insights.html?id=${campaign.id}`;
      card.appendChild(insightsBtn);
    }

    campaignsContainer.appendChild(card);
  });
}

function displayNoResults() {
  const noResult = document.createElement("div");
  noResult.innerHTML = `
    <img src="assets/no-results.png" alt="No results found" 
        style="width:300px; display:block; margin:auto;">
    <p style="text-align:center; color:#555;">No campaigns found</p>
  `;
  campaignsContainer.appendChild(noResult);
}

function goToDonate(campaignId) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token) {
    alert("You must be logged in to donate! Please login or register first.");
    window.location.href = "login.html"; 
    return;
  }

  window.location.href = `donate.html?campaignId=${campaignId}`;
}

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    searchCampaigns(query);
  } else {
    fetchApprovedCampaigns();
  }
});

searchInput.addEventListener("keyup", event => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      searchCampaigns(query);
    } else {
      fetchApprovedCampaigns();
    }
  }
});
const categoryFilter = document.getElementById("categoryFilter");
const filterBtn = document.getElementById("filterBtn");

filterBtn.addEventListener("click", () => {
  const category = categoryFilter.value;
  fetchFilteredCampaigns(category);
});

async function fetchFilteredCampaigns(category) {
  let url = `http://localhost:3000/campaigns?isApproved=true&_sort=deadline&_order=asc`;

  if (category) {
    url += `&category=${category}`;
  }

  const res = await fetch(url);
  const campaigns = await res.json();

  const pledgesRes = await fetch("http://localhost:3000/pledges");
  const pledges = await pledgesRes.json();

  const user = JSON.parse(localStorage.getItem("user"));

  campaignsContainer.innerHTML = "";

  if (campaigns.length === 0) {
    displayNoResults();
    return;
  }

  campaigns.forEach(campaign => {
    const totalRaised = pledges
      .filter(p => p.campaignId === campaign.id)
      .reduce((sum, p) => sum + p.amount, 0);

    const card = document.createElement("div");
    card.className = "campaign-card";
    card.innerHTML = `
      <h3>${campaign.title}</h3>
      <p>${campaign.description || "No description added yet"}</p>
      <p>Category: ${campaign.category}</p>
      <img src="${campaign.image || "/assets/default.png"}" 
            alt="${campaign.title}" 
            style="width:200px; display:block; margin-bottom:10px;">
      <p>Goal: $${campaign.goal}</p>
      <p>Deadline: ${campaign.deadline}</p>
      <p>Raised: $${totalRaised}</p>
    `;

    if (user) {
      const donateBtn = document.createElement("button");
      donateBtn.textContent = "Donate";
      donateBtn.className = "donate-btn";
      donateBtn.onclick = () => goToDonate(campaign.id);
      card.appendChild(donateBtn);
    }

    if (user && campaign.creatorId === user.id) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "edit-btn";
      editBtn.onclick = () =>
        window.location.href = `edit-campaign.html?id=${campaign.id}`;
      card.appendChild(editBtn);

      const insightsBtn = document.createElement("button");
      insightsBtn.textContent = "View Insights";
      insightsBtn.className = "insights-btn";
      insightsBtn.onclick = () =>
        window.location.href = `insights.html?id=${campaign.id}`;
      card.appendChild(insightsBtn);
    }

    campaignsContainer.appendChild(card);
  });
}

fetchApprovedCampaigns();
