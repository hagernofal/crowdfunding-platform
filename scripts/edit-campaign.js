const params = new URLSearchParams(window.location.search);
const campaignId = params.get("id");
const form = document.getElementById("edit-campaign-form");
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
    alert("You cannot edit this campaign");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("title").value = campaign.title;
  document.getElementById("description").value = campaign.description;
  document.getElementById("goal").value = campaign.goal;
  document.getElementById("deadline").value = campaign.deadline;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedCampaign = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    goal: Number(document.getElementById("goal").value),
    deadline: document.getElementById("deadline").value
  };

  const res = await fetch(`http://localhost:3000/campaigns/${campaignId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(updatedCampaign)
  });

  if (res.ok) {
    message.style.color = "green";
    message.textContent = "Campaign updated successfully!";
    setTimeout(() => window.location.href = "index.html", 2000);
  } else {
    message.style.color = "red";
    message.textContent = "Failed to update campaign.";
  }
});

fetchCampaign();
