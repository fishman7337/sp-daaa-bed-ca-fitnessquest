import { api, requireLogin, wireLogout } from "../shared/api.js";
import {
  byId,
  card,
  clear,
  el,
  renderCards,
  setStatus,
} from "../shared/dom.js";

const user = await requireLogin();
wireLogout();

let selectedChallenge;

async function loadChallenges() {
  const challenges = await api("/challenges");
  renderCards(
    byId("challenge-list"),
    challenges,
    (challenge) => {
      const open = el("button", { type: "button", text: "Open" });
      open.addEventListener("click", () =>
        showChallenge(challenge.challenge_id),
      );
      return card(
        challenge.challenge,
        [
          `Creator: ${challenge.creator_name || challenge.creator_id}`,
          `Skillpoints: ${challenge.skillpoints}`,
        ],
        [open],
      );
    },
    "No challenges yet.",
  );
}

async function showChallenge(challengeId) {
  selectedChallenge = await api(`/challenges/${challengeId}`);
  byId("selected-title").textContent = selectedChallenge.challenge;
  byId("selected-meta").textContent =
    `Skillpoints: ${selectedChallenge.skillpoints}`;
  byId("update-challenge").value = selectedChallenge.challenge;
  byId("update-skillpoints").value = selectedChallenge.skillpoints;
  renderCards(
    byId("completion-list"),
    selectedChallenge.completions || [],
    (completion) =>
      card(`User ${completion.username || completion.user_id}`, [
        `Completed: ${completion.completed ? "Yes" : "No"}`,
        `Notes: ${completion.notes || "None"}`,
      ]),
    "No attempts yet.",
  );
  await loadReviews(challengeId);
}

async function loadReviews(challengeId) {
  const reviews = await api(`/reviews/challenges/${challengeId}`);
  renderCards(
    byId("review-list"),
    reviews,
    (review) => {
      const actions = [];
      if (user && Number(review.user_id) === Number(user.user_id)) {
        const remove = el("button", {
          type: "button",
          className: "danger",
          text: "Delete",
        });
        remove.addEventListener("click", async () => {
          await api(`/reviews/${review.id}`, { method: "DELETE" });
          await loadReviews(challengeId);
        });
        actions.push(remove);
      }
      return card(
        review.username || `User ${review.user_id}`,
        [`Rating: ${review.review_amt}/5`],
        actions,
      );
    },
    "No reviews yet.",
  );
}

byId("create-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = byId("create-status");
  try {
    await api("/challenges", {
      method: "POST",
      body: {
        challenge: byId("create-challenge").value,
        skillpoints: byId("create-skillpoints").value,
      },
    });
    event.target.reset();
    setStatus(status, "Challenge created.");
    await loadChallenges();
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

byId("complete-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedChallenge) return;
  const status = byId("action-status");
  try {
    await api(`/challenges/${selectedChallenge.challenge_id}`, {
      method: "POST",
      body: {
        completed: byId("complete-value").value,
        notes: byId("complete-notes").value,
      },
    });
    event.target.reset();
    setStatus(status, "Attempt recorded.");
    await showChallenge(selectedChallenge.challenge_id);
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

byId("update-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedChallenge) return;
  const status = byId("action-status");
  try {
    await api(`/challenges/${selectedChallenge.challenge_id}`, {
      method: "PUT",
      body: {
        challenge: byId("update-challenge").value,
        skillpoints: byId("update-skillpoints").value,
      },
    });
    setStatus(status, "Challenge updated.");
    await loadChallenges();
    await showChallenge(selectedChallenge.challenge_id);
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

byId("delete-challenge").addEventListener("click", async () => {
  if (!selectedChallenge) return;
  const status = byId("action-status");
  try {
    await api(`/challenges/${selectedChallenge.challenge_id}`, {
      method: "DELETE",
    });
    selectedChallenge = undefined;
    byId("selected-title").textContent = "Select a challenge";
    byId("selected-meta").textContent = "Challenge details will appear here.";
    clear(byId("completion-list"));
    clear(byId("review-list"));
    setStatus(status, "Challenge deleted.");
    await loadChallenges();
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

byId("review-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedChallenge) return;
  const status = byId("review-status");
  try {
    await api("/reviews", {
      method: "POST",
      body: {
        challenge_id: selectedChallenge.challenge_id,
        review_amt: byId("review-amount").value,
      },
    });
    event.target.reset();
    setStatus(status, "Review saved.");
    await loadReviews(selectedChallenge.challenge_id);
  } catch (error) {
    setStatus(status, error.message, true);
  }
});

await loadChallenges();
