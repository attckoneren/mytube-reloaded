const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const li = document.querySelector(".video__comment");
const deleteBtn = document.querySelectorAll("#deleteBtn");

const commentOption = document.getElementById("commentOption");

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = `  ${text}`;
  const optionIcon = document.createElement("i");
  icon.className = "fas fa-ellipsis-vertical";
  const option = document.createElement("div");
  option.className = "hidden";
  const deleteBtn = document.createElement("span");
  deleteBtn.innerText = "clear";
  deleteBtn.id = "deleteBtn";
  const editBtn = document.createElement("span");
  editBtn.innerText = "Edit";
  editBtn.id = "editBtn";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  optionIcon.appendChild(option);
  option.appendChild(deleteBtn);
  option.appendChild(editBtn);
  newComment.appendChild(optionIcon);
  videoComments.prepend(newComment);
  deleteBtn.addEventListener("click", handleDeleteComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const { id } = videoContainer.dataset;
  if (text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/videos/${id}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";
  if (response.status === 201) {
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  const handleDeleteComment = async (event) => {
    const li = event.target.parentElement;
    const commentId = event.target.parentElement.dataset.id;
    const response = await fetch(`/api/comments/${commentId}/delete`, {
      method: "DELETE",
    });
    if (response.status === 200) {
      li.remove();
    }
  };
  if (deleteBtn) {
    deleteBtn.forEach((btn) =>
      btn.addEventListener("click", handleDeleteComment)
    );
  }
};
