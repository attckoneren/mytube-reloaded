const ownerInfo = document.querySelector(".ownerInfo");
const subsBtn = document.querySelector(".subsBtn");
const subsBtnText = document.querySelector(".subsBtnText");

const profileSubsBtn = document.querySelector(".profileSubsBtn");
const profileData = document.querySelector(".exist-user");

const subsCounting = async (subsCount) => {
  const ownerSubs = document.querySelector(".ownerSubs");
  ownerSubs.innerText = `${subsCount} ${
    subsCount === 0 || subsCount === 1 ? "subscriber" : "subscribers"
  }`;
};

const handelVideoSubs = async () => {
  const { id } = ownerInfo.dataset;
  const response = await fetch(`/api/users/${id}/subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status === 200) {
    const { subsCount, isSubscribed } = await response.json();
    subsCounting(subsCount);
    if (isSubscribed) {
      subsBtnText.innerText = "Unsubscribe";
      subsBtn.className = "subsBtn subs";
    } else {
      subsBtnText.innerText = "Subscribe";
      subsBtn.className = "subsBtn";
    }
  }
};
if (ownerInfo) {
  subsBtn.addEventListener("click", handelVideoSubs);
}

const handelProfileSubs = async () => {
  const { id } = profileData.dataset;
  const response = await fetch(`/api/users/${id}/subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status === 200) {
    const { subsCount, isSubscribed } = await response.json();
    subsCounting(subsCount);
    if (isSubscribed) {
      subsBtnText.innerText = "Unsubscribe";
      subsBtn.className = "subsBtn subs";
    } else {
      subsBtnText.innerText = "Subscribe";
      subsBtn.className = "subsBtn";
    }
  }
};
if (profileData) {
  subsBtn.addEventListener("click", handelProfileSubs);
}
